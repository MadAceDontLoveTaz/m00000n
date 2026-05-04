let currentMenu = [];
let activeIndex = 0;
let isInputOpen = false;

const menu = document.getElementById('menu');
const itemsContainer = document.getElementById('items');
const inputContainer = document.getElementById('inputContainer');
const inputField = document.getElementById('inputField');
const inputQuestion = document.getElementById('inputQuestion');

function send(data) {
    fetch(`https://${GetParentResourceName()}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

function renderMenu() {
    itemsContainer.innerHTML = '';

    currentMenu.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `item ${index === activeIndex ? 'active' : ''}`;

        let label = item.label || "Unknown";
        let extra = "";

        if (item.type === 'checkbox' || item.value !== undefined) {
            const checked = item.value || item.checked || false;
            extra = `<span class="checkbox">${checked ? '✅' : '⬜'}</span>`;
        } else if (item.type === 'button') {
            extra = `<span style="color:#22c55e; font-size:13px;">→</span>`;
        }

        div.innerHTML = `<span>${label}</span>${extra}`;
        itemsContainer.appendChild(div);
    });
}

window.addEventListener('message', (event) => {
    const data = event.data;

    if (data.action === 'setVisible') {
        menu.classList.toggle('hidden', !data.visible);
    }

    else if (data.action === 'setCurrent') {
        currentMenu = data.menu || [];
        activeIndex = data.current || 0;
        renderMenu();
    }

    else if (data.action === 'openInput') {
        isInputOpen = true;
        inputQuestion.textContent = data.question || "Enter value:";
        inputField.value = data.value || "";
        inputContainer.classList.remove('hidden');
        menu.classList.add('hidden');
        setTimeout(() => inputField.focus(), 100);
    }

    else if (data.action === 'closeInput') {
        isInputOpen = false;
        inputContainer.classList.add('hidden');
        menu.classList.remove('hidden');
    }

    else if (data.action === 'updateInput') {
        inputField.value = data.value || "";
    }
});

// Keyboard
document.addEventListener('keydown', (e) => {
    if (isInputOpen) {
        if (e.key === "Enter") send({ action: "textInputResult", value: inputField.value });
        if (e.key === "Escape") send({ action: "textInputResult", value: null });
        return;
    }
    send({ action: "keyPressed", key: e.key });
});

// Ready
send({ action: "ready" });
