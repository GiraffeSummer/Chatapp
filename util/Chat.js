const monk = require('monk');
const db = monk(process.env.MONGODB_URI);


const users = db.get('users');
const messages = db.get('messages');

module.exports.db = db;

const Chat = {
    messages: [],
    users: [],

    Init: function (msgs, urs) {
        this.messages = msgs;
        this.users = urs;
        console.log(urs)
    },

    addUser: function (id, user) {
        this.users[id] = user;
    },

    getUser: function (id) {
        let u = this.users[id];
        return { id: id, modifier: u.modifier, username: u.username, color: u.color };
    },
    getFullUser: function (id) { return this.users[id]; },
    addMessage: function (msg, id) {
        return new Promise(async (resolve, reject) => {
            let user = this.getUser(id);
            let nMsg = { user: user, text: msg, time: Date.now() };
            this.messages.push(nMsg);
            resolve(await messages.insert(nMsg));
        })
    },

    destroyUser: function (id) {
        users.remove(u => u.id === id)
    }
}
module.exports.Chat = Chat;

function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
module.exports.RandomColor = getRandomColor;