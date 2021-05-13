const express = require('express');
const Router = express.Router();

const { Chat, OnlineStatus } = require('../util/Chat');
const { ensureAuthenticated, passport } = require("../index.js");
module.exports = Router;

Router.get('/logout', async function (req, res) {
    try {
        await Chat.ChangeUserStatus(req.user.id, OnlineStatus.Offline);
        Chat.destroyUser(req.user.id);
        req.session.destroy();
        req.logout();
    } catch (error) { }
    finally {
        res.redirect('/');
    }
});

Router.get('/auth/discord', passport.authenticate('discord'),
    function (req, res) { }
);

Router.get('/auth/discord/callback', passport.authenticate('discord', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect("/chat")
    }
);

Router.get("/auth/github",
    passport.authenticate("github", { scope: ["user:email"] }), /// Note the scope here
    function (req, res) { }
)

Router.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/chat")
    }
)