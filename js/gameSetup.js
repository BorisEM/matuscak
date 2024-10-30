// gameSetup.js

// Globálna definícia funkcie shuffleDeck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Zvyšok kódu, vrátane initializeDeck a startGame
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

// Funkcia startGame, ktorá zavolá initializeDeck a potom rozdá karty a inicializuje hru
async function startGame() {
    logMessage("Spúšťam hru - inicializujem balíček...");
    await initializeDeck(); // Inicializácia balíčka

    logMessage("Inicializácia balíčka dokončená. Rozdávam karty...");
    dealCardsAtStart(); // Rozdanie kariet hráčovi a súperovi

    logMessage("Karty boli úspešne rozdané. Spúšťam hru...");
    initializeGame(); // Nastavenie hry (náhodný výber začínajúceho hráča a ďalšie prvky)
}


// Funkcia na zobrazenie vrchnej karty z "Kopa ťahania"
function renderTopCard() {
    const deckSection = document.getElementById('drawPile');
    deckSection.innerHTML = ''; // Vymažeme predchádzajúci obsah

    if (gameDeck.length > 0) {
        const topCard = gameDeck[0]; // Vrchná karta balíčka
        const cardElement = document.createElement('div');
        cardElement.classList.add('card-back');
        cardElement.addEventListener('click', drawCard); // Pridáme event listener na kliknutie
        deckSection.appendChild(cardElement);
    } else {
        logMessage("Kopa ťahania je prázdna. Miešame karty z kopy odkladania.");
        reshuffleDiscardPile(); // Zamiešame karty z kopy odkladania do kopy ťahania
    }
}


// Funkcia na vytiahnutie karty a pridanie do ruky
function drawCard() {
    const card = gameDeck.shift(); // Vytiahneme vrchnú kartu

    if (card) {
        // Pridáme kartu medzi hráčove karty
        const playerHand = document.getElementById('playerHand');
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.textContent = card.name; // Zobrazíme názov karty

        // Nastavíme atribúty pre drag-and-drop
        cardElement.setAttribute('draggable', true);
        cardElement.setAttribute('data-card-name', card.name);
        cardElement.addEventListener('dragstart', drag); // Event listener pre drag-and-drop
        cardElement.addEventListener('click', (event) => showCardMenu(event, cardElement)); // Aktivujeme kontextové menu

        playerHand.appendChild(cardElement);
        renderTopCard(); // Aktualizujeme vrchnú kartu po vytiahnutí
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
            addCardToHand(playerCard, 'playerHand', false);
        } else {
            logMessage("Chyba: Nie je dostatok kariet v balíčku pre hráča.");
        }

        // Rozdáme kartu súperovi
        const opponentCard = gameDeck.shift();
        if (opponentCard) {
            logMessage(`Pridávam kartu súperovi: ${opponentCard.name}`);
            addCardToHand(opponentCard, 'opponentHand', true);
        } else {
            logMessage("Chyba: Nie je dostatok kariet v balíčku pre súpera.");
        }
    }

    logMessage(`Počet kariet v balíčku po rozdávaní: ${gameDeck.length}`);
}



function addCardToHand(card, handId, isOpponent) {
    const hand = document.getElementById(handId);
    if (!hand) {
        logMessage(`Chyba: Element s id ${handId} nebol nájdený.`);
        return;
    }
    
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.textContent = isOpponent ? '🂠' : card.name;

    // Pridanie do ruky hráča alebo súpera
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

// gameSetup.js

// Funkcia na aktiváciu/deaktiváciu činností hráča
function togglePlayerActivity() {
    const playerCards = document.querySelectorAll('.player-hand .card');
    const opponentCards = document.querySelectorAll('.opponent-hand .card');
    const playerSlots = document.querySelectorAll('#playerSlot1, #playerSlot2');
    const opponentSlots = document.querySelectorAll('#opponentSlot1, #opponentSlot2');

    // Aktivácia/deaktivácia činností pre aktuálneho hráča
    if (activePlayer === 'player') {
        // Aktivujeme hráčove karty a sloty
        playerCards.forEach(card => card.classList.add('active'));
        playerSlots.forEach(slot => slot.classList.add('active'));

        // Deaktivujeme súperove karty a sloty
        opponentCards.forEach(card => card.classList.remove('active'));
        opponentSlots.forEach(slot => slot.classList.remove('active'));

        // Aktivujeme tlačidlo „Ukončiť ťah“ pre hráča a deaktivujeme pre súpera
        document.getElementById('playerEndTurn').disabled = false;
        document.getElementById('opponentEndTurn').disabled = true;

    } else {
        // Aktivujeme súperove karty a sloty
        opponentCards.forEach(card => card.classList.add('active'));
        opponentSlots.forEach(slot => slot.classList.add('active'));

        // Deaktivujeme hráčove karty a sloty
        playerCards.forEach(card => card.classList.remove('active'));
        playerSlots.forEach(slot => slot.classList.remove('active'));

        // Aktivujeme tlačidlo „Ukončiť ťah“ pre súpera a deaktivujeme pre hráča
        document.getElementById('opponentEndTurn').disabled = false;
        document.getElementById('playerEndTurn').disabled = true;
    }
}
