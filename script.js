let currentItems = [];
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

function renderItems() {
    itemsContainer.innerHTML = '';

    currentItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `item ${index === activeIndex ? 'active' : ''}`;
        
        let html = `<span>${item.label || 'Item'}</span>`;
        
        if (item.type === 'checkbox' || item.checked !== undefined) {
            const isChecked = item.value || item.checked || false;
            html += `<span class="checkbox">${isChecked ? '✅' : '⬜'}</span>`;
        }
        
        div.innerHTML = html;
        itemsContainer.appendChild(div);
    });
}

window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.action === 'setVisible') {
        menu.classList.toggle('hidden', !data.visible);
    }

    else if (data.action === 'setCurrent') {
        currentItems = data.menu || [];
        activeIndex = data.current || 0;
        renderItems();
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

// Keyboard Input
document.addEventListener('keydown', function(e) {
    if (isInputOpen) {
        if (e.key === "Enter") {
            send({ action: "textInputResult", value: inputField.value });
        } else if (e.key === "Escape") {
            send({ action: "textInputResult", value: null });
        }
        return;
    }

    send({ action: "keyPressed", key: e.key });
});

// Ready Signal
send({ action: "ready" });
