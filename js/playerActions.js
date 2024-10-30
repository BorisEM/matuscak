// playerActions.js

// Funkcia na začatie presúvania karty
function drag(event) {
    event.dataTransfer.setData("text/plain", event.target.dataset.cardName);
    event.target.classList.add("dragging");
}

// Povolenie presunu na prvky, ktoré akceptujú presúvanie
function allowDrop(event) {
    event.preventDefault();
    if (event.target.classList.contains("discard-slot")) {
        event.target.classList.add("drag-over");
    }
}

// Funkcia na uskutočnenie presunu karty do cieľového slotu
function drop(event) {
    event.preventDefault();
    const cardName = event.dataTransfer.getData("text/plain");
    const draggedCard = document.querySelector(`.card[data-card-name="${cardName}"]`);
    const discardSlot = event.target;

    if (discardSlot && discardSlot.classList.contains("discard-slot")) {
        discardSlot.classList.remove("drag-over");

        if (draggedCard) {
            logMessage(`Karta ${cardName} bola úspešne presunutá do slotu.`);
            discardSlot.appendChild(draggedCard);

            // Pridanie karty do kopy odkladania a odstránenie z hráčovej ruky
            discardDeck.push(cardName);
            draggedCard.classList.remove("dragging");
        } else {
            logMessage("Chyba: Kartu sa nepodarilo nájsť.");
        }
    }
}

// Skrytie štýlov po dokončení presunu
document.addEventListener("dragend", (event) => {
    event.target.classList.remove("dragging");
});

// Funkcia na odhodenie vybranej karty pomocou kontextového menu
function discardCard() {
    if (selectedCardElement) {
        const cardName = selectedCardElement.dataset.cardName;
        discardDeck.push(cardName);
        selectedCardElement.remove();
        logMessage(`Karta ${cardName} bola odhodená.`);
        
        // Skryť kontextové menu po odhodení karty
        document.getElementById("cardMenu").style.display = "none";
    } else {
        logMessage("Žiadna karta nebola vybraná na odhodenie.");
    }
}

// Funkcia na zahratie vybranej karty
function playCard() {
    if (selectedCardElement) {
        const cardName = selectedCardElement.dataset.cardName;
        logMessage(`Karta ${cardName} bola zahraná!`);
        
        // Odstrániť kartu z hráčovej ruky po zahraní
        selectedCardElement.remove();

        // Skryť kontextové menu po zahraní karty
        document.getElementById("cardMenu").style.display = "none";
    } else {
        logMessage("Žiadna karta nebola vybraná na zahranie.");
    }
}
