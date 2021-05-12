require('dotenv').config();
const DEVELOPMENT = process.env.NODE_ENV == 'dev';
const helmet = require("helmet");
const express = require('express');
const session = require('express-session');
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const passport = require("passport");
const sessionManager = require("./util/sessionManager")
const { UserHTML } = require('./util/templateLoader'); //for parsing the templates, not required anymore
const ejs = require('ejs');

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);



const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const { Modifier: textMod, Convert: TextConvert, ValidateModifier } = require('./util/textConvert');


const { db, Chat, RandomColor, OnlineStatus, GetOnlineUsers } = require('./util/Chat');
const PORT = 3000;

const users = db.get('users');
const messages = db.get('messages');


//TODO: Normal login with login page

const APPNAME = "cursed-chatapp"
const BaseDomain = "https://" + APPNAME + ".loca.lt";
module.exports.BaseDomain = BaseDomain;

function ensureAuthenticated(req, res, next) {
    const Authorized = req.isAuthenticated();
    if (Authorized) {
        return next();
    } else
        res.redirect("/login")
}

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(require("./passport/githubStrategy"));

app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(express.static("./public"));
app.use(cors({ credentials: true }));
app.use(helmet());
app.use(cookieParser(process.env.COOKIEKEY));
const SessionOpts = session({
    secret: process.env.COOKIEKEY,
    resave: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://' + process.env.MONGODB_URI, collection: 'sessions', ttl: 24 * 60 * 60 }),
    saveUninitialized: true,
    cookie: { secure: true, maxAge: 8 * 60 * 60 * 1000 }
})
app.use(SessionOpts);
io.use(wrap(SessionOpts));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', ensureAuthenticated, (req, res) => {
    res.redirect("/chat")
})

app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('index', { data: { window: { title: "Chat app" }, user: req.user, chat: Chat } });
})


//update user endpoints
app.put('/color', ensureAuthenticated, async (req, res) => {
    const NewColor = req.body.color || RandomColor();
    const isValid = /^#[0-9A-F]{6}$/i.test(NewColor)
    if (isValid) {
        const newUser = await users.findOneAndUpdate({ id: req.user.id }, { $set: { color: NewColor } });
        req.user = newUser;
        res.status(200).send({ valid: true, color: NewColor })
    } else {
        res.status(200).send({ valid: false, color: NewColor })
    }
})

app.put('/modifier', ensureAuthenticated, async (req, res) => {
    const NewMod = req.body.modifier || RandomModifier();
    const isValid = ValidateModifier(NewMod);
    if (isValid) {
        const newUser = await users.findOneAndUpdate({ id: req.user.id }, { $set: { modifier: NewMod } });
        req.user = newUser;
        res.status(200).send({ valid: true, modifier: NewMod })
    } else {
        res.status(200).send({ valid: false, modifier: NewMod })
    }
})




app.get("/login", (req, res) => {
    res.send("<a href='/auth/github'>Sign in With GitHub</a>")
})


app.get("/auth/github",
    passport.authenticate("github", { scope: ["user:email"] }), /// Note the scope here
    function (req, res) { }
)

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/chat")
    }
)

/*app.get("/secret", ensureAuthenticated, (req, res) => {
    res.send(`<h2>yo ${req.user}</h2>`)
})*/

io.on('connection', (socket) => {
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
});

http.listen(PORT, async () => {
    Chat.Init(await messages.find({}), await users.find({}))

    console.log(`listening on http://localhost:${PORT}`);

    //automatically tunnel to test domain
    if (DEVELOPMENT) {
        const localtunnel = require('localtunnel');
        const tunnel = await localtunnel({ port: 3000, subdomain: APPNAME });

        console.log(`tunneling to: ${tunnel.url}`);;
    }
});