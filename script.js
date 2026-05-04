window.addEventListener('message', (event) => {
    const data = event.data;

    if (data.action === 'notification') {
        showNotification(data.title, data.message, data.type, data.duration);
    } 
    
    if (data.activeMenu) {
        renderMenu(data.activeMenu);
    }
});

function renderMenu(menuData) {
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; // Clear old menu

    menuData.forEach((item, index) => {
        const menuElement = document.createElement('div');
        menuElement.className = 'menu-item';
        
        // Handle Submenus/Tabs
        if (item.type === 'submenu') {
            menuElement.innerHTML = `<h3>${item.label}</h3>`;
            const tabsContainer = document.createElement('div');
            tabsContainer.className = 'tabs';

            item.tabs.forEach(tab => {
                const tabBtn = document.createElement('button');
                tabBtn.innerText = tab.name;
                tabBtn.onclick = () => renderSubmenu(tab.submenu);
                tabsContainer.appendChild(tabBtn);
            });
            menuElement.appendChild(tabsContainer);
        }
        container.appendChild(menuElement);
    });
}

function renderSubmenu(submenuItems) {
    const subContainer = document.getElementById('submenu-display');
    subContainer.innerHTML = '';

    submenuItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'option-row';

        if (item.type === 'checkbox') {
            div.innerHTML = `
                <span>${item.label}</span>
                <input type="checkbox" ${item.value ? 'checked' : ''} 
                onchange="sendToLua('${item.label}', this.checked)">
            `;
        } else if (item.type === 'button') {
            div.innerHTML = `<button onclick="sendToLua('${item.label}')">${item.label}</button>`;
        }
        subContainer.appendChild(div);
    });
}

function sendToLua(label, val = null) {
    // This sends the data back to your OnDuiMessage in Lua
    fetch(`https://${GetParentResourceName()}/menuResult`, {
        method: 'POST',
        body: JSON.stringify({ label: label, value: val })
    });
}
