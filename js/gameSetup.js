// gameSetup.js

// Používanie shuffleDeck z deckManagement.js, preto túto funkciu nebudeme deklarovať znova

// Funkcia na načítanie a inicializáciu balíčka kariet
async function initializeDeck() {
    logMessage("Inicializujem balíček kariet...");
    try {
        const response = await fetch('../json/card.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cards = await response.json();
        gameDeck = shuffleDeck(createGameDeck(cards));
        logMessage(`Balíček úspešne inicializovaný a premiešaný! Počet kariet v balíku: ${gameDeck.length}`);
        renderTopCard();
    } catch (error) {
        console.error("Error loading deck:", error);
        logMessage(`Chyba pri načítaní balíčka! Detail chyby: ${error.message}`);
    }
}

let activePlayer = 'player'; // Globálna premenná na uchovanie aktuálneho hráča

// Funkcia na spustenie hry
async function startGame() {
    logMessage("Spúšťam hru - inicializujem balíček...");
    await initializeDeck();

    logMessage("Inicializácia balíčka dokončená. Rozdávam karty...");
    dealCardsAtStart();

    // Nastavenie začínajúceho hráča
    activePlayer = 'player'; // Môžete zmeniť na 'opponent', ak má začať súper
    logMessage(`Začína hráč: ${activePlayer}`);

    // Nastavíme aktívne a neaktívne tlačidlá a karty
    togglePlayerActivity();

    logMessage("Karty boli úspešne rozdané. Hra začína!");
}

// Funkcia togglePlayerActivity sa už stará o aktiváciu/deaktiváciu tlačidiel


// Funkcia na zobrazenie vrchnej karty z "Kopa ťahania"
function renderTopCard() {
    const deckSection = document.getElementById('drawPile');
    deckSection.innerHTML = ''; // Vymažeme predchádzajúci obsah

    if (gameDeck && gameDeck.length > 0) {
        const topCard = gameDeck[0];
        const cardElement = document.createElement('div');
        cardElement.classList.add('card-back');
        cardElement.addEventListener('click', drawCard);
        deckSection.appendChild(cardElement);
    } else {
        logMessage("Kopa ťahania je prázdna. Miešame karty z kopy odkladania.");
        reshuffleDiscardPile();
    }
}

function drawCard() {
    const card = drawCardFromDeck(); // Získame kartu z balíčka

    if (card) {
        const playerHand = document.getElementById('playerHand');
        const cardElement = document.createElement('div');
        cardElement.classList.add('card', 'active'); // Trieda 'active' pre povolenie interakcie
        cardElement.textContent = card.name;

        // Nastavíme atribúty pre drag-and-drop
        cardElement.setAttribute('draggable', true);
        cardElement.setAttribute('data-card-name', card.name);
        cardElement.addEventListener('dragstart', drag);
        cardElement.addEventListener('click', (event) => showCardMenu(event, cardElement));

        playerHand.appendChild(cardElement);
        renderTopCard();
        logMessage(`Karta ${card.name} bola pridaná medzi tvoje karty.`);
    } else {
        logMessage("Nie je možné pridať kartu.");
    }
}


// Funkcia na rozdanie kariet na začiatku hry
function dealCardsAtStart() {
    logMessage("Rozdávam karty na začiatku hry...");

    if (!gameDeck || gameDeck.length === 0) {
        logMessage("Chyba: Balíček je prázdny alebo neexistuje.");
        return;
    }

    logMessage(`Počet kariet v balíčku pred rozdávaním: ${gameDeck.length}`);

    for (let i = 0; i < 5; i++) {
        // Rozdáme kartu hráčovi
        const playerCard = gameDeck.shift();
        if (playerCard) {
            logMessage(`Pridávam kartu hráčovi: ${playerCard.name}`);
            addCardToHand(playerCard, 'playerHand', false); // Pridáme kartu do hráčovej ruky s atribútmi
        } else {
            logMessage("Chyba: Nie je dostatok kariet v balíčku pre hráča.");
        }

        // Rozdáme kartu súperovi
        const opponentCard = gameDeck.shift();
        if (opponentCard) {
            logMessage(`Pridávam kartu súperovi: ${opponentCard.name}`);
            addCardToHand(opponentCard, 'opponentHand', true); // Pridáme kartu do súperovej ruky
        } else {
            logMessage("Chyba: Nie je dostatok kariet v balíčku pre súpera.");
        }
    }

    logMessage(`Počet kariet v balíčku po rozdávaní: ${gameDeck.length}`);
}

// Funkcia na pridanie karty do ruky hráča alebo súpera
function addCardToHand(card, handId, isOpponent) {
    const hand = document.getElementById(handId);
    if (!hand) {
        logMessage(`Chyba: Element s id ${handId} nebol nájdený.`);
        return;
    }

    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    if (!isOpponent) {
        cardElement.classList.add('active'); // Pridá triedu active pre interaktívne karty hráča
        cardElement.setAttribute('draggable', true); // Nastaví kartu ako presúvateľnú
        cardElement.setAttribute('data-card-name', card.name);
        cardElement.addEventListener('dragstart', drag); // Pridá event pre začiatok presunu
        cardElement.addEventListener('click', (event) => showCardMenu(event, cardElement)); // Aktivuje kontextové menu na kliknutie
        cardElement.textContent = card.name;
    } else {
        cardElement.textContent = '🂠'; // Skryje názov karty súpera
    }

    hand.appendChild(cardElement);
    logMessage(`Karta ${card.name} bola pridaná do ${handId}.`);
}



// Funkcia pre ukončenie ťahu
function endTurn(player) {
    if (player === activePlayer) {
        activePlayer = player === 'player' ? 'opponent' : 'player';
        logMessage(`Hráč ${player} ukončil svoj ťah.`);
        togglePlayerActivity();
    }
}

// Funkcia na aktiváciu/deaktiváciu činností hráča
function togglePlayerActivity() {
    const playerCards = document.querySelectorAll('#playerHand .card');
    const opponentCards = document.querySelectorAll('#opponentHand .card');
    const playerSlots = document.querySelectorAll('#playerSlot1, #playerSlot2');
    const opponentSlots = document.querySelectorAll('#opponentSlot1, #opponentSlot2');

    if (activePlayer === 'player') {
        // Aktivujeme hráčove karty a sloty
        playerCards.forEach(card => card.classList.add('active'));
        playerSlots.forEach(slot => slot.classList.add('active'));

        // Deaktivujeme súperove karty a sloty
        opponentCards.forEach(card => card.classList.remove('active'));
        opponentSlots.forEach(slot => slot.classList.remove('active'));

        document.getElementById('playerEndTurn').disabled = false;
        document.getElementById('opponentEndTurn').disabled = true;

    } else {
        // Aktivujeme súperove karty a sloty
        opponentCards.forEach(card => card.classList.add('active'));
        opponentSlots.forEach(slot => slot.classList.add('active'));

        // Deaktivujeme hráčove karty a sloty
        playerCards.forEach(card => card.classList.remove('active'));
        playerSlots.forEach(slot => slot.classList.remove('active'));

        document.getElementById('opponentEndTurn').disabled = false;
        document.getElementById('playerEndTurn').disabled = true;
    }
}

