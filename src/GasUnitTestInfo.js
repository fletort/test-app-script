


class GasUnitTestInfo {
  constructor(name = "") {
    this.name = name;
    this.nbTestOk = 0;
    this.nbTestKo = 0;
  }

  get NbTests() {
    return this.nbTestOk + this.nbTestKo;
  }

  /**
  * Indicates if Test is ok or not.
  * @returns True is the test is successful, false otherwise. 
  */
  isOk() {
    return this.nbTestKo == 0;
  }

  /**
   * Update local Ok/Ko counter from given Child TestInfo.
   * @param {GasUnitTestInfo} child 
   * @protected
   */
  updateCounterFrom(child) {
    this.nbTestOk += child.nbTestOk;
    this.nbTestKo += child.nbTestKo;
  }
}


if (typeof module !== "undefined") {
  module.exports = { GasUnitTestInfo };
} 