const head_menus = [
    {"label": "Booking manager", "type": "bookman"},
    {"label": "Confirmation manager", "type": "confman"},
    {"label": "Contrats", "type": "contracts"},
    {"label": "Dérogations", "type": "legal_kid_contract"},
    {"label": "Jour à jour", "type": "jaj"},
    {"label": "Paiements", "type": "payments"},
    {"label": "Participants", "type": "participant"},
    {"label": "PB projet", "type": "pb_p"},
    {"label": "Rapports", "type": "reports"},
    {"label": "Paramètres utilisateurs", "type": "user_params"},
    {"label": "Permissions", "type": "permissions"},
];

const app = {
    
    // GETTER
    gearSpinner: document.querySelector('.gearSpinner'),
    drawer: document.querySelector('.drawer'),
    table: document.querySelector('.table'),
    openModale: document.querySelector('.open_modale'),
    addCol: document.querySelector('.logo-addCol'),
    addRow: document.querySelector('.logo-addRow'),
    checkRow: null,
    checkAllRow: null,
    scheme() {return app.params ? app.params.scheme : null;},

    navigationBuilt: false,
    built: false,

    tableType() {
        return app.params ? app.params.type : null;
    },

    params: undefined,

    setParams(params) {
        if(app.params == undefined) {
            app.params = params;
            app.init();
        }
        else {
            app.changeTable(params);
        }
    },

    changeTable(settings) {
        app.params = settings;
        app.destroy();
        app.init();
    },

    init() {
        !app.navigationBuilt && app.buildNavigation();

        app.checkAllRow = document.querySelector('.sheet-selector');
        // checkbox for select one row
        app.checkRow = document.querySelectorAll('.line-selector');
        // open modale add row & col
        // Add new row
        // TODO: make event to button
        // Add new col
        // TODO: make event to button
        // Builder eventlistener 
        app.buildAddEventListener();

        if(!app.tableType()) {
            return false;
        }
        
        app.buildInterface();
        app.buildTable();
    },

    destroy() {
        app.gearSpinner.removeEventListener('click', app.handleDrawerClick, true);
        // app.addCol.removeEventListener('click', app.handleAddColOnClick, true);
        app.addRow.removeEventListener('click', app.handleAddRowOnClick, true);
        app.openModale.removeEventListener('click', app.handleOpenModal, true);
        app.checkRow.forEach(element => {
            element.removeEventListener('click', app.handleSelectRowOnClick, true);
        });
        app.gearSpinner.removeEventListener('click', app.handleDrawerClick, true);
    },

    // Builder to eventlistener
    buildAddEventListener() {
        app.gearSpinner.addEventListener('click', app.handleDrawerClick, true);
        // app.addCol.addEventListener('click', app.handleAddColOnClick, true);
        app.addRow.addEventListener('click', app.handleAddRowOnClick, true);
        app.openModale.addEventListener('click', app.handleOpenModal, true);
        // Add event on all checkbox
        app.checkRow.forEach(element => {
            element.addEventListener('click', app.handleSelectOnClick, true);
        });
        app.checkAllRow && app.checkAllRow.addEventListener('click', app.handleSelectOnClick, true);  
    },

    handleOpenModal(evt) {
        evt.preventDefault();
        openModale(addcol());
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
            getNavigationBar().style.removeProperty('left');
            getNavigationBar().style.removeProperty('width');
        }
        else if (app.drawer.classList.contains('inactive')) {
            document.querySelector('.drawer').classList.replace("inactive", "active");
            app.table.style.left = "400px";
            app.table.style.width = "calc(100% - 400px)";
            getNavigationBar().style.left = "400px";
            getNavigationBar().style.width = "calc(100% - 400px)";
        }
    },

    handleSelectOnClick(evt) {
        console.log("handleSelectOnClick");
        const elementClick = evt.currentTarget.querySelector('input');
        let allCellSelected = null, boxType = null;
        if (evt.currentTarget.classList.contains('line-selector')) {
            allCellSelected = evt.currentTarget.parentElement.children;
            boxType = 'LINE';
        }
        else if (evt.currentTarget.classList.contains('sheet-selector')) {
            allCellSelected = document.querySelectorAll('.cell');
            boxType = 'SHEET';
        }
        app.forSelectCell(allCellSelected, elementClick, boxType);
    },

    /**
     * 
     * @param evt Click event on board
     * @can Action : Select one or all cellSheet
     * @can Action : Unselect one or all cellSheet
     */ 
    forSelectCell(cellsSelect, elementClick, boxType ) {
        let boxChecked = app.verifyChecked(elementClick);
        let boxNotChecked = app.verifyNotChecked(elementClick);

        // What s checkbox clicked ?
        if (boxType === 'SHEET') {
            if (elementClick.checked) {
                app.reverseCheck(elementClick, boxChecked);
            }
            else if (!elementClick.checked) {
                app.reverseCheck(elementClick, boxNotChecked);
            }
        }
        else if (boxType === 'LINE') {
            elementClick.checked ? elementClick.checked = false : elementClick.checked = true;
        }
    },

    reverseCheck(elementClick, box ) {
        elementClick.checked = !elementClick.checked;
        for (let index = 0; index < box.length; index++) {
            document.getElementById(box[index].id).checked = elementClick.checked;
        }
    },

    // Verify checkbox checked
    verifyChecked(elementClick) {
        const allInput = Array.from(document.querySelectorAll('.row .line-selector  input[type="checkbox"]:checked'));
        allInput.push(elementClick);
        // console.log('INPUT', allInput);
        return allInput;
    },

    verifyNotChecked(currentE) {
        const allInput = Array.from(document.querySelectorAll('.row .line-selector  input[type="checkbox"]:not(:checked)'));
        return allInput;
    },

    // Add new column
    handleAddColOnClick(evt) {
        console.log("handleAddColOnClick");
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
            `<div id="${el.querySelector('.tab-line-index').innerText}-${el.childElementCount - 1}" class="cell">
                <input type="number" class="inactive">
                <span class="active">---</span>
            </div>`;

            initCellTriggers(document.getElementById(`${el.querySelector('.tab-line-index').innerText}-${el.childElementCount - 2}`));
        });
    },

    // Add more row
    handleAddRowOnClick: (evt = null) => {

        let index = -1, tab = [], scheme = app.scheme();
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col colContent">`;
        if(scheme) {
            const idCell = document.querySelectorAll('.row').length - 1;
            evt && socketAddRow(idCell);
            tab[++index] = `<div class="cell for-checkbox line-selector">`;
            tab[++index] = `<input id="${idCell + 1}-checkbox" type="checkbox" class="all-select"/>`;
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
            return `<h2>${menu.label}<a class="absolute-link head-link-type" data-type="${menu.type}"></a></h2>`
        }).join(' '));

        app.initNavigation();

        app.navigationBuilt = true;
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
    
    buildTable(state = undefined) {
        let index = -1; tab = [], scheme = app.scheme();
        tab[++index] = `<div class="main-table">`;
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col thead">`;
        if(scheme) {
            tab[++index] = `<div class="cell c-title sheet-selector">`;
            tab[++index] = `<input id="0-0" type="checkbox" class="all-select"/>`;
            tab[++index] = `<label for="0-0"></label>`;
            tab[++index] = `</div>`;
            tab[++index] = `<div class="cell c-title tab-line-indexes">#</div>`;
            scheme.forEach((line) => {
                tab[++index] = `<div class="cell c-title">${line.label}</div>`;
            });
        }
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;

        replaceInto(oneByType('section.table'), purgeString(tab.join(' ')));
        // on build emit get_state
        // for i <th scope="row">i</th>
    
        app.fillState(state);
    },

    fillState(base = 20) {
        let content = '';
        // base is random number used for tests
        if(base != null && typeof base == 'number') {
            // console.log('Fill table with blank lines');
            for(let i = 0; i < base; i++) {
                content += app.createLine(i);
            }
        }
        else {
            // console.log('Fill table with datas');
            Object.keys(base).forEach(function(key) {
                content += app.createLine(key, base[key]);
            });
        }

        addInto(oneByType('.main-table'), content);

        app.checkRow = document.querySelectorAll('.line-selector');

        app.init_cells();

        app.built = true;
    },

    createLine(_i, value = null) {
        let index = -1, tab = [], scheme = app.scheme();
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col colContent">`;
        if(scheme) {
            tab[++index] = `<div class="cell for-checkbox line-selector">`;
            tab[++index] = `<input id="${_i}-checkbox" type="checkbox" class="all-select"/>`;
            tab[++index] = `<label for="${_i}-checkbox" class="checkrow"></label>`;
            tab[++index] = `</div>`;
            tab[++index] = `<div id="${_i}-${0}" class="cell tab-line-index">${_i}</div>`;
            for(let j = 0; j < scheme.length; j++) {
                tab[++index] = app.cellType(scheme[j], _i, j + 1, value != null ? value[`c-${_i}-${j + 1}`] : undefined);
            }
        }
        tab[++index] = `</div>`;
        tab[++index] = `</div>`;

        return purgeString(tab.join(' '));
    },

    //  select multiple inputs (with ctrl + click and option multi-click dans une toolbar)

    cellType(params, x, y, value = '---') {
        console.log(value);
        let index = -1, tab = [];
        tab[++index] = `<div id="c-${x}-${y}" class="cell`;
        if(params.cell_type != 'span/text') tab[index] += ` sheet-cell`;
        if(params.cell_type == 'input/text') tab[index] +=  ` for-text`;
        if(params.cell_type == 'input/date') tab[index] +=  ` for-date`;
        if(params.cell_type == 'input/checkbox') tab[index] +=  ` for-checkbox`;
        if(params.cell_type == 'select') tab[index] +=  ` for-select`;
        tab[index] += `">`;
        switch(params.cell_type) {
            case 'input/text':
                tab[++index] = `<input class="inactive to-exchange" type="text" value="${value}"/>`;
                break;
            case 'input/date':
                tab[++index] = `<input class="inactive to-exchange" type="date"/>`;
                break;
            case 'input/checkbox':
                tab[++index] = `<label for="${x}-${y}-checkbox" class="active switch">`;
                tab[++index] = `<input id="${x}-${y}-checkbox" type="checkbox" class="to-exchange" ${value ? 'checked' : ''}>`;
                tab[++index] = `<span class="slider round"></span>`;
                tab[++index] = `</label>`;
                break;
            case 'input/textarea':
                break;
            case 'input/tel':
                break;
            case 'input/email':
                break;
            case 'select':
                tab[++index] = `<select class="active to-exchange">`;
                params.options.forEach((option) => {
                    tab[++index] = `<option value="${option.value}" ${value == option.value ? 'selected' : ''}>${option.label}</option>`;
                })
                tab[++index] = `</select>`;
                break;
            case 'span/text':
                tab[++index] = `<span class="active text">${value}</span>`;
                break;
            case 'span/date':
                tab[++index] = `<span class="active date">${value}</span>`;
                break;
            case 'span/url':
                tab[++index] = `<span class="active url">`;
                tab[++index] = `<a class="absolute-link" href="${value}}" target="_blank">`;
                tab[++index] = `${value}`;
                tab[++index] = `</a>`;
                tab[++index] = `</span>`;
                break;
            case 'span/img':
                tab[++index] = `<span class="active img">`;
                tab[++index] = `<img class="background-image" src="${value}}"/>`;
                tab[++index] = `</span>`;
                break;
            case 'span/checkbox':
                // TODO Prendre 2 icônes pour l'état checked et non-checked et les mettre en after du span
                tab[++index] = `<span class="active checkbox${value == true ? ' checked' : ''}">${value}</span>`;
                break;
            case 'span/button':
                tab[++index] = `<span class="active button">${value}</span>`;
                break;
            case 'textarea':
                break;
            default:
                break;
        }
        if(
            [
                'input/checkbox',
                'select',
                'span/text',
                'span/date',
                'span/url',
                'span/img',
                'span/checkbox',
                'span/button'
            ].indexOf(params.cell_type) == -1
        ) {
            tab[++index] = `<span class="active to-exchange">${value}</span>`;
        }

        tab[++index] = `</div>`;

        return purgeString(tab.join(' '));
    },

    initNavigation() {
        [].forEach.call(document.querySelectorAll('.head-link-type'), initNavigationLink);
    },

    init_cells() {
        [].forEach.call(document.querySelectorAll('.sheet-cell'), initCellTriggers);
    }
};