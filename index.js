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

var rooms = {};
var list_tokens = [];
const types = [];

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
    // check_symfony
    return true;
}

io.on('connection', (socket) => {
    io.emit('user_id', socket.id);
    socket.on('connect_room', (msg) => {
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
        if(msg.user_id == undefined) {
            console.log('Create id');
            let id = random_token();
            list_tokens.push(id);
            io.emit('connect_room', {
                id: id,
                ids: list_tokens,
                // envoyer état de la room
            });
        }
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
        });
    })
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });
    socket.on('user_leave', (msg) => {
        console.log('User leave');
        list_tokens.splice(list_tokens.indexOf(msg.id), 1);
        io.emit('user_leave', {
            message: `${msg.id} s'est déconnecté`
        });
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});