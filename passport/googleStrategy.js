const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { BaseDomain } = require("../index.js");

const { db, CreateUserObj } = require('../util/Chat');

const users = db.get('users');

const CALLBACK_URL = BaseDomain + `/auth/google/callback`;

module.exports = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        // asynchronous verification, for effect...
        process.nextTick(async function () {
            let User = await users.findOne({ id: profile.id })

            if (!User) {
                profile.username = profile.displayName;
                //profile.avatar = profile._json.picture;
                User = await users.insert(CreateUserObj(profile))
            } else console.log(User);

            users.findOneAndUpdate({ id: profile.id }, { $set: { access_token: accessToken, refreshToken: refreshToken } })
                .then((User) => {
                    done(null, User)
                })
        })
    });

