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
let playerHand = [];
let opponentHand = [];


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

function drawCardFromDeck() {
    if (gameDeck.length === 0) {
        logMessage("Kopa ťahania je prázdna. Skúšam zamiešať karty z kopy odkladania.");
    }
    return gameDeck.length ? gameDeck.shift() : reshuffleDiscardPile();
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
    cardElement.setAttribute('data-card-name', card.name);
    cardElement.setAttribute('data-id', card.id); // Použitie jedinečného ID
    cardElement.setAttribute('data-player', isOpponent ? 'opponent' : 'player');

    cardElement.textContent = card.name;
    cardElement.setAttribute('draggable', true);
    cardElement.addEventListener('dragstart', drag);
    cardElement.addEventListener('click', (event) => showCardMenu(event, cardElement));

    // Pridanie do poľa správneho hráča
    if (isOpponent) {
        opponentHand.push(card);
        logMessage(`Pridaná karta do ruky súpera: ${JSON.stringify(card)}`);
    } else {
        playerHand.push(card);
        logMessage(`Pridaná karta do ruky hráča: ${JSON.stringify(card)}`);
    }

    hand.appendChild(cardElement);
}

function removeCardFromHand(cardId, player) {
    const hand = player === 'player' ? playerHand : opponentHand;
    const handElement = document.getElementById(player === 'player' ? 'playerHand' : 'opponentHand');

    // Vyhľadanie a odstránenie karty v poli hráča na základe ID
    const cardIndex = hand.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
        hand.splice(cardIndex, 1);
        logMessage(`Odstránená karta z poľa hráča ${player}: ID ${cardId}`);
    }

    // Odstránenie karty z DOM pomocou ID
    const cardElement = handElement.querySelector(`[data-id="${cardId}"]`);
    if (cardElement) {
        handElement.removeChild(cardElement);
        logMessage(`Odstránená karta z DOM hráča ${player}: ID ${cardId}`);
    }
}



// Funkcia pre ukončenie ťahu
function endTurn(player) {
    if (player === activePlayer) {
        // Prepíname aktívneho hráča
        activePlayer = player === 'player' ? 'opponent' : 'player';
        logMessage(`Hráč ${player} ukončil svoj ťah. Teraz je na ťahu: ${activePlayer}`);

        // Doplníme karty na ruke pre nového aktívneho hráča
        refillHandToFive(activePlayer);

        togglePlayerActivity();
    }
}

// Funkcia na doplnenie kariet na ruke na počet 5 s podrobným logovaním
function refillHandToFive(player) {
    const handId = player === 'player' ? 'playerHand' : 'opponentHand';
    const currentHand = player === 'player' ? playerHand : opponentHand;

    logMessage(`Pred doplnením - počet kariet hráča ${player}: ${currentHand.length}`);

    for (let i = currentHand.length; i < 5; i++) {
        const newCard = drawCardFromDeck();
        if (newCard) {
            addCardToHand(newCard, handId, player === 'opponent');
            logMessage(`Dopĺňanie karty: ${JSON.stringify({
                name: newCard.name,
                id: newCard.id,
                player: player
            })}`);
        } else {
            logMessage("Kopa na ťahanie je prázdna, nemožno doplniť karty.");
            break;
        }
    }

    logMessage(`Po doplnení - počet kariet hráča ${player}: ${currentHand.length}`);
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
        opponentCards.forEach(card => {
            card.classList.add('active');
            card.setAttribute('draggable', true); // Umožníme presúvanie
        });
        opponentSlots.forEach(slot => slot.classList.add('active'));

        // Deaktivujeme hráčove karty a sloty
        playerCards.forEach(card => card.classList.remove('active'));
        playerSlots.forEach(slot => slot.classList.remove('active'));

        document.getElementById('opponentEndTurn').disabled = false;
        document.getElementById('playerEndTurn').disabled = true;
    }
}
