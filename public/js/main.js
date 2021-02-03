const head_menus = [
    {'label': 'Jour à Jour', 'type': 'jaj'},
    // {'label': 'Booking manager', 'type': 'bookman'},
    // {'label': 'Validation manager', 'type': 'valiman'},
    // {'label': 'Confirmation manager', 'type': 'confman'},
    {'label': 'Movies', 'type': 'movie'},
    {'label': 'Users', 'type': 'user'},
    {'label': 'Permissions', 'type': 'permissions'},
];

document.addEventListener('DOMContentLoaded', function() {
    // BUILD NAVIGATION
    document.querySelector('.head-table').innerHTML = head_menus.map((menu, key) => {
        return `<h2>${menu.label}<a class="absolute-link head-link-type" href="/${menu.type}"></a></h2>`
    }).join(' ').replace(/  /g, '').trim();
})