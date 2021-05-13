const express = require('express');
const Router = express.Router();

const { db, RandomColor } = require('../util/Chat');
const { RandomModifier, ValidateModifier } = require('../util/textConvert');

const users = db.get('users');


const { ensureAuthenticated } = require("../index.js");
module.exports = Router;

Router.put('/color', ensureAuthenticated, async (req, res) => {
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

Router.put('/modifier', ensureAuthenticated, async (req, res) => {
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