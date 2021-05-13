const { db, Chat, OnlineStatus, GetOnlineUsers } = require('../util/Chat');
const sessionManager = require("../util/sessionManager")
const { UserHTML } = require('../util/templateLoader');
const { io, APPNAME } = require("../index.js");
const ejs = require('ejs');

function SocketHandler(socket) {
    let conId = socket.conn.id;
    socket.on('init', async (user) => {
        console.log("Connected: ", user.username)
        Chat.addUser(conId, user);
        socket.request.session.passport.user = await Chat.ChangeUserStatus(user.id, OnlineStatus.Online);
        sessionManager.CancelDestroySession(socket.request.session);
        //let msg = await Chat.addAlert(`${user.username} Joined`, conId);
        // const html = await ejs.renderFile("./views/templates/message.ejs", { joined: true, user, msg });
        const users_html = await UserHTML(await GetOnlineUsers(), conId);
        io.emit('console message', { success: true, event: "join", user, users_html });
    });
    socket.on('chat message', async (msg) => {
        /*if (!io.sockets.clients.includes(conId)) //check if still connected with valid id
            socket.socket.connect();*/

        let user = Chat.getUser(conId);
        if (!user) {
            console.log("CLOSE")
            socket.disconnect(true)
        }
        if (/*userMessages.length <= 0 || userMessages[userMessages.length - 1].time + 1000 < Date.now()*/true) {
            let sndMsg = await Chat.addMessage(msg, user.id, user.modifier)
            console.log(`${user.username}: ` + sndMsg.text);
            const html = await ejs.renderFile("./views/templates/message.ejs", { msg: sndMsg })
            io.emit('chat message', { success: true, msg: sndMsg, html, user });
        } else io.to(conId).emit('err', { success: false, reason: "Ratelimit: Calm it" });

    });
    socket.on('disconnect', async () => {
        try {
            let user = Chat.getUser(conId);
            console.log(`${user.username} left`);
            //Chat.addAlert(`${user.username} Left`, user.id);


            //let msg = await Chat.addAlert(`${user.username} Joined`, conId);
            //const html = await ejs.renderFile("./views/templates/message.ejs", { joined: false, user, msg });
            const users_html = await UserHTML(await GetOnlineUsers(), conId);
            io.emit('console message', { success: true, event: "leave", user, users_html });

            sessionManager.DeleteSession(socket.request.session).then(async (timer) => {
                await Chat.ChangeUserStatus(socket.request.session.passport.user.id, OnlineStatus.Offline);
                Chat.destroyUser(conId);
            });
        } catch (error) {
        }
    });
}

module.exports = SocketHandler;