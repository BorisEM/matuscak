// deckManagement.js

let gameDeck = [];
let discardDeck = [];

// Vytvorenie globálneho počítadla ID pre karty
let globalCardIdCounter = 0;

// Funkcia na načítanie a inicializáciu balíčka kariet s jedinečnými ID
async function initializeDeck() {
    logMessage("Inicializujem balíček kariet...");
    try {
        const response = await fetch('../json/card.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cards = await response.json();

        function assignUniqueIds(cards) {
            return cards.map(card => ({
                ...card,
                id: ++globalCardIdCounter // Každej karte priradíme jedinečné ID
            }));
        }

        gameDeck = shuffleDeck(assignUniqueIds(createGameDeck(cards)));
        logMessage(`Balíček úspešne inicializovaný a premiešaný! Počet kariet v balíku: ${gameDeck.length}`);
    } catch (error) {
        console.error("Error loading deck:", error);
        logMessage(`Chyba pri načítaní balíčka! Detail chyby: ${error.message}`);
    }
}


// Globálna definícia funkcie shuffleDeck pre opakované použitie
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Pridáme pri vytváraní kariet unikátny identifikátor pre každú kartu
function createCardObject(cardData, id) {
    return {
        id: id, // Unikátny identifikátor pre kartu
        name: cardData.name,
        ...cardData // Kopíruje ďalšie vlastnosti karty
    };
}


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

// Vytvorenie balíčka s kartami typu "L"
function createGameDeck(cards) {
    return cards.filter(card => card.size.toLowerCase() === 'l').flatMap(card => Array(card.count).fill(card));
}

// Funkcia na ťahanie karty z balíčka
function drawCardFromDeck() {
    if (gameDeck.length === 0) {
        logMessage("Kopa ťahania je prázdna. Skúšam zamiešať karty z kopy odkladania.");
    }
    return gameDeck.length ? gameDeck.shift() : reshuffleDiscardPile();
}

// Zamiešanie karty z discardDeck späť do gameDeck
function reshuffleDiscardPile() {
    if (!discardDeck.length) {
        logMessage("Kopa odkladania je tiež prázdna. Nemožno ťahať ďalšie karty.");
        return null;
    }
    gameDeck = shuffleDeck([...discardDeck]);
    discardDeck = [];
    logMessage("Karty z kopy odkladania boli zamiešané späť do kopy ťahania.");
    return drawCardFromDeck();
}

// Prázdna funkcia na logovanie, ak logMessage nie je definovaná globálne
function logMessage(message) {
    console.log(message); // Pre prípadné riešenie logovania priamo do konzoly
}
