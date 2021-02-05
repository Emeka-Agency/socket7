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
    // type = one of ['jaj_room', 'type_room']
    // change randomBytes according to token type
    let value = tokenizer.uid(range);
    while(list_tokens.indexOf(value) > -1) {
        value = tokenizer.uid(range);
    }
    return value;
}

function getRandomUser() {
    return {
        name: faker.name.firstName(),
        id: faker.internet.password(),
        pic_url: '',
    };
}

var rooms = {};
var list_tokens = [];
var scheme_list = {};
var rooms_scheme = {};

initSchemes(`${__dirname}/private/tables/schemes`);
// console.log(scheme_list);

// {
//     id_project_YYMMDD: {
//         'id_spread': 15,
//          'state': {
//              'a-1': {'used': true, 'user': 'token'},
//              'a-2': {'used': false, 'user': 'token'},
//              'a-3': {'used': true, 'user': 'token'},
//              'b-1': {'used': false, 'user': 'token'},
//              'b-2': {'used': true, 'user': 'token'},
//              'b-3': {'used': false, 'user': 'token'},
//              'c-1': {'used': false, 'user': 'token'},
//              'c-2': {'used': false, 'user': 'token'},
//              'c-3': {'used': true, 'user': 'token'},
//          }
//         'users': {
//             'id_user': {
//                 'name': '',
//                 'token': '',
//             }
//         },
//     },
// }

function getState(room_id) {
    return {};
}

////////////////////////////////
////////// ROOMS ///////////////
////////////////////////////////

function roomExists(room_id) {
    // check_symfony or rooms_scheme
    // put rooms_scheme in txt files
    return true;
}

function roomOpened(room_id) {
    return rooms[room_id];
}

function openRoom(room_id, user) {
    rooms[room_id] = {
        'state': getState(room_id),
        'users': [],
    }
}

function joinRoom(room_id, user, user_socket) {
    roomUsers(room_id).push({name: user.name, id: user.id, channel: user_socket});
}

function roomUsers(room_id) {
    if(!rooms[room_id]) {
        return [];
    }
    return rooms[room_id].users;
}

function roomState(room_id) {
    if(!rooms[room_id]) {
        return {};
    }
    return rooms[room_id].state;
}

function leaveRoom(user_id, room_id) {
    roomUsers(room_id).splice(
        roomUsers(room_id).findIndex(elem => elem.id === user_id),
        1
    );
}

/**
 * @param {string} room_id Room name
 * @param {bool} circled If room is empty since x seconds
 * 
 * @return {bool} Return true if room is empty since more than x seconds
 */
function roomEmpty(room_id, circled = false) {
    if(circled && roomUsers(room_id).length == 0) {
        return true;
    }
    // else if(!circled) {
    //     setTimeout(roomEmpty(room_id, true), 5 * 60 * 1000);
    // }
    else {
        false;
    }
}

function destroyRoom(room_id) {
    rooms[room_id] && delete rooms[room_id];
}

////////////////////////////////
////////// SOCKET //////////////
////////////////////////////////

