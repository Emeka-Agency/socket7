/* SELECTORS */

const byId = function(selector) {return document.getElementById(selector);}
const oneByType = function(selector) {return document.querySelector(selector);}
const allByType = function(selector) {return document.querySelectorAll(selector);}

/* GETTERS */

function getRoom() {return oneByType("body").id;}
function getLocaleRoomId() {return app.tableType();}
function getNavigationBar() {return oneByType('.head-table');}

/* MODIFIERS */

function addInto(parent, content) {parent.innerHTML += content;}
function replaceInto(parent, content) {parent.innerHTML = content;}

/* VARIOUS */

function purgeString(str) {return str.replace(/  +/g, '').replace(/\n/g, ' ').trim()}

/* BOOLEANS */

function cellIsText(elem) {return elem.classList.contains('for-text');}
function cellIsDate(elem) {return elem.classList.contains('for-date');}
function cellIsCheckbox(elem) {return elem.classList.contains('for-checkbox');}
function cellIsSelect(elem) {return elem.classList.contains('for-select');}

const m_app = app;
const socket = io();

document.addEventListener('DOMContentLoaded', function() {
    m_app.init();

    // get vars from sessionStorage
    socket.emit('connect_user');

    socket.emit('connect_room', {
        room_id: getLocaleRoomId(),
    });
})