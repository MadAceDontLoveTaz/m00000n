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
        
        // Force focus
        setTimeout(() => {
            inputField.focus();
            inputField.select();
        }, 50);
    }
    else if (d.action === 'closeInput') {
        isInputOpen = false;
        inputBox.classList.remove('show');
    }
});

// Input handling
document.addEventListener('keydown', e => {
    if (isInputOpen) {
        // Allow normal typing in the input field
        if (e.key === "Enter") {
            send({ action: "textInputResult", value: inputField.value });
            inputBox.classList.remove('show');
            isInputOpen = false;
        } 
        else if (e.key === "Escape") {
            send({ action: "textInputResult", value: null });
            inputBox.classList.remove('show');
            isInputOpen = false;
        }
        // Do NOT block other keys - let the input field handle them
        return;
    }

    // Normal menu navigation
    send({ action: "keyPressed", key: e.key });
});

send({ action: "ready" });
