const Manager = {
    deletingSession: {},
    timeOut: 1 * 60 * 1000, //edit this one


    DeleteSession: function (session) {
        return new Promise(function (resolve, reject) {
            Manager.deletingSession[session.id] = session;

            resolve(setTimeout(() => {
                if (Manager.deletingSession[session.id]) {
                    Manager.deletingSession[session.id].destroy();
                }
            }, Manager.timeOut));
        })
    },
    CancelDestroySession: function (session) {
        if (this.deletingSession[session.id]) {
            delete this.deletingSession[session.id];
        }
    }
}
module.exports = Manager;