io.on('connection', (socket) => {
    io.emit('user_id', socket.id);
    ////////////////////////////////////
    socket.on('connect_room', (msg) => {
        console.log('Try to enter the room');
        console.log(msg);
        if(msg.room_id == undefined) {
            console.log('No room specified');
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'No room specified'
            });
        }
        if(!roomExists(msg.room_id)) {
            console.log('Room does not exist');
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'Room does not exist'
            });
        }
        
        console.log(`A new user try to access a room`);
        let user = {};
        if(msg.user_id == undefined) {
            console.log('Create id');
            user = getRandomUser();
            console.log(`New user with id ${user.id}`);
            list_tokens.push(user.id);
        }
        else {
            console.log(`User with id ${msg.user_id}`);
            user.id = msg.user_id;
            user.name = msg.user_name;
            list_tokens.push(msg.user_id);
        }

        if(!roomOpened(msg.room_id)) {
            console.log('Room is not yet open. Opening');
            openRoom(msg.room_id, user);
        }
        joinRoom(msg.room_id, user, socket.id);
        socket.join(msg.room_id);

        console.log('User entered the room');

        socket.to(msg.room_id).emit('connect_room', {
            users: roomUsers(msg.room_id),
        });

        io.to(socket.id).emit('connect_room', {
            id: user.id,
            settings: scheme_list[msg.room_id],
            state: roomState(msg.room_id),
            users: roomUsers(msg.room_id),
            me: user,
            rooms: rooms,
        });
    })
    ////////////////////////////////////
    socket.on('click_cell', (msg) => {
        // verify if clicked
        // change state
        io.to(msg.room_id).emit('click_cell', {
            cell: msg.cell_id,
            user: msg.user_id,
        });
    })
    ////////////////////////////////////
    socket.on('leave_cell', (msg) => {
        // verify if clicked
        // change state
        io.to(msg.room_id).emit('leave_cell', {
            cell: msg.cell_id,
            user: msg.user_id,
            cell_value: msg.cell_value,
        });
    })
    ////////////////////////////////////
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    ////////////////////////////////////
    socket.on('user_leave', (msg) => {
        console.log(`User ${msg.user_id} left the room`);
        console.log(msg);
        roomExists(msg.room_id) && leaveRoom(msg.user_id, msg.room_id);
        list_tokens.indexOf(msg.user_id) > -1 && list_tokens.splice(list_tokens.indexOf(msg.user_id), 1);
        
        roomEmpty(msg.room_id) && destroyRoom(msg.room_id);
        
        socket.to(msg.room_id).emit('user_leave', {
            users: roomUsers(msg.room_id),
        });
        
        if(msg.user_id != undefined) {
            io.to(msg.room_id).emit('user_leave', {
                message: `${msg.user_id} s'est déconnecté`,
            });
        }
    });
    ////////////////////////////////////
    socket.on('change_room', (msg) => {
        console.log('Try to change room');
        console.log(msg);
        if(msg.new_room_id == undefined) {
            console.log('No room specified');
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'No room specified'
            });
        }
        if(!roomExists(msg.new_room_id)) {
            console.log('Room does not exist');
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'Room does not exist'
            });
        }

        roomExists(msg.room_id) && leaveRoom(msg.user_id, msg.room_id);
        list_tokens.indexOf(msg.user_id) > -1 && list_tokens.splice(list_tokens.indexOf(msg.user_id), 1);
        
        roomEmpty(msg.room_id) && destroyRoom(msg.room_id);
        
        console.log(`A new user try to access a room`);
        let user = {};
        if(msg.user_id == undefined) {
            console.log('Create id');
            user = getRandomUser();
            console.log(`New user with id ${user.id}`);
            list_tokens.push(user.id);
        }
        else {
            console.log(`User with id ${msg.user_id}`);
            leaveRoom(msg.user_id, msg.room_id)
            user.id = msg.user_id;
            user.name = msg.user_name;
            list_tokens.push(msg.user_id);
        }

        if(!roomOpened(msg.new_room_id)) {
            console.log('Room is not yet open. Opening');
            openRoom(msg.new_room_id, user);
        }
        joinRoom(msg.new_room_id, user, socket.id);
        socket.join(msg.new_room_id);

        console.log('User entered the room');

        socket.to(msg.new_room_id).emit('connect_room', {
            users: roomUsers(msg.new_room_id),
        });
        
        if(msg.user_id != undefined) {
            io.to(msg.room_id).emit('user_leave', {
                message: `${msg.user_id} s'est déconnecté`,
            });
        }

        socket.to(msg.room_id).emit('connect_room', {
            users: roomUsers(msg.room_id),
        });

        io.to(socket.id).emit('connect_room', {
            id: user.id,
            settings: scheme_list[msg.room_id],
            state: roomState(msg.room_id),
            users: roomUsers(msg.room_id),
            me: user,
            rooms: rooms,
        });

        io.to(msg.room_id).emit('change_room', {

        })
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});