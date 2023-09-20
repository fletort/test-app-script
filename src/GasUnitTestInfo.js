


class GasUnitTestInfo {
    constructor(name = "") {
        this.name = name;
        this.nbTestOk = 0;
        this.nbTestKo = 0;
    }
}



if (typeof module !== "undefined") {
    module.exports = {GasUnitTestInfo};
  } 