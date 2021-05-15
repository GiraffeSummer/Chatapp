const { passport } = require('../index');
const fs = require('fs');

const baseObj = {
    discord: true,
    github: true,
    google: true
}

const Presets = Object.freeze({
    all: baseObj,
    discord: {
        discord: true,
        github: false,
        google: false
    },
    google: {
        discord: false,
        github: false,
        google: true
    },
    github: {
        discord: false,
        github: true,
        google: false
    }
});
module.exports.Presets = Presets;

let JsonPath = './strategies.json';
module.exports.JsonPath = JsonPath;

module.exports.FromJSON = () => {
    if (fs.existsSync(JsonPath)) {
        let ob = JSON.parse(fs.readFileSync(JsonPath, 'utf8'));
        return Strategies(ob);

    } else {
        fs.writeFileSync(JsonPath, JSON.stringify(baseObj, null, 4));
        return Strategies(baseObj);
    }
}

const Strategies = (ob = baseObj) => {
    ob = MakeValid(ob, baseObj);
    if (ob.discord) passport.use(require("./passport/discordStrategy"));
    if (ob.github) passport.use(require("./passport/githubStrategy"));
    if (ob.google) passport.use(require("./passport/googleStrategy"));
    return ob;
}
module.exports.Strategies = Strategies;

function MakeValid(ob, compare) {
    let newob = {};
    for (let prop in compare) newob[prop] = (!(ob == null || ob == undefined)) ? ob[prop] : compare[prop];
    return newob;
}