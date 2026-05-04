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
        
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = item.label || 'Unknown';
        el.appendChild(label);

        if (item.type === 'checkbox') {
            const checked = item.value || item.checked || false;
            const check = document.createElement('div');
            check.className = 'checkbox';
            check.textContent = checked ? '✅' : '⬜';
            el.appendChild(check);
        }
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
        inputField.focus();
    }
    else if (d.action === 'closeInput') {
        isInputOpen = false;
        inputBox.classList.add('hidden');
    }
});

document.addEventListener('keydown', e => {
    if (isInputOpen) {
        if (e.key === "Enter") {
            send({ action: "textInputResult", value: inputField.value });
            inputBox.classList.add('hidden');
            isInputOpen = false;
        }
        if (e.key === "Escape") {
            send({ action: "textInputResult", value: null });
            inputBox.classList.add('hidden');
            isInputOpen = false;
        }
        return;
    }
    send({ action: "keyPressed", key: e.key });
});

send({ action: "ready" });
