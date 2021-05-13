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

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');


const { db, Chat, RandomColor, OnlineStatus, GetOnlineUsers } = require('./util/Chat');
const PORT = 3000;

const users = db.get('users');
const messages = db.get('messages');


//TODO: Normal login with login page

const APPNAME = process.env.APPNAME;
const BaseDomain = "https://" + APPNAME + ".loca.lt";

function ensureAuthenticated(req, res, next) {
    const Authorized = req.isAuthenticated();
    if (Authorized) {
        return next();
    } else
        res.redirect("/login")
}
module.exports.BaseDomain = BaseDomain;
module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.APPNAME = APPNAME;
module.exports.passport = passport;
module.exports.io = io;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(require("./passport/githubStrategy"));
passport.use(require("./passport/discordStrategy"));

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

app.use(require("./routes/routes"));
app.use(require("./routes/passport-routes"));
app.use(require("./routes/update-routes"));

io.on('connection', require("./routes/socket"));

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