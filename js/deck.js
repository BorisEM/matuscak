"use strict";

let gameDeck = []; // Uchováva zamiešaný balíček
let discardDeck = []; // Uchováva karty v kope odkladania
let selectedCardElement = null; // Uchováva referenciu na aktuálne vybranú kartu

// Funkcia na zobrazenie kontextového menu pri kliknutí na kartu
function showCardMenu(event, cardElement) {
    event.stopPropagation();
    selectedCardElement = cardElement;

    const menu = document.getElementById('cardMenu');
    menu.style.display = 'block';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
}

// Funkcia na skrytie kontextového menu
function hideCardMenu() {
    const menu = document.getElementById('cardMenu');
    menu.style.display = 'none';
    selectedCardElement = null;
}

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
        
        renderTopCard();
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
        renderTopCard();
        logMessage(`Karta ${card.name} bola pridaná medzi tvoje karty.`);
    } else {
        logMessage("Nie je možné pridať kartu.");
    }
}

// Funkcia, ktorá umožňuje drop na slot
function allowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over'); // Pridáme vizuálnu spätnú väzbu
}

// Funkcia pre začiatok drag udalosti
function drag(event) {
    event.dataTransfer.setData('text', event.target.getAttribute('data-card-name'));
}

// Funkcia na presun karty do jedného z odkladacích slotov
function moveToDiscardPile(cardName) {
    const discardPile = document.getElementById('discardPile');
    
    // Vymažeme obsah kopy odkladania a pridáme novú kartu
    discardPile.innerHTML = ''; // Vymazanie predchádzajúceho obsahu

    // Vytvoríme nový element pre kartu a pridáme ju na vrch kopy odkladania
    const discardElement = document.createElement('div');
    discardElement.classList.add('card');
    discardElement.textContent = cardName;
    discardPile.appendChild(discardElement);

    logMessage(`Karta ${cardName} bola presunutá do kopy odkladania.`);
}

// Funkcia pre drop udalosti
function drop(event) {
    event.preventDefault();
    const cardName = event.dataTransfer.getData('text'); // Načítame názov karty z prenosu

    if (cardName) {
        const slot = event.currentTarget;
        slot.classList.remove('drag-over');

        slot.innerHTML = '';
        const slotCard = document.createElement('div');
        slotCard.classList.add('card');
        slotCard.textContent = cardName;
        slotCard.setAttribute('draggable', true); // Umožníme presúvanie karty aj zo slotu
        slotCard.addEventListener('dragstart', drag);
        slotCard.addEventListener('click', (event) => showCardMenu(event, slotCard)); // Aktivujeme kontextové menu

        slot.appendChild(slotCard);
        logMessage(`Karta ${cardName} bola presunutá do ${slot.id}.`);

        const playerHand = document.getElementById('playerHand');
        const cardToRemove = playerHand.querySelector(`[data-card-name="${cardName}"]`);
        if (cardToRemove) {
            cardToRemove.remove();
        }
    }
}

// Funkcia na zahrať kartu (táto funkcia môže vykonať ľubovoľnú akciu)
function playCard() {
    if (selectedCardElement) {
        logMessage(`Karta ${selectedCardElement.textContent} bola zahratá.`);
        selectedCardElement.remove(); // Odstráni kartu z ruky alebo slotu
        hideCardMenu();
    }
}


/// Funkcia na odhodiť kartu (presunie kartu do kopy odkladania)
function discardCard() {
    if (selectedCardElement) {
        moveToDiscardPile(selectedCardElement.textContent); // Použije funkciu na presun do kopy odkladania
        selectedCardElement.remove(); // Odstráni kartu zo slotu alebo ruky
        hideCardMenu();
    }
}

// Pridáme event listener na skrytie menu pri kliknutí mimo neho
document.addEventListener('click', hideCardMenu);

// Funkcia na pridanie kontextového menu k vybranej karte
function enableCardMenu(cardElement) {
    cardElement.addEventListener('click', (event) => showCardMenu(event, cardElement));
}

// Funkcia na zamiešanie kariet z kopy odkladania späť do kopy ťahania
function reshuffleDiscardPile() {
    if (discardDeck.length === 0) {
        logMessage("Kopa odkladania je tiež prázdna. Nemožno miešať.");
        return;
    }

    // Premiestnime všetky karty z discardDeck do gameDeck
    gameDeck = shuffleDeck(discardDeck);
    discardDeck = []; // Vyprázdnime kopu odkladania

    renderTopCard(); // Zobrazíme vrchnú kartu znovu po zamiešaní
    logMessage("Karty z kopy odkladania boli zamiešané a pridané do kopy ťahania.");
}

// Funkcia na presun karty do jedného z odkladacích slotov
function moveToSlot(card, slotId) {
    const slot = document.getElementById(slotId);

    if (slot) {
        slot.innerHTML = ''; // Vyprázdnime slot
        const slotCard = document.createElement('div');
        slotCard.classList.add('card');
        slotCard.textContent = card.name; // Zobrazí názov karty
        slot.appendChild(slotCard);

        logMessage(`Karta ${card.name} bola presunutá do ${slotId}.`);
    } else {
        logMessage("Nie je možné presunúť kartu do slotu.");
    }
}