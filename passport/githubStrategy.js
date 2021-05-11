const GitHubStrategy = require("passport-github2").Strategy;
const { BaseDomain } = require("../index.js");

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = BaseDomain + `/auth/github/callback` // or get from process.env.GITHUB_CALLBACK_URL

const GithubStrat = new GitHubStrategy(
    {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
        // asynchronous verification, for effect...
        process.nextTick(async function () {
            let User = await users.findOne({ id: profile.id })

            if (!User) {
                User = await users.insert({ username: profile.username, modifier: textMod.owo, id: profile.id, color: RandomColor() })
            } else console.log(User);

            users.findOneAndUpdate({ id: profile.id }, { $set: { access_token: accessToken, refreshToken: refreshToken } })
                .then((User) => {
                    done(null, User)
                })
        })
    }
)
module.exports = GithubStrat;