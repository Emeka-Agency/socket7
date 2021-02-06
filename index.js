const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tokenizer = require('rand-token');
const fs = require('fs');
var faker = require('faker');

app.use(require('express').static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

////////////////////////////////
////////// CORE ////////////////
////////////////////////////////

function initSchemes(dir_path) {
    console.log(`initSchemes with ${dir_path}`);
    fs.readdirSync(dir_path).forEach((file) => {
        console.log(`initSchemes file : ${dir_path}/${file}`);
        let data = fs.readFileSync(`${dir_path}/${file}`)
        addScheme(JSON.parse(data));
    });
}

function addScheme(scheme) {
    if(!scheme) return false;
    if(!scheme.type) return false;
    scheme_list[scheme.type] = scheme;
}

function getRandomToken(type = undefined, range = 32) {
    let value = tokenizer.uid(range);
    while(list_tokens.indexOf(value) > -1) {
        value = tokenizer.uid(range);
    }
    return value;
}

function getScheme(room_id) {
    return roomOpened(room_id) ? rooms[room_id].scheme : scheme_list[room_id].scheme;
}

function getState(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        return rooms[room_id].state || {};
    }
    return {};
}

var rooms = {};
var list_tokens = [];
var scheme_list = {};

initSchemes(`${__dirname}/private/tables/schemes`);

// {
//     id_project_YYMMDD: {
//         'id_spread': 15,
//          'state': {
//              'columns': 3,
//              'a': {
//                  'c-a-1': {'used': true, 'user': 'token'},
//                  'c-a-2': {'used': false, 'user': 'token'},
//                  'c-a-3': {'used': true, 'user': 'token'},
//              },
//              'b': {
//                  'c-b-1': {'used': false, 'user': 'token'},
//                  'c-b-2': {'used': true, 'user': 'token'},
//                  'c-b-3': {'used': false, 'user': 'token'},
//              },
//              'c': {
//                  'c-c-1': {'used': false, 'user': 'token'},
//                  'c-c-2': {'used': false, 'user': 'token'},
//                  'c-c-3': {'used': true, 'user': 'token'},
//              },
//          },
//         'users': {
//             'id': {
//                 'name': '',
//                 'pic_url': '',
//             }
//         },
//     },
// }

////////////////////////////////
////////// ROOMS ///////////////
////////////////////////////////

function roomExists(room_id) {
    // check_symfony or rooms_scheme
    // put rooms_scheme in txt files
    return getScheme(room_id) != undefined;
}

function roomOpened(room_id) {
    return rooms[room_id] != undefined;
}

function roomScheme(room_id) {
    return scheme_list[room_id];
}

function fakerDatas(room_id) {
    const lines = Math.random() * 30 + 10;
    let index = 0, _bool;
    switch(room_id) {
        case 'movies_list':
            for(let i = 1; i <= lines; i++) {
                index = 0;
                _bool = faker.random.boolean();
                setStateLine(room_id, i, {});

                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.title())/* Name */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.past())/* Start date */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.future())/* Stop date */
            }
            break;
        case 'user_params':
            for(let i = 1; i <= lines; i++) {
                index = 0;
                _bool = faker.random.boolean();
                setStateLine(room_id, i, {});

                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName())/* Firstname */
                !_bool && index++;
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName())/* Lastname */
                !_bool && index++;
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, Math.random() * 2 > 1 ? 'ACTIVE' : 'INACTIVE')/* Status */
                !_bool && index++;
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean())/* IS_ADMIN */
                !_bool && index++;
                faker.random.boolean() && setRoomState(room_id, i, `c-${i}-${++index}`, faker.phone.phoneNumber())/* Téléphone */
            }
            break;
        case 'permissions':
            for(let i = 1; i <= lines; i++) {
                index = 0;
                _bool = faker.random.boolean();
                setStateLine(room_id, i, {});

                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.sentence())/* Permission */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean())/* ADMIN */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean())/* MANAGER */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean())/* PRESS */
                _bool && setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean())/* USER */
            }
            break;
        default:
            return false;
    }
    return true;
}

