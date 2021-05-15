const express = require('express');
const Router = express.Router();

const { db, Chat, GetOnlineUsers } = require('../util/Chat');
const { ensureAuthenticated, APPNAME, strategies } = require("../index.js");

module.exports = Router;

Router.get('/', ensureAuthenticated, (req, res) => {
    res.redirect("/chat")
})

Router.get('/chat', ensureAuthenticated, async (req, res) => {
    const users = await GetOnlineUsers();
    if (!users.find(x => x.id == req.user.id)) users.push(req.user);
    res.render('index', { data: { window: { title: APPNAME }, user: req.user, chat: Chat, users } });
})

Router.get('/api/chat', ensureAuthenticated, async (req, res) => {
    const users = await GetOnlineUsers();
    if (!users.find(x => x.id == req.user.id)) users.push(req.user);
    res.send({ data: { window: { title: APPNAME }, user: req.user, chat: Chat, users } });
})

Router.get("/login", (req, res) => {
    res.render("login", { data: { window: { title: APPNAME }, strategies } })
})
