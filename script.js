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
const notifContainer = document.getElementById('notifications');

function send(data) {
    fetch(`https://${GetParentResourceName()}/message`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// Render Tabs
function renderTabs() {
    tabsDiv.innerHTML = '';
    if (currentTabs.length === 0) {
        tabsDiv.style.display = 'none';
        return;
    }
    tabsDiv.style.display = 'flex';

    currentTabs.forEach((tab, i) => {
        const el = document.createElement('div');
        el.className = `PCategory ${i === currentTabIndex ? 'active' : ''}`;
        el.textContent = tab.name || 'Tab';
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

// Render Menu Items
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

// Notifications
function showNotification(title, message, type = 'info', duration = 3500) {
    const notif = document.createElement('div');
    notif.className = `Notification ${type}`;
    notif.innerHTML = `
        <strong>${title}</strong><br>
        <span>${message}</span>
    `;
    notifContainer.appendChild(notif);

    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, duration);
}

window.addEventListener('message', e => {
    const d = e.data;

    if (d.action === 'setVisible') {
        menu.classList.toggle('hidden', !d.visible);
    }
    else if (d.action === 'setCurrent') {
        currentMenu = d.menu || [];
        activeIndex = d.current || 0;

        if (d.menu && d.menu.tabs && d.menu.tabs.length > 0) {
            currentTabs = d.menu.tabs;
            renderTabs();
            if (currentTabs[currentTabIndex] && currentTabs[currentTabIndex].submenu) {
                currentMenu = currentTabs[currentTabIndex].submenu;
            }
        } else {
            currentTabs = [];
            tabsDiv.style.display = 'none';
        }
        render();
    }
    else if (d.action === 'openInput') {
        isInputOpen = true;
        inputTitle.textContent = d.question || "Enter value:";
        inputField.value = d.value || "";
        inputBox.classList.add('show');
        setTimeout(() => inputField.focus(), 100);
    }
    else if (d.action === 'closeInput') {
        isInputOpen = false;
        inputBox.classList.remove('show');
    }
    else if (d.action === 'notification') {
        showNotification(d.title, d.message, d.type, d.duration);
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
