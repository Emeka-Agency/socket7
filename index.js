const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tokenizer = require('rand-token');

app.use(require('express').static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/tab', (req, res) => {
    res.sendFile(__dirname + '/tab/index.html');
});

app.get('/room1', (req, res) => {
    res.sendFile(__dirname + '/room1/index.html');
});

app.get('/room2', (req, res) => {
    res.sendFile(__dirname + '/room2/index.html');
});

app.get('/room3', (req, res) => {
    res.sendFile(__dirname + '/room3/index.html');
});

var rooms = {};
var list_tokens = [];
const types = [];

const rooms_scheme = {
    room1: {
        name: 'Movies',
        id: 'room1',
        scheme: [
            {'label': 'Name', 'cell_type': 'input/text'},
            {'label': 'Start date', 'cell_type': 'input/date'},
            {'label': 'Stop date', 'cell_type': 'input/date'},
        ],
    },
    room2: {
        name: 'Users',
        id: 'room2',
        scheme: [
            {'label': 'Firstname', 'cell_type': 'input/text'},
            {'label': 'Lastname', 'cell_type': 'input/text'},
            {'label': 'Booked', 'cell_type': 'input/checkbox'},
        ],
    },
    room3: {
        name: 'Rights',
        id: 'room3',
        scheme: [
            {'label': 'Permission', 'cell_type': 'span/text'},
            {'label': 'ADMIN', 'cell_type': 'input/checkbox'},
            {'label': 'MANAGER', 'cell_type': 'input/checkbox'},
            {'label': 'PRESS', 'cell_type': 'input/checkbox'},
            {'label': 'USER', 'cell_type': 'input/checkbox'},
        ],
    },
}

const range = 32;

const random_token = (type = undefined) => {
    // type = one of ['jaj_room', 'type_room']
    // change randomBytes according to token type
    let value = tokenizer.uid(range);
    while(list_tokens.indexOf(value) > -1) {
        value = tokenizer.uid(range);
    }
    return value;
}

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

function roomExists(room_id) {
    // check_symfony or rooms_scheme
    // put rooms_scheme in txt files
    return true;
}

io.on('connection', (socket) => {
    io.emit('user_id', socket.id);
    socket.on('connect_room', (msg) => {
        console.log(msg);
        if(msg.room_id == undefined) {
            console.log('No room specified');
            io.emit('connect_room', {
                'status': 'error',
                'message': 'No room specified'
            });
        }
        if(!roomExists(msg.room_id)) {
            console.log('Room does not exist');
            io.emit('connect_room', {
                'status': 'error',
                'message': 'Room does not exist'
            });
        }
        console.log(`A new user enter the room`);
        let id = undefined;
        if(msg.user_id == undefined) {
            console.log('Create id');
            id = random_token();
            console.log(`New user with id ${id}`);
            list_tokens.push(id);
        }
        else {
            console.log(`New user with id ${msg.user_id}`);
            id = msg.user_id;
            list_tokens.push(msg.user_id);
        }
        io.emit('connect_room', {
            id: id,
            ids: list_tokens,
            settings: rooms_scheme[msg.room_id],
            // envoyer état de la room
        });
        // io.emit('connect', rooms[msg.room_id])
    })
    socket.on('click_cell', (msg) => {
        // verify if clicked
        // change state
        io.emit('click_cell', {
            'cell': msg.cell_id,
            'user': msg.user_id,
        });
    })
    socket.on('leave_cell', (msg) => {
        // verify if clicked
        // change state
        io.emit('leave_cell', {
            'cell': msg.cell_id,
            'user': msg.user_id,
            'cell_value': msg.cell_value,
        });
    })
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    socket.on('user_leave', (msg) => {
        console.log(`User ${msg.id} left the room`);
        list_tokens.splice(list_tokens.indexOf(msg.id), 1);
        io.emit('user_leave', {
            message: `${msg.id} s'est déconnecté`
        });
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});