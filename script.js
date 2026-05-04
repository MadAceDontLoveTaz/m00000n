let currentMenu = [];
let activeIndex = 0;
let currentTabIndex = 0;

window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.action === "notification") {
        createNotification(data);
    } else if (data.action === "openMenu") {
        $("#menu-wrapper").fadeIn(200);
        renderMenu(data.menu);
    }
});

function renderMenu(menuData) {
    currentMenu = menuData;
    $("#items-list").empty();
    $("#tabs-container").empty();

    // In your Lua structure, "activeMenu" contains submenus with "tabs"
    const menuObj = currentMenu[0]; // Assuming Player menu
    $("#menu-title").text(menuObj.label);

    // Render Tabs
    menuObj.tabs.forEach((tab, index) => {
        const tabEl = $(`<div class="tab-item ${index === currentTabIndex ? 'active' : ''}">${tab.name}</div>`);
        $("#tabs-container").append(tabEl);
    });

    // Render Items for active tab
    const activeItems = menuObj.tabs[currentTabIndex].submenu;
    activeItems.forEach((item, index) => {
        let extra = '';
        if (item.type === 'checkbox') {
            extra = `<div class="checkbox-visual ${item.value ? 'checked' : ''}"></div>`;
        } else if (item.type === 'submenu') {
            extra = `<span> > </span>`;
        }

        const itemEl = $(`
            <div class="menu-item ${index === activeIndex ? 'selected' : ''}">
                <span>${item.label}</span>
                ${extra}
            </div>
        `);
        $("#items-list").append(itemEl);
    });
}

function createNotification(data) {
    const id = Math.floor(Math.random() * 1000);
    const html = `
        <div id="notif-${id}" class="notification ${data.type}">
            <strong>${data.title}</strong>
            <p style="margin: 5px 0 0 0; font-size: 13px;">${data.message}</p>
        </div>
    `;
    $("#notifications-container").append(html);
    setTimeout(() => {
        $(`#notif-${id}`).fadeOut(500, function() { $(this).remove(); });
    }, data.duration || 3500);
}

// Basic keyboard navigation for the DUI
$(document).keydown(function(e) {
    // This part usually sends NUI callbacks back to Lua
    // to trigger the 'onConfirm' functions in your script.
    if (e.which == 38) { // Up
        // Logic to move activeIndex up
    } else if (e.which == 40) { // Down
        // Logic to move activeIndex down
    } else if (e.which == 13) { // Enter
        // Send message to Lua: $.post('https://res/confirm', JSON.stringify({index: activeIndex}));
    }
});