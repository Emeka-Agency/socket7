let app = {
    
    // ctn section 
    drawer: document.querySelector('.drawer'),
    table: document.querySelector('.table'),

    init: () => 
    {
        app.drawer.addEventListener('click', app.handleOpenDrawerOnClick)
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
};

document.addEventListener('DOMContentLoaded', app.init)