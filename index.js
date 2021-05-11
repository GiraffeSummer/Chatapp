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
//const templates = require('./util/templateLoader'); //for parsing the templates, not required anymore
const ejs = require('ejs');

const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const { Modifier: textMod, Convert: TextConvert } = require('./util/textConvert');


const { db, Chat, RandomColor } = require('./util/Chat');
const PORT = 3000;

const users = db.get('users');
const messages = db.get('messages');


//TODO: Normal login with login page

const APPNAME = "terrible-chatapp"
const BaseDomain = "https://" + APPNAME + ".loca.lt"//`https://localhost${(PORT) ? ":" + PORT : ".com"}`;
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
app.use(session({
    secret: process.env.COOKIEKEY,
    resave: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://' + process.env.MONGODB_URI, collection: 'sessions' }),
    saveUninitialized: true,
    //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', ensureAuthenticated, (req, res) => {
    res.redirect("/chat")
})

app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('index', { data: { window: { title: "Chat app" }, user: req.user, chat: Chat } });
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
        console.log(user)
        Chat.addUser(conId, user);
        const html = await ejs.renderFile("./views/templates/joinleave.ejs", { joined: true, user });
        io.emit('console message', { success: true, event: "join", user, html });
    });
    socket.on('chat message', async (msg) => {
        /*if (!io.sockets.clients.includes(conId)) //check if still connected with valid id
            socket.socket.connect();*/

        let user = Chat.getUser(conId);
        if (!user) {
            console.log("CLOSE")
            socket.disconnect(true)
        }
        msg = TextConvert(user.modifier, msg);
        if (/*userMessages.length <= 0 || userMessages[userMessages.length - 1].time + 1000 < Date.now()*/true) {
            let sndMsg = await Chat.addMessage(msg, user.id)
            console.log(`${user.username}: ` + sndMsg.text);
            const html = await ejs.renderFile("./views/templates/message.ejs", { msg: sndMsg })
            io.emit('chat message', { success: true, msg: sndMsg, html, user });
        } else io.to(conId).emit('err', { success: false, reason: "Ratelimit: Calm it" });

    });
    socket.on('disconnect', async () => {
        try {
            let user = Chat.getUser(conId);
            console.log(`${user.username} left`);

            const html = await ejs.renderFile("./views/templates/joinleave.ejs", { joined: false, user });

            io.emit('console message', { success: true, event: "leave", user, html });
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