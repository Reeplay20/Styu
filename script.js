// Инициализация данных
let currentUser = null;
let chats = JSON.parse(localStorage.getItem('chats')) || [];
let users = JSON.parse(localStorage.getItem('users')) || {};

// Проверка авторизации при загрузке
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showMainScreen();
    }
};

// Авторизация
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        showMainScreen();
    } else {
        alert('Неверный логин или пароль!');
    }
}

// Регистрация
function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Заполните все поля!');
        return;
    }

    if (users[username]) {
        alert('Пользователь уже существует!');
        return;
    }

    users[username] = { 
        password: password, 
        isAdmin: username === 'admin' // админ — пользователь с логином 'admin'
    };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Регистрация успешна! Теперь войдите.');
}

// Выход
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
}

// Показать основной экран
function showMainScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    document.getElementById('current-user').textContent = currentUser;

    // Показать админку, если пользователь — админ
    if (users[currentUser].isAdmin) {
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        document.getElementById('admin-panel').style.display = 'none';
    }

    renderChats();
}

// Рендеринг списка чатов
function renderChats() {
    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '';

    chats.forEach((chat, index) => {
        const li = document.createElement('li');
        li.textContent = chat.name;
        li.onclick = () => openChat(index);
        chatsList.appendChild(li);
    });
}

// Открыть чат
function openChat(chatIndex) {
    document.getElementById('chat-header').textContent = chats[chatIndex].name;
    renderMessages(chatIndex);
}

// Рендеринг сообщений в чате
function renderMessages(chatIndex) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';

    chats[chatIndex].messages.forEach(msg => {
        const p = document.createElement('p');
        p.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
        messagesDiv.appendChild(p);
    });
}

// Отправить сообщение
function sendMessage() {
    const input = document.getElementById('message-input');
    const text = input.value.trim();

    if (!text) return;

    const chatIndex = parseInt(document.getElementById('chat-header').dataset.chatIndex);
    if (isNaN(chatIndex)) {
        alert('Выберите чат!');
        return;
    }

    chats[chatIndex].messages.push({
        sender: currentUser,
        text: text,
        timestamp: new Date().toLocaleTimeString()
    });

    localStorage.setItem('chats', JSON.stringify(chats));
    input.value = '';
    renderMessages(chatIndex);
}

// Переход к редактированию профиля
function editProfile() {
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('profile-screen').style.display = 'flex';

    const userData = users[currentUser];
    document.getElementById('edit-username').value = currentUser;
    document.getElementById('edit-password').value = userData.password;
}

// Сохранить профиль
function saveProfile() {
    const newUsername = document.getElementById('edit-username').value;
    const newPassword = document.getElementById('edit-password').value;

    if (!newUsername || !newPassword) {
        alert('Заполните все поля!');
        return;
    }

    // Обновление данных пользователя
    users[newUsername] = {
        password: newPassword,
        isAdmin: users[currentUser].isAdmin
    };

    // Если логин изменился — обновляем текущий пользователь
    if (newUsername !== currentUser) {
        delete users[currentUser];
        currentUser = newUsername;
        localStorage.setItem('currentUser', newUsername);
    }

    localStorage.setItem('users', JSON.stringify(users));
    alert('Профиль обновлён!');
    goBack();
}

