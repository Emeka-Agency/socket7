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
    return scheme_list[room_id];
}

var rooms = {};
var list_tokens = [];
var scheme_list = {};

initSchemes(`${__dirname}/private/tables/schemes`);

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

function openRoom(room_id, user) {
    if(roomExists(room_id) && !roomOpened(room_id)) {
        rooms[room_id] = {
            scheme: getScheme(room_id),
            state: {},
            users: {
                [user.id]: {
                    name: user.name,
                    pic_url: user.pic_url,
                }
            },
        }
        return true;
    }
    return false;
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
    return -1;
}

function destroyRoom(room_id) {
    if(roomExists(room_id) && roomOpened(room_id)) {
        if(!roomEmpty(room_id)) {
            // empty the room
        }
        delete rooms[room_id];
    }
    return -1;
}

////////////////////////////////
////////// USERS ///////////////
////////////////////////////////

function createUser() {
    return {
        name: faker.name.firstName(),
        id: faker.internet.password(),
        pic_url: faker.image.avatar(),
    };
}

function addUserInRoom(user_id, room_id) {
    if(roomExists(room_id) && !roomOpened(room_id)) {
        openRoom(room_id);
    }
    if(roomExists(room_id) && roomOpened(room_id) && userExists(user_id) && !userInRoom(user_id, room_id)) {
        rooms[room_id].users[user_id];
        return true;
    }
    return false;
}
function removeUserFromRoom(user_id, room_id) {
    if(roomExists(room_id) && roomOpened(room_id) && userExists(user_id) && userInRoom(user_id, room_id)) {
        delete rooms[room_id].users[user_id];
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

////////////////////////////////
////////// SOCKET //////////////
////////////////////////////////

io.on('connection', (socket) => {
    ////////////////////////////////////
    socket.on('connect_user', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('connect_room', (msg) => {
        console.log(msg);
        if(msg.room_id == undefined) {
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'No room id provided',
            });
            return false;
        }
        if(!roomExists(msg.room_id)) {
            io.to(socket.id).emit('connect_room', {
                status: 'error',
                message: 'Room does not exist',
            });
            return false;
        }
        let user = null;
        if(msg.user_id == undefined) {
            user = createUser();
        }
        else {
            user = {
                name: msg.user.name,
                id: msg.user.id,
                pic_url: msg.user.pic_url,
            }
        }
        list_tokens.push(user.id);

        addUserInRoom(user.id, msg.room_id);

        socket.to(msg.room_id).emit('user_connection', {
            users: roomUsers(msg.room_id),
        })

        io.to(socket.id).emit('connect_room', {
            user: user,
            room_id: msg.room_id,
        })
    });
    ////////////////////////////////////
    socket.on('change_room', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('leave_room', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('click_cell', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('change_cell', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('leave_cell', (msg) => {
        console.log(msg);
    });
    ////////////////////////////////////
    socket.on('chat_message', (msg) => {
        console.log(msg);
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});