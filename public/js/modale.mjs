function modale() {
    return document.getElementById('modale');
}

function modaleContainer() {
    return document.getElementById('modale-container');
}

function modaleContent() {
    return document.getElementById('modale-content');
}

function modaleClose() {
    return document.getElementById('modale-close');
}

function openModale(params) {
    modale().classList.add('opened');
    params.modaleClass != undefined && modale().classList.add(params.modaleClass);
    params.contentClass != undefined && modaleContainer().classList.add(params.contentClass);
    modaleContent().innerHTML = closePart() + params.content;
    params.onOpen && params.onOpen();
    modale().addEventListener('click', function(e) {
        if(e.target.id == 'modale') {
            closeModale(params.onClose);
        }
    });
    modale().addEventListener('keyup', function(e) {
        if(e.keyCode === 27) {
            closeModale(params.onClose);
        }
    });
        modaleClose().addEventListener('click', function(e) {
        closeModale(params.onClose);
    });
}

function closeModale(onClose = null) {
    modale().classList.remove('opened');
    modaleContainer().classList.remove(...modaleContainer().classList);
    modaleContent().innerHTML = "";
    onClose != null && onClose();
}

function closePart() {
    return `<span id="modale-close">+</span>`;
}

// ProjectMaker Modale

function addcol(onOpen = null, onClose = null) {
    return {
        onOpen: onOpen,
        onClose: onClose,
        contentClass: 'project-maker',
        content: `
        <h2>Ajouter des collonnes supplémentaires</h2>
        <form>
            <label for="name-col" class="label-name">Choisir un nom :</label>
            <input type="text" name="name-col" id="name-col"></input>
            <label for="type-select" class="label-select">Choisir un type :</label>
            <select name="types" id="type-select>
                <option value="">texte</option>
                <option value="">date</option>
                <option value="">tel</option>
                <option value="">url</option>
                <option value="">numéro</option>
                <option value="">select</option>
                <option value="">checkbox</option>
                <option value="">email</option>
                <option value="">data liste</option>
                <option value="">radio</option>
            </select>
            <button type="button">Ajouter!</button>
        </form>
        `
    };
}

// <li class="radio-choice">
// <input type="radio" name="who_you_are" id="who_you_are-decision-3" value="Je suis un d'étudiant" required/>
// <div class="radio_check"></div>
// <label for="who_you_are-decision-3">
//     <span>Je suis un d'étudiant</span>
// </label>
// </li>

// interface params {
//     onOpen?: Function,
//     onClose?: Function,
//     contentClass?: string,
//     modaleClass?: string,
//     content: string,
// }