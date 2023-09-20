const { GasUnitTestDefaultLogger } = require("./GasUnitTestDefaultLogger");
const { IGasUnitTestNotification } = require("./IGasUnitTestNotification");


/**
 * Singleton classe uses to Manage all Test Notification distribution
 */
class GasUnitTestNotificationManager extends IGasUnitTestNotification {
    constructor() {
        super();
        /** @type {Array.<IGasUnitTestNotification>} */
        this.clients = [];
        this.clients.push(new GasUnitTestDefaultLogger());
    }

    /**
     * Add a notification listener
     * @param {IGasUnitTestNotification} client 
     */
    addClient(client) {
        // TODO: check if all method are implemented ?
        if (this.clients.indexOf(client) === -1) {
            this.clients.push(client); 
        } else {
            throw new Error("This client already exists");
        }
    }

    /**
     * Remove the given notification listener
     * @param {IGasUnitTestNotification} client 
     */
    removeClient(client) {
        const index = this.clients.indexOf(client);
        if (index != -1) {
            this.clients.splice(index, 1);   
        }
    }



    // Implement Interface Method - START
    log(msg) {
        this.clients.forEach((client) => client.log(msg));
    }

    OnStartAllTest() {
        this.clients.forEach((client) => client.OnStartAllTest());
    }

    OnStartTestSection(section) {
        this.clients.forEach((client) => client.OnStartTestSection(section));
    }

    OnEndTestSection(section) {
        this.clients.forEach((client) => client.OnEndTestSection(section));
    }

    OnStartTest(test) {
        this.clients.forEach((client) => client.OnStartTest(test));
    }

    OnAssertResult(test, status, message) {
        this.clients.forEach((client) => client.OnAssertResult(test, status, message));
    }

    OnEndTest(test) {
        this.clients.forEach((client) => client.OnEndTest(test));
    }

    // Implement Interface Method - END
}


if (typeof module !== "undefined") {
    module.exports = {GasUnitTestNotificationManager};
  } 