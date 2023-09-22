


class GasUnitTestInfo {
  constructor(name = "") {
    this.name = name;
    this.nbTestOk = 0;
    this.nbTestKo = 0;
    this.nbAssertOk = 0;
    this.nbAssertKo = 0;
  }

  get NbTests() {
    return this.nbTestOk + this.nbTestKo;
  }

  get NbAsserts() {
    return this.nbAssertOk + this.nbAssertKo;
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
    this.nbAssertOk += child.nbAssertOk;
    this.nbAssertKo += child.nbAssertKo;
  }
}


if (typeof module !== "undefined") {
  module.exports = { GasUnitTestInfo };
} 