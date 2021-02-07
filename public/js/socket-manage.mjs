// mettre user en sessionStorage pour le retrouver sur un même tab et avoir plusieurs users

const socketAddRow = function(id_line) {
    socket.emit('add_row', {
        room_id: roomId(),
        id_line: id_line,
        col_offset: 1,
    });
}

const initNavigationLink = (elem) => {
    if(!elem) {
        return false;
    }
    elem.addEventListener('click', function(event) {
        event.preventDefault();
        if(event.currentTarget.parentElement.classList.contains('current')) {
            return false;
        }
        document.querySelector('h2.current') && document.querySelector('h2.current').classList.remove('current');
        event.currentTarget.parentElement.classList.add('current');
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
    // console.log(elem.id);
    if(cellIsSelect(elem) || cellIsDate(elem)) {
        byId(elem.id).addEventListener('change', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            console.log("change_cell");
            socket.emit("change_cell", {
                cell_id: elem.id,
                user_id: userId(),
                room_id: roomId(),
                value: getCellValue(elem),
                change_state: true,
            });
            return true;
        });
    }
    if(cellIsText(elem) || cellIsCheckbox(elem)) {
        byId(elem.id).addEventListener('click', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            console.log('click_cell');
            socket.emit('click_cell', {
                cell_id: elem.id,
                user_id: userId(),
                room_id: roomId(),
                value: cellIsCheckbox(elem) ? getCellValue(elem) : null,
                change_state: cellIsCheckbox(elem),
            });
            return true;
        });
    }
    if(cellIsText(elem)) {
        byId(elem.id).addEventListener('focusout', function(event) {
            // event.preventDefault();
            if(cellIsUsed(elem)) {
                console.log('Elem is already used by another user.')
                return false;
            }
            console.log('leave_cell');
            socket.emit('leave_cell', {
                cell_id: elem.id,
                user_id: userId(),
                room_id: roomId(),
                value: getCellValue(elem),
                change_state: true,
            });
            return true;
        });
    }
}

function getCellValue(elem) {
    if(cellIsText(elem)) {
        return elem.querySelector('.to-exchange').value;
    }
    if(cellIsDate(elem)) {
        return elem.querySelector('.to-exchange').value;
    }
    if(cellIsCheckbox(elem)) {
        return elem.querySelector('.to-exchange').checked;
    }
    if(cellIsSelect(elem)) {
        return elem.querySelector('.to-exchange').value;
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
    if(msg.room_id) {
        room.id = msg.room_id;
    }
    if(msg.params) {
        room.updateRoom(msg.params);
    }
    if(msg.state && JSON.stringify(room.state) != JSON.stringify(msg.state)) {
        room.state = msg.state;
        m_app.params = msg.params;
        m_app.buildAddEventListener();
        m_app.buildTable(msg.state);
    }
    else if(msg.params) {
        m_app.setParams(msg.params);
    }
});

socket.on('user_connection', function(msg) {
    console.log(msg);
});

socket.on('change_room', function(msg) {
    console.log(msg);
});

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
    console.log('click_cell');
    console.log(msg);
    let cell = byId(msg.cell_id);
    if(cellIsText(cell) && isMe(msg.user_id) && msg.used) {
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
    if(cellIsText(cell) && !isMe(msg.user_id)) {
        console.log('The input/text is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
    if(cellIsDate(cell) && isMe(msg.user_id)) {
        console.log('I activate the input/date');
        cell.querySelector('span.to-exchange').classList.remove('active');
        cell.querySelector('span.to-exchange').classList.add('inactive');
        cell.querySelector('.to-exchange').classList.remove('inactive');
        cell.querySelector('.to-exchange').classList.add('active');
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    if(cellIsDate(cell) && !isMe(msg.user_id)) {
        console.log('The input/date is used');
        cell.classList.remove('active');
        cell.classList.add('inactive');
    }
    if(cellIsCheckbox(cell) && !isMe(msg.user_id)) {
        console.log(`Change checkbox value to ${msg.value}`);
        oneByType(`#${msg.cell_id} input[type="checkbox"].to-exchange`).checked = msg.value;
    }
});

socket.on('change_cell', function (msg) {
    console.log('change_cell');
    console.log(msg);
    let cell = byId(msg.cell_id);
    if(cellIsSelect(cell) && !isMe(msg.user_id)) {
        oneByType(`#${msg.cell_id} select.to-exchange`).value = msg.value;
    }
});

socket.on('leave_cell', function(msg) {
    console.log('leave_cell');
    console.log(msg);
    let cell = byId(msg.cell_id);
    
    if(cellIsText(cell) && isMe(msg.user_id)) {
        cell.querySelector('span').innerHTML = msg.value || '---';
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
    }
    if(cellIsText(cell) && !isMe(msg.user_id)) {
        cell.querySelector('span').innerHTML = msg.value || '---';
        cell.classList.remove('inactive');
        cell.classList.add('active');
    }
    if(cellIsDate(cell)) {
        cell.querySelector('.to-exchange').classList.remove('active');
        cell.querySelector('.to-exchange').classList.add('inactive');
        cell.querySelector('span.to-exchange').classList.remove('inactive');
        cell.querySelector('span.to-exchange').classList.add('active');
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
});

socket.on('add_row', function(msg) {
    m_app.handleAddRowOnClick();
});