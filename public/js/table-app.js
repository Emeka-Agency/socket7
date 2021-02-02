let app = {
    
    drawer: document.querySelector('.drawer'),
    table: document.querySelector('.table'),

    addCol: document.querySelector('.addCol'),
    addRow: document.querySelector('.addRow'),

    init: () => 
    {
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

    handleAddRowOnClick: (evt) => {
        // TODO: Finir la fonction!!
        evt.preventDefault();
        const cellTitleLenght = document.querySelectorAll('.c-title').length;
        console.log(cellTitleLenght);

        const container = document.querySelector('.main-table');
        const newRow = document.createElement('div');
        newRow.classList.add('row');

        const newCol = document.createElement('div');
        newCol.classList.add('col', 'colContent');

        newRow.appendChild(newCol);

        for (let i = 0; i < cellTitleLenght; i++) {
            const newCell = document.createElement('div');
            newCell.classList.add('cell');

            newCell.innerHTML += 
            `<input type="text" class="inactive">
            <span class="active">-</span>`

        }

        const elementBefore = document.querySelector('.addRow');
        container.insertBefore(newRow, elementBefore);

    },


};

document.addEventListener('DOMContentLoaded', app.init)