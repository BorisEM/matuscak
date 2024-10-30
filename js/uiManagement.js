// uiManagement.js

// Funkcia na logovanie správ
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

// Premenná pre vybratý prvok karty
let selectedCardElement = null;

// Funkcia na zobrazenie kontextového menu pri kliknutí na kartu
function showCardMenu(event, cardElement) {
    event.stopPropagation();
    selectedCardElement = cardElement; // Nastavenie vybranej karty
    const menu = document.getElementById('cardMenu');
    
    if (menu) {
        menu.style.display = 'block';
        menu.style.left = `${event.pageX}px`;
        menu.style.top = `${event.pageY}px`;
    } else {
        console.error("Element 'cardMenu' nebol nájdený.");
    }
}

// Skrytie kontextového menu pri kliknutí mimo neho
document.addEventListener('click', (event) => {
    const menu = document.getElementById('cardMenu');
    if (menu && event.target !== menu && !menu.contains(event.target)) {
        menu.style.display = 'none';
    }
});
