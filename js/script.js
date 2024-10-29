let socket;

let cardTypes = [];

// Načítanie kariet z lokálnej JSON databázy
fetch('cards.json')
    .then(response => response.json())
    .then(data => {
        cardTypes = data.cards;
    })
    .catch(error => {
        console.error('Chyba pri načítaní kariet:', error);
    });

window.addEventListener('load', function() {
    connectToServer();
});

document.getElementById('invite-player').addEventListener('click', function() {
    invitePlayer();
});

document.getElementById('send-message').addEventListener('click', function() {
    sendMessage();
});

document.getElementById('start-game').addEventListener('click', function() {
    startGame();
});

function invitePlayer() {
    const gameLink = `${window.location.href}?chat=${generateGameId()}`;
    document.getElementById('game-link').value = gameLink;
    document.getElementById('game-link').select();
    document.execCommand('copy');
    renderChatMessage('Link na hru bol vytvorený a skopírovaný do schránky. Pošlite ho priateľovi!', 'system');
}

function generateGameId() {
    return Math.random().toString(36).substr(2, 9);
}

function connectToServer() {
    socket = new WebSocket('wss://matuscak.onrender.com');
    
    socket.addEventListener('open', () => {
        console.log('Pripojené k serveru');
        renderChatMessage('Pripojené k serveru', 'system');
        notifyNewPlayer();
    });

    socket.addEventListener('message', (event) => {
        if (event.data instanceof Blob) {
            event.data.text().then(text => {
                console.log(`Správa zo servera: ${text}`);
                handleGameMessage(text);
            });
        } else {
            console.log(`Správa zo servera: ${event.data}`);
            handleGameMessage(event.data);
        }
    });

    socket.addEventListener('close', () => {
        console.log('Odpojené od servera');
        renderChatMessage('Odpojené od servera', 'system');
    });

    socket.addEventListener('error', (error) => {
        console.log('Chyba pripojenia', error);
        renderChatMessage('Chyba pripojenia', 'system');
    });
}

function notifyNewPlayer() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'newPlayer' }));
    }
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    if (message && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'chat', message: message }));
        renderChatMessage(message, 'player');
        messageInput.value = '';
    }
}

function startGame() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'startGame' }));
        console.log('Začínam hru');
        renderChatMessage('Hra sa začína', 'system');
        initializeGame();
    } else {
        console.log('Nemôžem začať hru, nie je pripojenie k serveru');
        renderChatMessage('Nemôžem začať hru, nie je pripojenie k serveru', 'system');
    }
}

function initializeGame() {
    console.log('Hra bola inicializovaná, rozdeľujem karty hráčom.');
    renderChatMessage('Hra bola inicializovaná, rozdeľujem karty hráčom.', 'system');
    dealCards();
}

function dealCards() {
    if (cardTypes.length > 0) {
        const playerCards = cardTypes.sort(() => 0.5 - Math.random()).slice(0, 5); // Náhodný výber 5 kariet pre hráča
        socket.send(JSON.stringify({ type: 'dealCards', cards: playerCards }));
        renderChatMessage('Karty boli rozdané hráčom.', 'system');
        renderCards(playerCards);
    } else {
        console.error('Karty nie sú načítané. Skontrolujte JSON súbor.');
    }
}

function handleGameMessage(message) {
    try {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'newPlayer':
                renderChatMessage('Nový hráč sa pripojil do hry.', 'system');
                break;
            case 'startGame':
                console.log('Hra sa začala na príkaz protihráča.');
                renderChatMessage('Hra sa začala na príkaz protihráča.', 'system');
                initializeGame();
                break;
            case 'dealCards':
                renderCards(data.cards);
                renderChatMessage(`Dostali ste karty: ${data.cards.map(card => card.name).join(', ')}`, 'system');
                break;
            case 'chat':
                renderChatMessage(data.message, 'opponent');
                break;
            default:
                console.log('Neznáma správa:', data);
        }
    } catch (e) {
        console.log('Správa nie je platný JSON:', message);
    }
}

function renderCards(cards) {
    const playerCardsContainer = document.getElementById('player-cards');
    playerCardsContainer.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-placeholder';
        cardElement.textContent = `${card.name} (Útok: ${card.attack}, Obrana: ${card.defense}, Špeciál: ${card.special})`;
        playerCardsContainer.appendChild(cardElement);
    });
}

function renderChatMessage(message, sender) {
    const chatLog = document.getElementById('chat-log');
    const newMessage = document.createElement('div');
    newMessage.className = sender === 'opponent' ? 'opponent-message' : (sender === 'player' ? 'player-message' : 'system-message');
    newMessage.textContent = message;
    chatLog.appendChild(newMessage);
    chatLog.scrollTop = chatLog.scrollHeight;
}
