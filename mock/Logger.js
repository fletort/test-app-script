

class Logger {

    static content= "";

    static clear() {
        this.content = "";
    }

    static getLog() {
        return this.content;
    }

    static log(data) {
        
        let now = new Date(Date.now());
        let nowDateString = now.toDateString().slice(0, -4);
        let nowTimeString = now.toTimeString().replace("GMT+0200", "CEST").slice(0, 14); // Specific for me: need to be improve to simulate really Official Class.
        let nowLog = nowDateString + nowTimeString + now.toDateString().slice(-4);
        console.log(data);
        this.content += "\n" + nowLog + " INFO: " + data;
    }

}


module.exports = Logger
