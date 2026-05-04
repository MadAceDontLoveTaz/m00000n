let currentMenu = [];
let activeIndex = 0;
let isInputOpen = false;

const menu = document.getElementById('menu');
const itemsDiv = document.getElementById('items');
const inputBox = document.getElementById('inputBox');
const inputField = document.getElementById('input');
const inputTitle = document.getElementById('inputTitle');

function send(data) {
    fetch(`https://${GetParentResourceName()}/message`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

function render() {
    itemsDiv.innerHTML = '';
    currentMenu.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = `item ${i === activeIndex ? 'active' : ''}`;
        
        let text = item.label || 'Unknown';
        if (item.type === 'checkbox') {
            text += ` <span class="checkbox">${(item.value || item.checked) ? '✅' : '⬜'}</span>`;
        }
        el.innerHTML = text;
        itemsDiv.appendChild(el);
    });
}

window.addEventListener('message', e => {
    const d = e.data;

    if (d.action === 'setVisible') {
        menu.classList.toggle('hidden', !d.visible);
    }

    else if (d.action === 'setCurrent') {
        currentMenu = d.menu || [];
        activeIndex = d.current || 0;
        render();
    }

    else if (d.action === 'openInput') {
        isInputOpen = true;
        inputTitle.textContent = d.question || "Enter value:";
        inputField.value = d.value || "";
        inputBox.classList.remove('hidden');
        menu.classList.add('hidden');
        setTimeout(() => inputField.focus(), 50);
    }

    else if (d.action === 'closeInput') {
        isInputOpen = false;
        inputBox.classList.add('hidden');
        menu.classList.remove('hidden');
    }

    else if (d.action === 'updateInput') {
        inputField.value = d.value || "";
    }

    else if (d.action === 'notification') {
        // You can add a toast here if you want
        console.log(`[NOTIF] ${d.title}: ${d.message}`);
    }
});

// Keyboard for input
document.addEventListener('keydown', e => {
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

send({ action: "ready" });