function openRoom(room_id, user) {
    if(roomExists(room_id) && !roomOpened(room_id)) {
        rooms[room_id] = {
            // when add col change nb_lines
            scheme: getScheme(room_id),
            state: {},
            users: {
                [user.id]: {
                    name: user.name,
                    pic_url: user.pic_url,
                }
            },
        }
        fakerDatas(room_id);
        return true;
    }
    return false;
}

function addRowToState(room_id, id_line, col_offset) {
    if(!roomExists(room_id) || !roomOpened(room_id)) {
        return false;
    }
    getScheme(room_id).forEach(function(elem, index) {
        setRoomState(room_id, id_line, `c-${id_line}-${index + col_offset}`, '');
    });
}

function setStateLine(room_id, line, value) {
    rooms[room_id].state[line] = value;
}

function setRoomState(room_id, line, cell_id, value) {
    rooms[room_id].state[line][cell_id] = value;
}

function roomUsers(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        return rooms[room_id].users;
    }
    return {};
}

function roomState(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        return rooms[room_id].state;
    }
    return {};
}

function roomEmpty(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        return roomUsers(room_id).length == 0;
    }
    return false;
}

function destroyRoom(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        if(!roomEmpty(room_id)) {
            // empty the room
        }
        delete rooms[room_id];
    }
    return false;
}

////////////////////////////////
////////// USERS ///////////////
////////////////////////////////

function createUser() {
    return {
        name: faker.name.firstName(),
        id: faker.internet.password(),
        pic_url: faker.image.imageUrl(),
    };
}

function addUserInRoom(user, room_id) {
    openRoom(room_id, user);
    if(roomExists(room_id) && roomOpened(room_id) && userExists(user.id) && !userInRoom(user.id, room_id)) {
        rooms[room_id].users[user.id] = {name: user.name, pic_url: user.pic_url,};
        return true;
    }
    return false;
}
function removeUserFromRoom(user_id, room_id) {
    if(roomExists(room_id) && roomOpened(room_id) && userExists(user_id) && userInRoom(user_id, room_id)) {
        delete rooms[room_id].users[user_id];
    }
    if(roomEmpty(room_id)) {
        destroyRoom(room_id);
    }
}

function userExists(user_id) {
    return list_tokens.indexOf(user_id) > -1;
}

function userInRoom(user_id, room_id) {
    if(userExists(user_id) && roomExists(room_id) && roomOpened(room_id)) {
        return rooms[room_id].users[user_id] != undefined;
    }
    return false;
}

function addUserToken(user_id) {
    list_tokens.push(user_id);
}

function removeUserToken(user_id) {
    list_tokens.splice(list_tokens.indexOf(user_id), 1);
}

function getUser(user_id, room_id) {
    if(!roomExists(room_id) && !roomOpened(room_id)) {
        return false;
    }
    if(!userExists(user_id)) {
        return false;
    }
    return roomUsers(room_id)[user_id] || false;
}

////////////////////////////////
////////// SOCKET //////////////
////////////////////////////////

