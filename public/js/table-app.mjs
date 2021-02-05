const head_menus = [
    {'label': 'Jour à Jour', 'type': 'jaj'},
    // {'label': 'Booking manager', 'type': 'bookman'},
    // {'label': 'Validation manager', 'type': 'valiman'},
    // {'label': 'Confirmation manager', 'type': 'confman'},
    {'label': 'Movies', 'type': 'movies_list'},
    {'label': 'Users', 'type': 'user_params'},
    {'label': 'Permissions', 'type': 'permissions'},
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
        if(!app.tableType) {
            return false;
        }
        app.buildInterface();
        app.buildTable();

        app.checkAllRow = document.querySelector('.sheet-selector');
        // checkbox for select one row
        app.checkRow = document.querySelectorAll('.line-selector'),
        // open modale add row & col
        // Add new row
        // TODO: make event to button
        // Add new col
        // TODO: make event to button
        // Builder eventlistener 
        app.buildAddEventListener();
    },

    destroy() {
        app.gearSpinner.removeEventListener('click', app.handleDrawerClick, true);
        app.addCol.removeEventListener('click', app.handleAddColOnClick, true);
        app.addRow.removeEventListener('click', app.handleAddRowOnClick, true);
        app.checkRow.forEach(element => {
            element.removeEventListener('click', app.handleSelectRowOnClick, true);
        });
    },

    // Builder to eventlistener
    buildAddEventListener() {
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
    handleAddRowOnClick: (evt) => {
        console.log("handleAddRowOnClick");
        let index = -1, tab = [], scheme = app.scheme();
        tab[++index] = `<div class="row">`;
        tab[++index] = `<div class="col colContent">`;
        if(scheme) {
            const idCell = document.querySelectorAll('.row').length - 1;
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
    
    buildTable() {
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
                    tab[++index] = `<div class="cell for-checkbox line-selector">`;
                    tab[++index] = `<input id="${i + 1}-checkbox" type="checkbox" class="all-select"/>`;
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
        [].forEach.call(document.querySelectorAll('.head-link-type'), initNavigationLink);
    },

    init_cells() {
        [].forEach.call(document.querySelectorAll('.sheet-cell'), initCellTriggers);
    }
};