// Вернуться назад
function goBack() {
    document.getElementById('profile-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
}

// Удалить чат (для админа)
function deleteChat() {
    const chatName = document.getElementById('chat-header').textContent;
    chats = chats.filter(chat => chat.name !== chatName);
    localStorage.setItem('chats', JSON.stringify(chats));
    renderChats();
    document.getElementById('messages').innerHTML = '';
    document.getElementById('chat-header').textContent = 'Выберите чат';
}

// Очистить сообщения в чате (для админа)
function clearMessages() {
    const chatIndex = Array.from(document.getElementById('chats-list').children)
        .findIndex(li => li.textContent === document.getElementById('chat-header').textContent);

    if (chatIndex !== -1) {
        chats[chatIndex].messages = [];
        localStorage.setItem('chats', JSON.stringify(chats));
        renderMessages(chatIndex);
    }
}

// Инициализация демо‑чатов (можно удалить в продакшене)
if (chats.length === 0) {
    chats.push({
        name: 'Общий чат',
        messages: [
            { sender: 'admin', text: 'Привет! Это демо‑чат.', timestamp: '10:00' }
        ]
    });
    chats.push({
        name: 'Команда разработки',
        messages: [
            { sender: 'user1', text: 'Нужно исправить баг.', timestamp: '11:15' }
        ]
    });
    localStorage.setItem('chats', JSON.stringify(chats));
}

// Привязка событий к профилю
document.getElementById('user-profile').onclick = editProfile;

// Добавление нового чата (доступно всем пользователям)
function addChat() {
    const chatName = prompt('Введите название чата:');
    if (!chatName || chatName.trim() === '') {
        alert('Название чата не может быть пустым!');
        return;
    }

    chats.push({
        name: chatName.trim(),
        messages: []
    });

    localStorage.setItem('chats', JSON.stringify(chats));
    renderChats();
}

// Кнопка для добавления чата (добавить в HTML, например, в sidebar)
// <button onclick="addChat()" style="margin: 10px 0;">+ Новый чат</button>

// Поиск чата по названию
function searchChats() {
    const query = prompt('Введите название чата для поиска:').toLowerCase();
    if (!query) return;

    const filteredChats = chats.filter(chat => 
        chat.name.toLowerCase().includes(query)
    );

    const chatsList = document.getElementById('chats-list');
    chatsList.innerHTML = '';

    filteredChats.forEach((chat, index) => {
        const li = document.createElement('li');
        li.textContent = chat.name;
        li.onclick = () => openChat(chats.findIndex(c => c.name === chat.name));
        chatsList.appendChild(li);
    });

    if (filteredChats.length === 0) {
        chatsList.innerHTML = '<li>Чаты не найдены</li>';
    }
}

// Обновление интерфейса при смене чата
function updateChatInterface(chatIndex) {
    if (chatIndex === -1) {
        document.getElementById('chat-header').textContent = 'Чат не выбран';
        document.getElementById('messages').innerHTML = 'Выберите чат из списка слева.';
        return;
    }

    document.getElementById('chat-header').textContent = chats[chatIndex].name;
    document.getElementById('chat-header').dataset.chatIndex = chatIndex;
    renderMessages(chatIndex);
}

// Автоматическое обновление списка чатов каждые 5 секунд (опционально)
setInterval(() => {
    const currentChatName = document.getElementById('chat-header').textContent;
    if (currentChatName !== 'Выберите чат' && currentChatName !== 'Чат не выбран') {
        const chatIndex = chats.findIndex(chat => chat.name === currentChatName);
        if (chatIndex !== -1) {
            renderMessages(chatIndex); // Обновляем сообщения
        }
    }
}, 5000);

// Обработка нажатия Enter в поле ввода сообщения
document.getElementById('message-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Дополнительные функции для админ‑панели
function promoteToAdmin() {
    if (!users[currentUser].isAdmin) return;

    const username = prompt('Введите логин пользователя для назначения админом:');
    if (users[username]) {
        users[username].isAdmin = true;
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Пользователь ${username} назначен админом.`);
    } else {
        alert('Пользователь не найден!');
    }
}

function demoteFromAdmin() {
    if (!users[currentUser].isAdmin) return;

    const username = prompt('Введите логин пользователя для снятия статуса админа:');
    if (users[username] && users[username].isAdmin) {
        users[username].isAdmin = false;
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Статус админа снят с пользователя ${username}.`);
    } else {
        alert('Пользователь не найден или не является админом!');
    }
}

// Добавить кнопки в админ‑панель (в HTML):
// <button onclick="promoteToAdmin()">Назначить админом</button>
// <button onclick="demoteFromAdmin()">Снять статус админа</button>

// Инициализация интерфейса
renderChats();

// Дополнительная защита: блокировка прямого доступа к main-screen
if (!currentUser && window.location.hash !== '#auth') {
    window.location.hash = '#auth';
    showAuthScreen();
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('profile-screen').style.display = 'none';
}

