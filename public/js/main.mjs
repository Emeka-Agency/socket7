const byId = function(selector) {
    return document.getElementById(selector);
}

const oneByType = function(selector) {
    return document.querySelector(selector);
}

const allByType = function(selector) {
    return document.querySelectorAll(selector);
}

function getRoom() {
    return oneByType("body").id;
}

function addInto(parent, content) {
    parent.innerHTML += content;
}

function insertInto(parent, content) {
    parent.innerHTML = content;
}

function purgeString(str) {
    return str.replace(/  +/g, '').replace(/\n/g, ' ').trim()
}

function getLocaleRoomId() {
    return app.tableType();
}

function navigationBar() {
    return oneByType('.head-table');
}

const m_app = app;
const socket = io();

document.addEventListener('DOMContentLoaded', function() {
    m_app.init();
    
    socket.emit('connect_room', {
        'room_id': getLocaleRoomId(),
    });
})