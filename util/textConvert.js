const OWO = require("./owoify");
const LEET = require("./leetify");
const RANDOMCAPS = require("./randCapify");

const Modifier = Object.freeze({ none: "none", leet: "leet", owo: "owo", randomcaps: "randomcaps" })

module.exports.Modifier = Modifier;

function RandomModifier() {
    let num = Math.floor(Math.random() * Object.keys(Modifier).length)
    let val = Modifier[Object.keys(Modifier)[num]];
    if (val == Modifier.none) val = RandomModifier();
    return val;
}
module.exports.RandomModifier = RandomModifier;

module.exports.ValidateModifier = (modifier) => { return Modifier.hasOwnProperty(modifier) }

function Convert(mod, text) {
    switch (mod) {
        case "leet":
            return LEET(text);
            break;
        case "owo":
            return OWO(text);
            break;
        case "randomcaps":
            return RANDOMCAPS(text);
            break;
        case "none":
        default:
            return text;
            break;
    }
}
module.exports.Convert = Convert;