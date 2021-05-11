const fs = require('fs');
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
            this.templates[file.replace(".ejs","")] = fs.readFileSync("./views/templates/" + file)
        });

        delete this.init;
        return this;
    }
}
module.exports = Manager.init();