io.on('connection', (socket) => {
    function checkRoom(channel, room_id = undefined) {
        if(room_id == undefined) {
            io.to(socket.id).emit(channel, {
                status: 'error',
                message: `Channel ${channel} : no room id provided`,
            });
            return false;
        }
        if(!roomExists(room_id)) {
            io.to(socket.id).emit(channel, {
                status: 'error',
                message: `Room ${room_id} does not exist`,
            });
            return false;
        }
        return true;
    }
    function checkUser(obj) {
        if(obj.user_id == undefined) {
            return createUser();
        }
        else {
            return {
                name: obj.user_name,
                id: obj.user_id,
                pic_url: obj.user_pic_url,
            }
        }
    }
    function handleCellAction(channel, params) {
        console.log('checkRoom');
        if(!checkRoom(channel, params.room_id)) {
            return false;
        }
        console.log('userExists');
        if(!userExists(params.user_id)) {
            return false;
        }
        console.log('Everything is right');
        if(params.change_state) {
            console.log('Set state');
            setRoomState(params.room_id, params.cell_id.split('-')[1], params.cell_id, params.value);
        }
        return true;
    }
    ////////////////////////////////////
    socket.on('connect_user', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('connect_room', (msg) => {
        console.log(msg);
        if(!checkRoom('connect_room', msg.room_id)) {
            return false;
        }

        let user = checkUser(msg);
        addUserToken(user.id);

        addUserInRoom(user, msg.room_id);

        socket.join(msg.room_id);

        console.log(`Emit on channel user_connection to room ${msg.room_id}`);
        socket.to(msg.room_id).emit('user_connection', {
            users: roomUsers(msg.room_id),
        });

        console.log(`Emit on channel connect_room to socket ${socket.id}`);
        io.to(socket.id).emit('connect_room', {
            user: user,
            room_id: msg.room_id,
            params: roomScheme(msg.room_id),
            users: roomUsers(msg.room_id),
            state: getState(msg.room_id),
        });
    });
    ////////////////////////////////////
    socket.on('change_room', (msg) => {
        console.log(msg);
        if(!checkRoom('change_room', msg.room_id)) {
            return false;
        }

        if(!checkRoom('change_room', msg.new_room)) {
            return false;
        }

        removeUserFromRoom(msg.user.id, msg.room_id);
        addUserInRoom(msg.user, msg.new_room);

        console.log(`Emit on channel user_leave to room ${msg.room_id}`);
        socket.to(msg.room_id).emit('user_leave', {
            users: roomUsers(msg.room_id),
        });

        socket.leave(msg.room_id);
        socket.join(msg.new_room);

        console.log(`Emit on channel user_connection to room ${msg.new_room}`);
        socket.to(msg.new_room).emit('user_connection', {
            users: roomUsers(msg.room_id),
        });

        console.log(`Emit on channel connect_room to socket ${socket.id}`);
        io.to(socket.id).emit('connect_room', {
            room_id: msg.new_room,
            params: roomScheme(msg.new_room),
            users: roomUsers(msg.new_room),
            state: getState(msg.new_room),
        });
    });
    ////////////////////////////////////
    socket.on('leave_room', (msg) => {
        console.log(msg);
        if(!checkRoom('leave_room', msg.room_id)) {
            return false;
        }

        if(userExists(msg.user_id)) {
            removeUserFromRoom(msg.user_id, msg.room_id);
            removeUserToken(msg.user_id);
        }

        socket.to(msg.room_id).emit('user_leave', {
            users: roomUsers(msg.room_id),
        });
    });
    ////////////////////////////////////
    socket.on('click_cell', (msg) => {
        console.log(msg);
        if(!handleCellAction('click_cell', msg)) {
            return false;
        }
        socket.to(msg.room_id).emit('click_cell', {
            cell_id: msg.cell_id,
            user: getUser(msg.user_id, msg.room_id),
            user_id: msg.user_id,
            value: msg.value,
        });
        io.to(socket.id).emit('click_cell', {
            cell_id: msg.cell_id,
            used: true,
            user_id: msg.user_id,
        });
    });
    ////////////////////////////////////
    socket.on('change_cell', (msg) => {
        console.log(msg);
        if(!handleCellAction('change_cell', msg)) {
            return false;
        }
        socket.to(msg.room_id).emit('change_cell', {
            cell_id: msg.cell_id,
            user: getUser(msg.user_id, msg.room_id),
            user_id: msg.user_id,
            value: msg.value,
        });
    });
    ////////////////////////////////////
    socket.on('leave_cell', (msg) => {
        console.log(msg);
        if(!handleCellAction('leave_cell', msg)) {
            return false;
        }
        socket.to(msg.room_id).emit('leave_cell', {
            cell_id: msg.cell_id,
            user: getUser(msg.user_id, msg.room_id),
            user_id: msg.user_id,
            value: msg.value,
        });
        io.to(socket.id).emit('leave_cell', {
            cell_id: msg.cell_id,
            used: false,
            user_id: msg.user_id,
            value: msg.value,
        });
    });
    ////////////////////////////////////
    socket.on('chat_message', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('add_row', (msg) => {
        addRowToState(msg.room_id, msg.id_line, msg.col_offset);
        socket.to(msg.room_id).emit('add_row', {});
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});