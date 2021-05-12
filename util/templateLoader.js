const fs = require('fs');
const ejs = require('ejs');

function UserHTML(users, id) {
    return new Promise(async (resolve, reject) => {
        //: users.map(x => x.id !== id)
        resolve(await ejs.renderFile("./views/templates/users.ejs", { users }));
    })
}
module.exports.UserHTML = UserHTML;

const Manager = {
    templates: {},
    add: function (file) {
        this.templates[file] = fs.readFileSync(`./views/${file}.ejs`)
    },
    getTemplate: function (name) {
        return this.templates[name]
    },
    get all() {
        return this.templates;
    },
    init: function () {
        fs.readdirSync("./views/templates").forEach(file => {
            this.templates[file.replace(".ejs", "")] = fs.readFileSync("./views/templates/" + file)
        });

        delete this.init;
        return this;
    }
}
//module.exports.Manager = Manager.init();