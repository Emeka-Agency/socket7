const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const tokenizer = require('rand-token');
const fs = require('fs');
var faker = require('faker');

faker.locale = 'fr';

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
    let morning = ['06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30'];
    let evening = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
    let roles = ['Visiteur cinéma', 'Passant galeries / visiteur cinéma', 'Renfort', 'Client taverne / visiteur cinéma', 'Client restaurant', 'Vendeuse de billets', 'Milicien SA', 'Vieux juif', 'Spectateur défilé', 'Badauds rue Vienne', 'Garçon HitlerJugend'];
    let prestation = ['essayage', 'figuration', 'silhouette'];
    let movies = ['L\'Enfant Caché'];
    switch(room_id) {
        case 'bookman':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(prestation));/* Type de booking */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.past());/* Date de booking - start */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.future());/* Date de booking - end */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.streetName());/* Adresse - Nom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.streetAddress());/* Adresse - Rue */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.zipCode());/* Adresse - CP */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.city());/* Adresse - Localité */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Informations */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.internet.url());/* Lien de modification */
            }
            break;
        case 'confman':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.soon());/* Date */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.sentence());/* Résumé */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'modifier');/* */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'voir');/* */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'webform');/* */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'resultats');/* */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'export resultats');/* */
            }
            break;
        case 'contracts':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* uid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName());/* Nom de famille */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName());/* Prénom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* ID confirmée */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.address.streetAddress()}, ${faker.address.zipCode()}, ${faker.address.city()}`);/* Adresse */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.image.avatar());/* ID recto */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.image.avatar());/* ID verso */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* ID - Numéro */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* Identifiant */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.finance.iban());/* IBAN */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* Compte vérifié */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Contrat */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* CA */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.past());/* CA demande */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.future());/* CA expiration */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* Numéro CA */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'Confirmer');/* Confirmation */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'Refuser');/* Refus */
            }
            break;
        case 'legal_kid_contract':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* uid */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.name.lastName()} ${faker.name.firstName()}`);/* Nom et prénom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['M', 'F']));/* Sexe */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.past());/* Date de naissance */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.soon());/* Date des activités */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.streetAddress());/* Lieu des activités */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.random.arrayElement(morning)} - ${faker.random.arrayElement(evening)}\n${faker.random.arrayElement(morning)} - ${faker.random.arrayElement(evening)}`);/* Heures de début et de fin des activités journalière */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'dérogation');/* Dérogation */
            }
            break;
        case 'jaj':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.soon());/* Date */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(prestation));/* Type */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Attribution */
                setRoomState(room_id, i, `c-${i}-${++index}`, `hommes(${faker.random.number({min: 5, max: 30})})\nfemmes(${faker.random.number({min: 5, max: 30})})`);/* Sexe */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.random.number({min: 4, max: 16})}-${faker.random.number({min: 45, max: 78})}`);/* Âge */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 10, max: 50}));/* Nombre */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.random.arrayElement(morning)} - ${faker.random.arrayElement(evening)}`);/* Heures */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.streetAddress());/* Rue */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.zipCode());/* Code Postal */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.address.city());/* Localité */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'modifier');/*  */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'JAJ');/*  */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'JAJ EU');/*  */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'JAJ UK');/*  */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'ID');/*  */
            }
            break;
        case 'payments':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* uid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName());/* Nom de famille */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName());/* Prénom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(roles));/* Attribution */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Type de booking */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 2, max: 7}));/* nbr */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* pre */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.soon());/* Date */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* Flag pré */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.commerce.price({min: 30, max: 70})}€`);/* Montant (€) */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.commerce.price({min: 50, max: 250})}€`);/* Montant (€) */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.commerce.price({min: 50, max: 250})}€`);/* À payer */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['payer', 'payé']));/* " */
            }
            break;
        case 'participant':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* uid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.image.people());/* photo portrait */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName());/* Nom de famille */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName());/* Prénom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(roles));/* Attribution */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Type de booking */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 1, max: 7}));/* nbr */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.soon());/* Date */
                setRoomState(room_id, i, `c-${i}-${++index}`, `${faker.random.number({min: 30, max : 250})}€`);/* Montant (€) */
            }
            break;
        case 'pb_p':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number());/* nid */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.recent());/* Date de mise à jour */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(movies));/* Titre */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(roles));/* Titre */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName());/* Nom de famille */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName());/* Prénom */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['Booké', 'Désisté', 'Écarté', 'Abandonné']));/* Statut */
                faker.random.boolean() == true ? setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName()) : index++;/* Contact */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'modifier');/* Lien de modification */
            }
            break;
        case 'permissions':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.sentence());/* Permission */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* ADMIN */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* MANAGER */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* PRESS */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* USER */
            }
            break;
        case 'reports':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.date.recent());/* Date */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(prestation));/* Type */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 10, max: 75}));/* Nombre de présences */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['Ouvert', 'Fermé']));/* Rapport */
                setRoomState(room_id, i, `c-${i}-${++index}`, 'JAJ');/* JAJs */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Les présences ont-elles bien été mise à jour? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Pourquoi ? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Tous les figurants étaient-ils présent? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Y-a t'il eu des désistements de dernière minutes? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 1, max: 7}));/* Combien ? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Y-a t'il encore des contrats non signé à la fin de la journée? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 1, max: 7}));/* Combien ? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Y a t'il des contrats manuscrit? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.number({min: 1, max: 7}));/* Combien? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Raison particulière ? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.arrayElement(['oui', 'non']));/* Y a t'il des événements particuliers à signaler? */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Type d'événements rencontré */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Veuillez détailler le ou les événement(s) */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.lorem.paragraph());/* Remarque ou information générale */
            }
            break;
        case 'user_params':
            for(let i = 1; i <= lines; i++) {
                index = 0;

                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.firstName());/* Firstname */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.name.lastName());/* Lastname */
                setRoomState(room_id, i, `c-${i}-${++index}`, Math.random() * 2 > 1 ? 'ACTIVE' : 'INACTIVE');/* Status */
                setRoomState(room_id, i, `c-${i}-${++index}`, faker.random.boolean());/* IS_ADMIN */
                faker.random.boolean() && setRoomState(room_id, i, `c-${i}-${++index}`, faker.phone.phoneNumber());/* Téléphone */
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
    if(!rooms[room_id].state[line]) {
        setStateLine(room_id, line, {});
    }
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
        console.log(msg);
        addRowToState(msg.room_id, msg.id_line, msg.col_offset);
        socket.to(msg.room_id).emit('add_row', {});
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});