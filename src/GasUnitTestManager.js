// COMMENT THIS BLOCK IN GASP - START
const { GasUnitTestContainer } = require("./GasUnitTestContainer");
const { GasUnitTestInfo } = require("./GasUnitTestInfo");
const { GasUnitTestNotificationManager } = require("./GasUnitTestNotificationManager");
// COMMENT THIS BLOCK IN GASP - END

/**
 * Singleton classe uses to Manage all test campagn
 * @implements GasUnitTestInfo 
*/
class GasUnitTestManager extends GasUnitTestInfo {

  constructor() {
    super();
    this.sections = [];
    this.logger = new GasUnitTestNotificationManager();

    /** use for dependency injection (test purpose) 
     * @ignore
    */
    this.sectionClass = GasUnitTestContainer;

    // use for dependency injection (test purpose) 
    this.exitOnError = (code) => { 
      process.exit(code) 
    };
  }

  /**
   * Define a test section. [Decorator Like Method]
   * 
   * In GasUnitTestingFramework, Tests are grouped inside Section. Usually we are grouping in a section
   * tests targeting the same module/class, and we name the section from the name of the tested element
   * prefixed with Test.
   * 
   * A Test Section is something like a TestClass in JUnit world. 
   * 
   * @param {string} testSectionName - The Test Section Name (usually based on the name of the class tested by the test method)
   * @param {function(GasUnitTestContainer)} fct - This method defines the test section content. Its parameter is used to define the test section content with test and other fixture.
   * @return {GasUnitTestContainer} The created Section
   */
  testSection(testSectionName, fct) {
    let test = new this.sectionClass(testSectionName, fct, this.logger);
    this.sections.push(test);
    return test;
  }

  /**
   * Execute All the Tests.
   */
  execute() {
    this.logger.OnStartAllTest();

    this.sections.forEach(element => {
      element.execute()
      this.updateCounterFrom(element);
    });

    this.logger.OnAllTestEnd(this);

    if (!this.isOk()) {
      this.exitOnError(1);
      return 1;
    }

    return 0;
  }

}



if (typeof module !== "undefined") {
  module.exports = { GasUnitTestManager };
} 