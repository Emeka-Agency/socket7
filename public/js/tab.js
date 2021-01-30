var socket = io();

const room = getRoom();

var id = null;

const byId = function(selector) {
    return document.getElementById(selector);
}

function getRoom() {
    return new URL(location.href).searchParams.get("room");
}

function init_cells() {
    [].forEach.call(document.querySelectorAll('.sheet-cell'), initTrigger);
}

function initTrigger(elem) {
    byId(elem.id).addEventListener('click', function(event) {
        if(event.currentTarget.classList.contains('inactive')) {
            window.alert(`Already used by another user`);
        }
        else {
            console.log('je prends le focus de la case '+elem.id);
            socket.emit('click_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
            });
        }
    });
    byId(elem.id).addEventListener('focusout', function(event) {
        // console.log('Leave cell');
        if(event.currentTarget.classList.contains('active')) {
            console.log('je perds le focus de la case '+elem.id);
            socket.emit('leave_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
            });
        }
    });
}

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

document.addEventListener('DOMContentLoaded', function() {
    socket.emit('connect_room', {
        'room_id': room,
    });

    init_cells();
});

socket.on('connect_room', function(msg) {
    if(id == null) {
        id = msg.id;
        // console.log(msg);
    }
    else {
        return false;
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