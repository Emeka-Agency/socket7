let app = {
    
    drawer: document.querySelector('.drawer'),
    table: document.querySelector('.table'),

    addCol: document.querySelector('.addCol'),
    addRow: document.querySelector('.addRow'),

    sections: [
        {
            name: 'Jour à jour',
            columnTitle: [
                'id',
                'candidats',
                'disponible',
                'remuneration',
            ],
            membres: 10,

        },
        {
            name: 'Membres',
            columnTitle: [
                'id',
                'prenom',
                'nom',
                'disponibilité',
            ],
            membres: 10,
        },
        {
            name: 'Attribution Manager',
            columnTitle: [
                'id',
                'candidats',
                'rôle',
            ],
            membres: 10,
        },
        {
            name: 'Paiement',
            columnTitle: [
                'id',
                'candidats',
                'extra',
                'remuneration',
            ],
            membres: 10,
        },
    ],

    init: () => 
    {
        app.buildTable();
        // slide section left & right
        app.drawer.addEventListener('click', app.handleOpenDrawerOnClick)

        // click & add col
        app.addCol.addEventListener('click', app.handleAddColOnClick)

        // click & add row
        app.addRow.addEventListener('click', app.handleAddRowOnClick)
    },

    // Slide section on rigth and left
    handleOpenDrawerOnClick: (evt) => {
        evt.preventDefault();
    
        if ( app.drawer.classList.contains("active") ) {

            document.querySelector('.drawer').classList.replace("active", "inactive");
            app.table.style.removeProperty('right');
        }
        else if ( app.drawer.classList.contains('inactive')) {
            
            document.querySelector('.drawer').classList.replace("inactive", "active");
            app.table.style.right = "-350px";
        }
    },

    // Add new column
    handleAddColOnClick: (evt) => {
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

    // Add new row
    handleAddRowOnClick: (evt) => {
        evt.preventDefault();

        // length of total fields
        const cellTitleLenght = document.querySelectorAll('.c-title').length;
        console.log(cellTitleLenght);

        // container parent
        const container = document.querySelector('.main-table');

        // create new row
        const newRow = document.createElement('div');
        newRow.classList.add('row');

        // create a new col for the new row
        const newCol = document.createElement('div');
        newCol.classList.add('col', 'colContent');

        newRow.appendChild(newCol);

        for (let i = 0; i < cellTitleLenght; i++) {
            const newCell = document.createElement('div');
            newCell.classList.add('cell');

            const newInput = document.createElement('input');
            newInput.classList.add('inactive');
            newInput.setAttribute('type', 'text');
            newCell.appendChild(newInput);

            const newSpan = document.createElement('span');
            newSpan.classList.add('active');
            newSpan.innerText = '-';
            newCell.appendChild(newSpan);

            newCol.appendChild(newCell);

        }

        const elementBefore = document.querySelector('.addRow');
        container.insertBefore(newRow, elementBefore);

    },

    buildTable: () => {
        const headTable = document.querySelector('.head-table');
        const nbrTable = app.sections.length;

        const thead = document.querySelector('.thead');

        // Create title of table :
        for (let i = 0; i < nbrTable; i++)
        {
            const newTitle = document.createElement('h2');
            newTitle.innerText = app.sections[i].name;
            headTable.appendChild(newTitle);
    
            // Create row & column :
            const nbrColumn = app.sections[i].columnTitle.length;
            for (let i = 0; i < nbrColumn; i++) 
            {
                console.log(nbrColumn);
                const newCell = document.createElement('cell');
                newCell.classList.add('cell', 'cell-title');
                newCell.innerText = app.sections[i].columnTitle;
                console.log(newCell);
            }
        }

    }


};

document.addEventListener('DOMContentLoaded', app.init)