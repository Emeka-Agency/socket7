// mettre user en sessionStorage pour le retrouver sur un même tab et avoir plusieurs users

const initHeadLink = (elem) => {
    elem.addEventListener('click', function(e) {
        e.preventDefault();
        console.log(room.scheme);
        if(room.scheme != undefined) {
            socket.emit('change_room', {
                room_id: getLocaleRoomId(),
                user_id: room.user_infos.id,
                new_room_id: e.currentTarget.dataset.type,
            });
        }
        else {
            socket.emit('connect_room', {
                room_id: e.currentTarget.dataset.type,
            });
        }
    });
}

const initTrigger = (elem = null) => {
    if(!elem) {
        return false;
    }
    byId(elem.id).addEventListener('change', function(event) {
        if(event.currentTarget.classList.contains('inactive')) {
            window.alert(`Already used by another user`);
        }
        else {
            if(
                event.currentTarget.classList.contains('for-select')
            ) {
                console.log('leave_cell onChange');
                console.log(room.user_infos.id);
                socket.emit('leave_cell', {
                    user_id: room.user_infos.id,
                    cell_id: event.currentTarget.id,
                    cell_value: getCellValue(event.currentTarget),
                    room_id: getLocaleRoomId(),
                });
            }
        }
    });
    byId(elem.id).addEventListener('click', function(event) {
        if(event.currentTarget.classList.contains('inactive')) {
            window.alert(`Already used by another user`);
        }
        else {
            if(
                event.currentTarget.classList.contains('for-checkbox')
            ) {
                console.log('leave_cell onClick');
                console.log(room.user_infos.id);
                socket.emit('leave_cell', {
                    user_id: room.user_infos.id,
                    cell_id: event.currentTarget.id,
                    cell_value: getCellValue(event.currentTarget),
                    room_id: getLocaleRoomId(),
                });
            }
            else if(
                event.currentTarget.classList.contains('for-select')
            ) {
                // console.log('click_cell onClick');
                // console.log(room.user_infos.id);
                // socket.emit('click_cell', {
                //     user_id: room.user_infos.id,
                //     cell_id: event.currentTarget.id,
                //     cell_value: getCellValue(event.currentTarget),
                //     room_id: getLocaleRoomId(),
                // });
            }
            else {
                console.log('click_cell onClick');
                console.log(room.user_infos.id);
                socket.emit('click_cell', {
                    user_id: room.user_infos.id,
                    cell_id: event.currentTarget.id,
                    room_id: getLocaleRoomId(),
                });
            }
        }
    });
    byId(elem.id).addEventListener('focusout', function(event) {
        if(event.currentTarget.classList.contains('active')) {
            if(
                event.currentTarget.classList.contains('for-text')
                ||
                event.currentTarget.classList.contains('for-date')
            ) {
                console.log('leave_cell onFocusOut');
                console.log(room.user_infos.id);
                socket.emit('leave_cell', {
                    user_id: room.user_infos.id,
                    cell_id: event.currentTarget.id,
                    cell_value: getCellValue(event.currentTarget),
                    room_id: getLocaleRoomId(),
                });
            }
        }
    });
}

function getCellValue(elem) {
    if(elem.classList.contains('for-text')) {
        return byId(event.currentTarget.id).querySelector('.to-exchange').value;
    }
    if(elem.classList.contains('for-date')) {
        return byId(event.currentTarget.id).querySelector('.to-exchange').value;
    }
    if(elem.classList.contains('for-checkbox')) {
        return byId(event.currentTarget.id).querySelector('.to-exchange').checked;
    }
    if(elem.classList.contains('for-select')) {
        return byId(event.currentTarget.id).querySelector('.to-exchange').value;
    }
}

function forMyRoom(_id) {
    return getLocaleRoomId() == _id;
}

function isMe(_id) {
    return _id == room.user_infos.id;
}

// ==================================================
// ==================================================
// ==================================================

var log = true;

var valid = true;

