// mettre user en sessionStorage pour le retrouver sur un même tab et avoir plusieurs users

const initNavigationLink = (elem) => {
    if(!elem) {
        return false;
    }
    elem.addEventListener('click', function(event) {
        event.preventDefault();
        if(userId() != undefined && roomId != undefined) {
            socket.emit('change_room', {
                user: getUser(),
                room_id: roomId(),
                new_room: elem.dataset.type,
            });
        }
        else {
            socket.emit('connect_room', {
                room_id: elem.dataset.type,
            });
        }
    })
}

const initCellTriggers = (elem = null) => {
    if(!elem) {
        return false;
    }
    console.log(elem.id);
    if(cellIsSelect(elem)) {
        byId(elem.id).addEventListener('change', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            socket.emit("change_cell", {
                cell_id: elem.id,
                user: userId(),
                room_id: roomId(),
                value: getCellValue(elem),
            })
        });
    }
    else if(cellIsText(elem) || cellIsDate(elem) || cellIsCheckbox(elem)) {
        byId(elem.id).addEventListener('click', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            socket.emit('click_cell', {
                cell_id: elem.id,
                user: userId(),
                room_id: roomId(),
            })
        });
    }
    else if(cellIsText(elem) || cellIsDate(elem)) {
        byId(elem.id).addEventListener('focusout', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            socket.emit('leave_cell', {
                cell_id: elem.id,
                user: userId(),
                room_id: roomId(),
                value: getCellValue(elem),
            });
        });
    }
    else {
        return false;
    }
}

function getCellValue(elem) {
    if(cellIsText(elem)) {
        return byId(elem.currentTarget.id).querySelector('.to-exchange').value;
    }
    if(cellIsDate(elem)) {
        return byId(elem.currentTarget.id).querySelector('.to-exchange').value;
    }
    if(cellIsCheckbox(elem)) {
        return byId(elem.currentTarget.id).querySelector('.to-exchange').checked;
    }
    if(cellIsSelect(elem)) {
        return byId(elem.currentTarget.id).querySelector('.to-exchange').value;
    }
}

function forMyRoom(_id) {return getLocaleRoomId() == _id;}
function isMe(_id) {return _id == room.user_infos.id;}
function cellIsUsed(cell) {return cell.classList.contains('used');}

// ==================================================
// ==================================================
// ==================================================

var log = true;
var valid = true;

function roomId() {return room.id;}
function roomType() {return room.type;}
function roomScheme() {return room.scheme;}
function roomName() {return room.name;}
function roomState() {return room.state;}
function getUser() {return room.user_infos;}
function userId() {return getUser().id;}
function userName() {return getUser().name;}
function userPic() {return getUser().pic_url;}

const room = {
    id: undefined,
    type: undefined,
    scheme: undefined,
    name: undefined,
    state: undefined,
    more_columns: undefined,
    user_infos: {
        id: undefined,
        name: undefined,
        pic_url: undefined,
    },
    updateRoom(params) {
        this.type = params.type;
        this.scheme = params.scheme;
        this.name = params.name;
        this.more_columns = params.more_columns;
    },
    updateUser(user) {
        this.user_infos.id = this.user_infos.id || user.id;
        this.user_infos.name = this.user_infos.name || user.name;
        this.user_infos.pic_url = this.user_infos.pic_url || user.pic_url;
        return this;
    }
};

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

socket.on('connect_room', function(msg) {
    console.log(msg);
    if(msg.user) {
        room.updateUser(msg.user);
    }
    if(msg.params) {
        room.updateRoom(msg.params);
        m_app.setParams(msg.params);
    }
    if(msg.room_id) {
        room.id = msg.room_id;
    }
})

socket.on('user_connection', function(msg) {
    console.log(msg);
})

socket.on('change_room', function(msg) {
    console.log(msg);
})

socket.on('leave_room', function(msg) {
    console.log(msg);
});

window.onbeforeunload = function(event) {
    socket.emit('leave_room', {
        room_id: roomId(),
        user_id: userId()
    });
}

socket.on('click_cell', function(msg) {
    let cell = byId(msg.cell);
    if(cellIsText(cell) && isMe(msg.user)) {
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
    if(cellIsText(cell) && !isMe(msg.user)) {
        console.log('The input/text is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
    if(cellIsDate(cell) && isMe(msg.user)) {
        console.log('I activate the input/date');
        cell.querySelector('span.to-exchange').classList.remove('active');
        cell.querySelector('span.to-exchange').classList.add('inactive');
        cell.querySelector('.to-exchange').classList.remove('inactive');
        cell.querySelector('.to-exchange').classList.add('active');
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    if(cellIsDate(cell) && !isMe(msg.user)) {
        console.log('The input/date is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
});

socket.on('change_cell', function (msg) {
    console.log(msg);
})

socket.on('leave_cell', function(msg) {
    let cell = byId(msg.cell);
    
    if(cellIsText(cell)) {
        cell.querySelector('span').innerHTML = msg.cell_value || '---';
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
    }
    if(cellIsDate(cell)) {
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
    }
    if(cellIsCheckbox(cell) && !isMe(msg.user)) {
        cell.querySelector ('.to-exchange').checked = msg.cell_value;
    }
    if(cellIsSelect(cell) && !isMe(msg.user)) {
        cell.querySelector ('.to-exchange').value = msg.cell_value;
    }

    if(isMe(msg.user_id)) {
        cell.classList.remove('active');
        cell.classList.remove('inactive');
    }
    else {
        cell.classList.remove('active');
        cell.classList.remove('inactive');
    }
});

socket.on('chat_message', function (msg) {
    console.log(msg);
})