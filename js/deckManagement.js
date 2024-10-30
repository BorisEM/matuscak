// deckManagement.js

let gameDeck = [];
let discardDeck = [];

// Funkcia na načítanie a inicializáciu balíčka kariet
async function initializeDeck() {
    logMessage("Inicializujem balíček kariet...");
    try {
        const response = await fetch('../json/card.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cards = await response.json();

        // Priama definícia funkcie shuffleDeck pre zaistenie dostupnosti
        function shuffleDeck(deck) {
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            return deck;
        }

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
    return gameDeck.length ? gameDeck.shift() : reshuffleDiscardPile();
}

// Zamiešanie karty z discardDeck späť do gameDeck
function reshuffleDiscardPile() {
    if (!discardDeck.length) return null;
    gameDeck = shuffleDeck([...discardDeck]);
    discardDeck = [];
    return drawCardFromDeck();
}
