let currentMenu = [];
let activeIndex = 0;
let currentTabs = [];
let currentTabIndex = 0;
let isInputOpen = false;

const menu = document.getElementById('menu');
const itemsDiv = document.getElementById('items');
const tabsDiv = document.getElementById('tabs');
const inputBox = document.getElementById('inputBox');
const inputField = document.getElementById('input');
const inputTitle = document.getElementById('inputTitle');

function send(data) {
    fetch(`https://${GetParentResourceName()}/message`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

function renderTabs() {
    tabsDiv.innerHTML = '';
    currentTabs.forEach((tab, i) => {
        const el = document.createElement('div');
        el.className = `PCategory ${i === currentTabIndex ? 'active' : ''}`;
        el.textContent = tab.name;
        el.onclick = () => {
            currentTabIndex = i;
            activeIndex = 0;
            currentMenu = currentTabs[i].submenu || [];
            render();
            renderTabs();
        };
        tabsDiv.appendChild(el);
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

        // Handle tabs if present
        if (d.menu && d.menu.tabs) {
            currentTabs = d.menu.tabs;
            renderTabs();
            currentMenu = currentTabs[0].submenu || [];
        } else {
            currentTabs = [];
            tabsDiv.innerHTML = '';
        }

        render();
    }
    else if (d.action === 'openInput') {
        isInputOpen = true;
        inputTitle.textContent = d.question || "Enter value:";
        inputField.value = d.value || "";
        inputBox.classList.add('show');
        inputField.focus();
    }
    else if (d.action === 'closeInput') {
        isInputOpen = false;
        inputBox.classList.remove('show');
    }
});

document.addEventListener('keydown', e => {
    if (isInputOpen) {
        if (e.key === "Enter") {
            send({ action: "textInputResult", value: inputField.value });
            inputBox.classList.remove('show');
            isInputOpen = false;
        }
        if (e.key === "Escape") {
            send({ action: "textInputResult", value: null });
            inputBox.classList.remove('show');
            isInputOpen = false;
        }
        return;
    }

    send({ action: "keyPressed", key: e.key });
});

send({ action: "ready" });
