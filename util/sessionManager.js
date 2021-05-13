const Manager = {
    deletingSession: {},
    timeOut: 1 * 60 * 1000, //edit this one


    DeleteSession: function (session, instant = false) {
        return new Promise(function (resolve, reject) {
            Manager.deletingSession[session.id] = session;
            const SessId = session.id;

            let timerTime = Manager.timeOut;
            if (instant) timerTime = 0;

            setTimeout(() => {
                let removed = false;
                if (Manager.deletingSession[session.id]) {
                    Manager.deletingSession[session.id].destroy();
                    removed = true;
                }
                resolve(removed, SessId);
            }, timerTime);
        })
    },
    CancelDestroySession: function (session) {
        if (this.deletingSession[session.id]) {
            delete this.deletingSession[session.id];
        }
    }
}
module.exports = Manager;