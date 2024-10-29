"use strict";

let gameDeck = []; // Uchováva zamiešaný balíček

// Funkcia na vypísanie správy do chatového logu
function logMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (chatLog) {
        chatLog.innerHTML += `<p>${message}</p>`;
        console.log(`Log: ${message}`);
    } else {
        console.error("Element 'chatLog' nebol nájdený.");
    }
}

// Funkcia na načítanie a inicializáciu balíčka kariet
async function initializeDeck() {
    logMessage("Funkcia initializeDeck bola zavolaná.");
    try {
        const response = await fetch('../json/card.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const cards = await response.json();
        gameDeck = shuffleDeck(createGameDeck(cards));

        logMessage(`Balíček úspešne inicializovaný a premiešaný! Počet kariet v balíku: ${gameDeck.length}`);
        
        renderDeck();
    } catch (error) {
        console.error("Error loading deck:", error);
        logMessage("Chyba pri načítaní balíčka!");
    }
}

// Funkcia na vytvorenie herného balíčka s kartami typu "L"
function createGameDeck(cards) {
    const deck = [];
    cards.forEach(card => {
        if (card.size.toLowerCase() === 'l') {
            for (let i = 0; i < card.count; i++) {
                deck.push(card);
            }
        }
    });
    return deck;
}

// Funkcia na premiešanie balíčka (Fisher-Yates shuffle)
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Výmena prvkov
    }
    return deck;
}

// Funkcia na zobrazenie zamiešaného balíčka v "Kopa ťahania"
function renderDeck() {
    const deckSection = document.getElementById('drawPile');
    deckSection.innerHTML = ''; // Vymažeme predchádzajúci obsah

    // Pridáme zamiešané karty do "Kopa ťahania"
    gameDeck.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card-back');
        cardElement.dataset.index = index; // Uložíme index karty
        cardElement.addEventListener('click', drawCard); // Pridáme event listener na kliknutie
        deckSection.appendChild(cardElement);
    });
}

// Funkcia na presun karty do "Moje karty" po kliknutí
function drawCard(event) {
    const cardIndex = event.target.dataset.index;
    const card = gameDeck[cardIndex];
    
    if (card) {
        // Pridáme kartu medzi hráčove karty
        const playerHand = document.getElementById('playerHand');
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.textContent = card.name; // Zobrazíme názov karty

        // Pridáme event listener pre presun na kopu odkladania
        cardElement.addEventListener('click', () => discardCard(card, cardElement));

        playerHand.appendChild(cardElement);

        // Odstránime kartu z kopy ťahania
        gameDeck.splice(cardIndex, 1);
        renderDeck(); // Aktualizujeme zobrazenie kopy ťahania

        logMessage(`Karta ${card.name} bola pridaná medzi tvoje karty.`);
    } else {
        logMessage("Nie je možné pridať kartu.");
    }
}

// Funkcia na presun karty na kopu odkladania
function discardCard(card, cardElement) {
    const discardPile = document.getElementById('discardPile');

    // Odstráňte kartu z hráčovej ruky
    cardElement.remove();

    // Vytvorte nový element pre kartu a pridajte ho do kopy odkladania
    const discardElement = document.createElement('div');
    discardElement.classList.add('card');
    discardElement.textContent = card.name; // Zobrazí názov karty
    discardPile.appendChild(discardElement);

    logMessage(`Karta ${card.name} bola presunutá na kopu odkladania.`);
}
