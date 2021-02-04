const head_menus = [
    {'label': 'Jour à Jour', 'type': 'jaj'},
    // {'label': 'Booking manager', 'type': 'bookman'},
    // {'label': 'Validation manager', 'type': 'valiman'},
    // {'label': 'Confirmation manager', 'type': 'confman'},
    {'label': 'Movies', 'type': 'movie'},
    {'label': 'Users', 'type': 'user_params'},
    {'label': 'Permissions', 'type': 'permissions'},
];

const app = {
    
    // GETTER
    gearSpinner: document.querySelector('.gearSpinner'),
    drawer: document.querySelector('.drawer'),
    table: document.querySelector('.table'),
    addCol: document.querySelector('.logo-addCol'),
    addRow: document.querySelector('.logo-addRow'),
    checkRow: null,
    scheme() {return app.params ? app.params.scheme : null;},

    built: false,

    tableType() {
        return app.params.type;
    },

    params: {
        "name": "Users",
        "type": "user_params",
        "scheme": [
            {"label": "Firstname", "cell_type": "input/text"},
            {"label": "Lastname", "cell_type": "input/text"},
            {"label": "Status", "cell_type": "select", "options": [
                {"label": "ACTIVE", "value": "ACTIVE"},
                {"label": "INACTIVE", "value": "INACTIVE"}
            ]},
            {"label": "IS_ADMIN", "cell_type": "input/checkbox"},
        ],
        "more_columns": false
    },

    init() {
        app.buildNavigation();
        app.buildInterface();
        app.buildTable();

        app.checkRow = document.querySelectorAll('.line-selector'),
        // slide section left & right
        app.gearSpinner.addEventListener('click', app.handleDrawerClick, true);
        // click & add col
        app.addCol.addEventListener('click', app.handleAddColOnClick, true);
        // click & add row
        app.addRow.addEventListener('click', app.handleAddRowOnClick, true);
        // Builder eventlistener 
        app.buildAddEventListener();
        
    },

    destroy() {
        app.gearSpinner.removeEventListener('click', app.handleDrawerClick, true);
        app.addCol.removeEventListener('click', app.handleAddColOnClick, true);
        app.addRow.removeEventListener('click', app.handleAddRowOnClick, true);
    },

    // Builder to eventlistener
    buildAddEventListener() {
        // Add event on all checkbox
        app.checkRow.forEach(element => {
            element.addEventListener('click', app.handleSelectRowOnClick, true);
        });     
    },

    /**
     * 
     * @param evt Click event on drawer
     * @can Action : Slide section on rigth and left
     * @can Action : Change sub-section menu
     */
    handleDrawerClick(evt) {
        evt.preventDefault();
    
        if (app.drawer.classList.contains("active") ) {
            document.querySelector('.drawer').classList.replace("active", "inactive");
            app.table.style.removeProperty('left');
            app.table.style.removeProperty('width');
            navigationBar().style.removeProperty('left');
            navigationBar().style.removeProperty('width');
        }
        else if (app.drawer.classList.contains('inactive')) {
            document.querySelector('.drawer').classList.replace("inactive", "active");
            app.table.style.left = "400px";
            app.table.style.width = "calc(100% - 400px)";
            navigationBar().style.left = "400px";
            navigationBar().style.width = "calc(100% - 400px)";
        }
    },

    // Select row on click checkbox
    handleSelectRowOnClick(evt) {
        evt.preventDefault();
        const elementClick = evt.currentTarget.querySelector('input');
        elementClick.checked ? elementClick.checked = false : elementClick.checked = true;
       
        const idCurrentCheck = evt.currentTarget.parentElement.children;
        
        [].forEach.call(idCurrentCheck, function(el) {
            console.log('element check', el);
            if (el.classList.contains('rowSelected')) {
                el.classList.remove('rowSelected');
            }
            else {
                el.classList.add('rowSelected');
            }
        })
    },

    // Add new column
    handleAddColOnClick(evt) {
        evt.preventDefault();

        // Add cell title column
        const currentE = document.querySelector('.thead');
        const elementBefore = document.querySelector('.addCol');
        const newDivTitle = document.createElement('div');
        newDivTitle.innerText = '-';
        newDivTitle.classList.add('cell', 'c-title');

        currentE.insertBefore(newDivTitle, elementBefore);

        // // Add another field for this col
        [].forEach.call(document.querySelectorAll('.colContent'), function(el) {
            el.innerHTML += 
            `<div class="cell">
                <input type="number" class="inactive">
                <span class="active">-</span>
            </div>`
        })
    },

    // Add more row
    handleAddRowOnClick: (evt) => {
        let index = -1, tab = [], scheme = app.scheme();
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col colContent">`;
        if(scheme) {
            const idCell = document.querySelectorAll('.row').length;
            tab[++index] = `<div class="cell for-select line-selector">`;
            tab[++index] = `<input id="${idCell + 1}-checkbox" type="checkbox"/>`;
            tab[++index] = `<label for="${idCell + 1}-checkbox"  class="checkrow"></label>`;
            tab[++index] = `</div>`;
            tab[++index] = `<div id="${idCell + 1}-${0}" class="cell tab-line-index">${idCell + 1}</div>`;
            for(let j = 0; j < scheme.length; j++) {
                tab[++index] = app.cellType(scheme[j], idCell + 1, j + 1);
            }
        }
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;

        addInto(oneByType('.main-table'), purgeString(tab.join(' ')));

        app.init_cells();

        app.built = true;

    },


    buildNavigation() {
        purgeString(document.querySelector('.head-table').innerHTML = head_menus.map((menu, key) => {
            return `<h2>${menu.label}<a class="absolute-link head-link-type" href="${menu.type}"></a></h2>`
        }).join(' '));

        app.initNavigation();
    },

    buildInterface() {
        // METTRE EN ÉVIDENCE L'ONGLET COURANT JAUNE MOUTARDE
    //     let index = -1; tab = [];
    //     tab[++index] = `<div class="head">`;
    //     if(room.name) {
    //         tab[++index] = `<div class="room-name">${room.name}</div>`;
    //     }
    //     // if(room.id) {
    //     //     tab[++index] = `<div class="room-id">${room.id}</div>`;
    //     // }
    //     tab[++index] = `</div>`;
    
    //     addInto(oneByType('body'), tab.join(' '));
    },
    
    buildTable() {
        let index = -1; tab = [], scheme = app.scheme();
        tab[++index] = `<div class="main-table">`;
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col thead">`;
        if(scheme) {
            tab[++index] = `<div class="cell c-title sheet-selector">`;
            tab[++index] = `<label for="0-0"></label>`;
            tab[++index] = `<input id="0-0" type="checkbox"/>`;
            tab[++index] = `</div>`;
            tab[++index] = `<div class="cell c-title tab-line-indexes">#</div>`;
            scheme.forEach((line) => {
                tab[++index] = `<div class="cell c-title">${line.label}</div>`;
            });
        }
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;

        addInto(oneByType('section.table'), purgeString(tab.join(' ')));
        // on build emit get_state
        // for i <th scope="row">i</th>
    
        app.fillState(20);
    },

    fillState(base = null) {
        let index = -1, tab = [], scheme = app.scheme();
        // base is random number used for tests
        if(base != null) {
            // console.log('Fill table with blank lines');
            for(let i = 0; i < base; i++) {
                tab[++index] = `<div class="row">`;
                tab[++index] = `<div class="col colContent">`;
                if(scheme) {
                    tab[++index] = `<div class="cell for-select line-selector">`;
                    tab[++index] = `<input id="${i + 1}-checkbox" type="checkbox"/>`;
                    tab[++index] = `<label for="${i + 1}-checkbox" class="checkrow"></label>`;
                    tab[++index] = `</div>`;
                    tab[++index] = `<div id="${i + 1}-${0}" class="cell tab-line-index">${i + 1}</div>`;
                    for(let j = 0; j < scheme.length; j++) {
                        tab[++index] = app.cellType(scheme[j], i + 1, j + 1);
                    }
                }
                tab[++index] = `</div>`;
                tab[++index] = `</div>`;
            }
        }
        else {
            // console.log('Fill table with datas');
        }

        addInto(oneByType('.main-table'), purgeString(tab.join(' ')));

        app.init_cells();

        app.built = true;
    },

    //  select multiple inputs (with ctrl + click and option multi-click dans une toolbar)

    cellType(params, x, y, value = '---') {
        let index = -1, tab = [];
        tab[++index] = `<div id="${x}-${y}" class="cell`;
        if(params.cell_type != 'span/text') tab[index] += ` sheet-cell`;
        if(params.cell_type == 'input/text') tab[index] +=  ` for-text`;
        if(params.cell_type == 'input/date') tab[index] +=  ` for-date`;
        if(params.cell_type == 'input/checkbox') tab[index] +=  ` for-checkbox`;
        if(params.cell_type == 'select') tab[index] +=  ` for-select`;
        tab[index] += `">`;
        switch(params.cell_type) {
            case 'input/text':
                tab[++index] = `<input class="inactive to-exchange" type="text"/>`;
                break;
            case 'input/date':
                tab[++index] = `<input class="inactive to-exchange" type="date"/>`;
                break;
            case 'input/checkbox':
                tab[++index] = `<label for="${x}-${y}-checkbox" class="active switch">`;
                tab[++index] = `<input id="${x}-${y}-checkbox" type="checkbox" class="to-exchange">`;
                tab[++index] = `<span class="slider round"></span>`;
                tab[++index] = `</label>`;
                break;
            case 'select':
                tab[++index] = `<select class="active to-exchange">`;
                params.options.forEach((option) => {
                    tab[++index] = `<option value="${option.value}">${option.label}</option>`;
                })
                tab[++index] = `</select>`;
                break;
            case 'span/text':
            default:
                break;
        }
        if(
            [
                'input/checkbox',
                'select',
                'span/text'
            ].indexOf(params.cell_type) == -1
        ) {
            tab[++index] = `<span class="active to-exchange">${value}</span>`;
        }

        tab[++index] = `</div>`;

        return purgeString(tab.join(' '));
    },

    initNavigation() {
        [].forEach.call(document.querySelectorAll('.head-link-type'), initHeadLink);
    },

    init_cells() {
        [].forEach.call(document.querySelectorAll('.sheet-cell'), initTrigger);
    }
};