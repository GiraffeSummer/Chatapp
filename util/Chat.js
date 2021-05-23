const db = require('monk')(process.env.MONGODB_URI);
const { Modifier, RandomModifier, Convert: TextConvert } = require('./textConvert');

const users = db.get('users');
const messages = db.get('messages');

module.exports.db = db;

module.exports.CreateProfile = (id, username) => { return { id, username }; };

const OnlineStatus = Object.freeze({ Offline: 0, Online: 1, DND: 24 })
module.exports.OnlineStatus = OnlineStatus;

module.exports.GetOnlineUsers = () => {
    return new Promise(async (resolve, reject) => {
        resolve(await users.find({ status: { $gt: OnlineStatus.Offline } }))
    })
}

//Generates new user object
function CreateUserObj(profile) {
    return { id: profile.id, username: profile.username,provider: profile.provider, modifier: RandomModifier(), status: OnlineStatus.Offline, color: RandomColor() }
}
module.exports.CreateUserObj = CreateUserObj;

const Chat = {
    messages: [],
    users: [],

    Init: function (msgs, urs) {
        this.messages = msgs;
        this.users = urs;
    },

    ChangeUserStatus: function (id, status) {
        return new Promise(async (resolve, reject) => {
            const updated = await users.findOneAndUpdate({ id: id }, { $set: { status: status } });
            //console.log(`${updated.username} went: ${Object.keys(OnlineStatus).find(k => OnlineStatus[k] === updated.status)}`);
            resolve(updated)
        })
    },

    addUser: function (id, user) {
        this.users[id] = user;
    },

    getUser: function (id) {
        let u = this.users[id];
        if (u)
            return { id: id, modifier: u.modifier, username: u.username, color: u.color };
        else return undefined;
    },
    getFullUser: function (id) { return this.users[id]; },
    addMessage: function (msg, id, modifier) {
        return new Promise(async (resolve, reject) => {
            let user = this.getUser(id);
            let nMsg = { user: user, original: msg, text: TextConvert(modifier, msg), modifier, alert: false, time: Date.now() };
            this.messages.push(nMsg);
            resolve(await messages.insert(nMsg));
        })
    },

    addAlert: function (msg, id) {
        return new Promise(async (resolve, reject) => {
            let user = this.getUser(id);
            let nMsg = { user: user, text: msg, modifier: Modifier.none, alert: true, time: Date.now() };
            // this.messages.push(nMsg);
            resolve(nMsg/*await messages.insert(nMsg)*/);
        })
    },

    destroyUser: function (id) {
        try {
            delete this.users[id];
        } catch (err) { }
    }
}
module.exports.Chat = Chat;

function RandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
module.exports.RandomColor = RandomColor;