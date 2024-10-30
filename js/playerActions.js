// playerActions.js

function addCardToHand(card, handId, isOpponent = false) {
    const hand = document.getElementById(handId);
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.textContent = card.name;
    cardElement.draggable = !isOpponent;

    if (!isOpponent) {
        cardElement.addEventListener('dragstart', drag);
        cardElement.addEventListener('click', event => showCardMenu(event, cardElement));
    }
    hand.appendChild(cardElement);
}

// Funkcia na presun karty do kopy odkladania
function discardCard(cardElement) {
    const cardName = cardElement.textContent;
    discardDeck.push(cardName);
    moveToDiscardPile(cardName);
    cardElement.remove();
}
