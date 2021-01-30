const byId = function(selector) {
    return document.getElementById(selector);
}

const oneByType = function(selector) {
    return document.querySelector(selector);
}

const allByType = function(selector) {
    return document.querySelectorAll(selector);
}

function getRoom() {
    return oneByType("body").id;
}

function addInto(parent, content) {
    parent.innerHTML += content;
}

function insertInto(parent, content) {
    parent.innerHTML = content;
}

function init_cells() {
    [].forEach.call(document.querySelectorAll('.sheet-cell'), initTrigger);
}
//
function initTrigger(elem) {
    byId(elem.id).addEventListener('click', function(event) {
        if(event.currentTarget.classList.contains('inactive')) {
            window.alert(`Already used by another user`);
        }
        else {
            // console.log('je prends le focus de la case '+elem.id);
            socket.emit('click_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
            });
        }
    });
    byId(elem.id).addEventListener('focusout', function(event) {
        // console.log('Leave cell');
        if(event.currentTarget.classList.contains('active')) {
            // console.log('je perds le focus de la case '+elem.id);
            socket.emit('leave_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
                cell_value: byId(event.currentTarget.id).querySelector('input').value
            });
        }
    });
}

function buildInterface() {
    console.log(room.id);
    console.log(room.name);
    let index = -1; tab = [];
    tab[++index] = `<div class="head">`;
    if(room.name) {
        tab[++index] = `<div class="room-name">${room.name}</div>`;
    }
    // if(room.id) {
    //     tab[++index] = `<div class="room-id">${room.id}</div>`;
    // }
    tab[++index] = `</div>`;

    addInto(oneByType('body'), tab.join(' '));
}

function buildTable() {
    console.log(room.scheme);
    let index = -1; tab = [];
    tab[++index] = `<table class="table">`;
    tab[++index] = `<thead>`;
    tab[++index] = `<tr class="last-for-add">`;
    tab[++index] = `<th scope="col">Line</th>`;
    for(let i = 0; i < room.scheme.length; i++) {
        tab[++index] = `<th scope="col">${room.scheme[i].label}</th>`;
    }
    tab[++index] = `</tr>`;
    tab[++index] = `</thead>`;
    tab[++index] = `<tbody>`;
    tab[++index] = `</tbody>`;
    tab[++index] = `</table>`;

    addInto(oneByType('body'), tab.join(' '));
    // on build emit get_state
    // for i <th scope="row">i</th>

    fillState(12);
}

function fillState(base = null) {
    console.log(room.state);
    let index = -1; tab = [];
    // base is random number used for tests
    if(base != null) {
        for(let i = 0; i < base; i++) {
            tab[++index] = `<tr>`;
            tab[++index] = `<th scope="row">${i + 1}</th>`;
            for(let j = 0; j < room.scheme.length; j++) {
                tab[++index] = `<td id="${i + 1}-${j + 1}" class="sheet-cell">`;
                tab[++index] = `<span class="active"></span>`;
                tab[++index] = `<input class="inactive"/>`;
                tab[++index] = `</td>`;
            }
            tab[++index] = `</tr>`;
        }
    }

    addInto(oneByType('tbody'), tab.join(' '));

    init_cells();

    built = true;
}

// ==================================================
// ==================================================
// ==================================================

var socket = io();

var valid = true;
var built = false;

const room = {
    id: getRoom(),
    scheme: undefined,
    name: undefined,
    state: undefined,
    user_infos: {
        id: '',
        name: '',
        pic_url: '',
    },
};

var id = null;

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

document.addEventListener('DOMContentLoaded', function() {
    socket.emit('connect_room', {
        'room_id': room.id,
    });
});

socket.on('connect_room', function(msg) {
    if ((!id && !msg.id) || !msg.settings) {
        // redirection
        valid = false;
        return false;
    }
    if(!id) {
        id = msg.id;
    }
    if(room.scheme == undefined) {
        room.scheme = msg.settings.scheme;
    }
    if(room.name == undefined) {
        room.name = msg.settings.name;
    }
    if(room.id == undefined) {
        room.id = msg.settings.id;
    }

    if(!built) {
        buildInterface();
        buildTable();
    }
})

socket.on('room_id', function(msg) {

});

socket.on('click_cell', function(msg) {
    // console.log(msg);
    let cell = byId(msg.cell);
    // console.log(`Mon id est ${id} et le user qui a cliqué est ${msg.user}`);
    if(msg.user == id) {
        // to input
        cell.querySelector('span').classList.remove('active');
        cell.querySelector('span').classList.add('inactive');
        cell.querySelector('input').value = cell.querySelector('span').innerHTML;
        cell.querySelector('input').classList.remove('inactive');
        cell.querySelector('input').classList.add('active');
        cell.querySelector('input').focus();
        //active
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    else {
        // block
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
});

socket.on('leave_cell', function(msg) {
    // console.log(msg);
    let cell = byId(msg.cell);
    // console.log(`Mon id est ${id} et le user qui a leave est ${msg.user}`);
    
    cell.querySelector('span').innerHTML = msg.cell_value;

    if(msg.user == id) {
        // to span
        cell.querySelector('input').classList.remove('active');
        cell.querySelector('input').classList.add('inactive');
        cell.querySelector('span').classList.remove('inactive');
        cell.querySelector('span').classList.add('active');
        // active
        cell.classList.remove('active');
    }
    else {
        // block
        cell.classList.remove('inactive');
    }
});

socket.on('user_leave', function(msg) {
    // console.log(msg.message);
    // manage de-click si uear leave
});

window.onbeforeunload = function(event) {
    socket.emit('user_leave', {
        id: id
    });
}