const room = {
    id: undefined,
    type: undefined,
    scheme: undefined,
    name: undefined,
    state: undefined,
    user_infos: {
        id: undefined,
        name: '',
        pic_url: '',
    },
    update_user(user) {
        console.log('update_user');
        console.log(user);
        this.user_infos.id = user.id;
        this.user_infos.name = user.name;
        this.user_infos.pic_url = user.pic_url;
        return this;
    }
};

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

socket.on('connect_room', function(msg) {
    console.log('connect_room');
    console.log(msg);
    if ((!room.user_infos.id && !msg.id) || !msg.settings) {
        // redirection
        valid = false;
        return false;
    }
    // if(room.scheme == undefined) {
        room.scheme = msg.settings;
        m_app.changeTable(msg.settings);
    // }
    if(room.name == undefined) {
        room.name = msg.settings.name;
    }
    if(getLocaleRoomId() == undefined) {
        room.id = msg.settings.id;
    }
    if(room.type == undefined) {
        room.type = msg.settings.type;
    }
    if(room.state == undefined) {
        room.state = msg.state;
    }

    if(msg.me) {
        room.update_user(msg.me);
    }

    if(!m_app.built) {
        buildInterface();
        buildTable();
    }
})

socket.on('room_id', function(msg) {
    console.log('room_id');
    console.log(msg);
    if(!forMyRoom(msg.room_id)) {
        return false;
    }
});

socket.on('click_cell', function(msg) {
    console.log('click_cell');
    console.log(msg);
    let cell = byId(msg.cell);
    if(cell.classList.contains('for-text') && isMe(msg.user)) {
        console.log('I activate the input/text');
        cell.querySelector('span.to-exchange').classList.remove('active');
        cell.querySelector('span.to-exchange').classList.add('inactive');
        cell.querySelector('.to-exchange').value = cell.querySelector('span').innerText.replace('---', '');
        cell.querySelector('.to-exchange').classList.remove('inactive');
        cell.querySelector('.to-exchange').classList.add('active');
        cell.querySelector('.to-exchange').focus();
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    if(cell.classList.contains('for-text') && !isMe(msg.user)) {
        console.log('The input/text is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
    if(cell.classList.contains('for-date') && isMe(msg.user)) {
        console.log('I activate the input/date');
        cell.querySelector('span.to-exchange').classList.remove('active');
        cell.querySelector('span.to-exchange').classList.add('inactive');
        cell.querySelector('.to-exchange').classList.remove('inactive');
        cell.querySelector('.to-exchange').classList.add('active');
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    if(cell.classList.contains('for-date') && !isMe(msg.user)) {
        console.log('The input/date is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
});

socket.on('leave_cell', function(msg) {
    console.log('leave_cell');
    console.log(msg);
    let cell = byId(msg.cell);

    console.log(cell.classList);
    
    if(cell.classList.contains('for-text')) {
        // if(!isMe(msg.user)) {
            cell.querySelector('span').innerHTML = msg.cell_value || '---';
        // }
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
    }
    if(cell.classList.contains('for-date')) {
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
    }
    if(cell.classList.contains('for-checkbox') && !isMe(msg.user)) {
        cell.querySelector ('.to-exchange').checked = msg.cell_value;
    }
    if(cell.classList.contains('for-select') && !isMe(msg.user)) {
        cell.querySelector ('.to-exchange').value = msg.cell_value;
    }

    if(isMe(msg.user_id)) {
        // active
        cell.classList.remove('active');
        cell.classList.remove('inactive');
    }
    else {
        // block
        cell.classList.remove('active');
        cell.classList.remove('inactive');
    }
});

socket.on('user_leave', function(msg) {
    console.log('user_leave');
    console.log(msg);
    if(!forMyRoom(msg.room_id)) {
        return false;
    }
    // manage de-click si uear leave
});

window.onbeforeunload = function(event) {
    console.log(room.user_infos);
    socket.emit('user_leave', {
        room_id: getLocaleRoomId(),
        user_id: room.user_infos.id
    });
}