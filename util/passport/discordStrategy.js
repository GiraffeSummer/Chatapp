const DiscordStrategy = require('passport-discord').Strategy;
const { BaseDomain } = require("../../index.js");

const { db, CreateUserObj } = require('../Chat');

const users = db.get('users');

const CALLBACK_URL = BaseDomain + `/auth/discord/callback`;

module.exports = new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT,
    clientSecret: process.env.DISCORD_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify', 'email'/*, 'guilds', 'guilds.join'*/]
},
    async (accessToken, refreshToken, profile, done) => {
        // asynchronous verification, for effect...
        process.nextTick(async function () {
            let User = await users.findOne({ id: profile.id })

            if (!User) {
                profile.username = profile.username + "#" + profile.discriminator;
                User = await users.insert(CreateUserObj(profile))
            } else console.log(User);

            users.findOneAndUpdate({ id: profile.id }, { $set: { access_token: accessToken, refreshToken: refreshToken } })
                .then((User) => {
                    done(null, User)
                })
        })
    });

