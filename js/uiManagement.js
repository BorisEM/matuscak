// uiManagement.js

function logMessage(message) {
    const chatLog = document.getElementById('chatLog');
    if (chatLog) {
        chatLog.innerHTML += `<p>${message}</p>`;
        chatLog.scrollTop = chatLog.scrollHeight; // Posuňte na spodok logu pri každom novom príspevku
        console.log(`Log: ${message}`);
    } else {
        console.error("Element 'chatLog' nebol nájdený.");
    }
}


// Funkcia na zobrazenie kontextového menu pri kliknutí na kartu
function showCardMenu(event, cardElement) {
    event.stopPropagation();
    selectedCardElement = cardElement;
    const menu = document.getElementById('cardMenu');
    menu.style.display = 'block';
    menu.style.left = `${event.pageX}px`;
    menu.style.top = `${event.pageY}px`;
}

// Skrytie kontextového menu
document.addEventListener('click', () => {
    document.getElementById('cardMenu').style.display = 'none';
});
