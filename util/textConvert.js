const OWO = require("./owoify");
const LEET = require("./leetify");

const Modifier = Object.freeze({ none: "none", leet: "leet", owo: "owo" })

module.exports.Modifier = Modifier;

function Convert(mod, text) {
    switch (mod) {
        case "leet":
            return LEET(text);
            break;
        case "owo":
            return OWO(text);
            break;
        case "none":
        default:
            return text;
            break;
    }
}
module.exports.Convert = Convert;