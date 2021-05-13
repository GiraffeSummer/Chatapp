const express = require('express');
const Router = express.Router();

const { db, Chat } = require('../util/Chat');
const { ensureAuthenticated, APPNAME } = require("../index.js");

module.exports = Router;

Router.get('/', ensureAuthenticated, (req, res) => {
    res.redirect("/chat")
})

Router.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('index', { data: { window: { title: APPNAME }, user: req.user, chat: Chat } });
})

Router.get("/login", (req, res) => {
    res.render("login", { data: { window: { title: APPNAME } } })
})
