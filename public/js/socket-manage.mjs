function initHeadLink(elem) {
    elem.addEventListener('click', function(e) {
        e.preventDefault();
    });
}

function initTrigger(elem) {
    byId(elem.id).addEventListener('click', function(event) {
        if(event.currentTarget.classList.contains('inactive')) {
            window.alert(`Already used by another user`);
        }
        else {
            socket.emit('click_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
                room_id: getLocaleRoomId(),
            });
        }
    });
    byId(elem.id).addEventListener('focusout', function(event) {
        if(event.currentTarget.classList.contains('active')) {
            socket.emit('leave_cell', {
                user_id: id,
                cell_id: event.currentTarget.id,
                cell_value: byId(event.currentTarget.id).querySelector('input').value,
                room_id: getLocaleRoomId(),
            });
        }
    });
}

function forMyRoom(_id) {
    return getLocaleRoomId() == _id;
}

// ==================================================
// ==================================================
// ==================================================

var log = true;

var valid = true;

const room = {
    // id: getRoom(),
    scheme: undefined,
    name: undefined,
    state: undefined,
    user_infos: {
        id: '',
        name: '',
        pic_url: '',
    },
    update_user(user) {
        console.log(user);
        this.user_infos.id = user.id;
        this.user_infos.name = user.name;
        this.user_infos.pic_url = user.pic_url;
        return this;
    }
};

var id = null;

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

socket.on('connect_room', function(msg) {
    console.log('connect_room');
    console.log(msg);
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
    if(getLocaleRoomId() == undefined) {
        getLocaleRoomId() = msg.settings.id;
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
    if(!forMyRoom(msg.room_id)) {
        return false;
    }
    let cell = byId(msg.cell);
    if(msg.user == id) {
        // to input
        cell.querySelector('span.to-exchange').classList.remove('active');
        cell.querySelector('span.to-exchange').classList.add('inactive');
        cell.querySelector('.to-exchange').value = cell.querySelector('span').innerText.replace('---', '');
        cell.querySelector('.to-exchange').classList.remove('inactive');
        cell.querySelector('.to-exchange').classList.add('active');
        cell.querySelector('.to-exchange').focus();
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
    console.log('leave_cell');
    console.log(msg);
    if(!forMyRoom(msg.room_id)) {
        return false;
    }
    let cell = byId(msg.cell);
    
    cell.querySelector('span').innerHTML = msg.cell_value || '---';

    if(msg.user == id) {
        // to span
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
        // active
        cell.classList.remove('active');
    }
    else {
        // block
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
        id: room.user_infos.id
    });
}