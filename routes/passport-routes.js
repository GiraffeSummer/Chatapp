const express = require('express');
const Router = express.Router();


const { ensureAuthenticated, passport } = require("../index.js");
module.exports = Router;


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