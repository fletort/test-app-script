// COMMENT THIS BLOCK IN GASP - START
const { IGasUnitTestNotification } = require("./IGasUnitTestNotification");
const { GasUnitTest } = require("./GasUnitTest.js");
const { GasUnitTestNotificationManager } = require("./GasUnitTestNotificationManager");
const { GasUnitTestInfo } = require("./GasUnitTestInfo");
// COMMENT THIS BLOCK IN GASP - END

/**
 * Class that Contains test definitions or nested tests section.
 * This class is created by the {@link GasUnitTestManager#testSection testSection method of the GasUnitTestManager class}.
 * @implements GasUnitTestInfo
 */
class GasUnitTestContainer extends GasUnitTestInfo {
  /**
   * Create a new GasUnitTestContainer instance.
   * @param {string} name - Name of the Test Section 
   * @param {testSection} handler - Handler contening test section definition
   * @param {IGasUnitTestNotification} logger - Logger used (default is GasUnitTestNotificationManager)
   * @hideconstructor
   */
  constructor(name, handler, logger = new GasUnitTestNotificationManager(), level = 0) {
    super(name);
    this.elements = [];
    this.name = name;
    this.handler = handler;
    this.logger = logger;
    this.level = level;
    /** use for dependency injection (test purpose) 
     * @ignore
    */
    this.unitTestClass = GasUnitTest
  }

  /** 
   * Define a test Method. [Decorator Like Method]
   * 
   * A test method is used to test something. 
   * It contains some preparation steps, a call to the tested method, then some assert call to check the behaviour.
   * 
   * @param {string} displayName - Name of the test
   * @param {function(GasUnitTest)} fct - This method defines the test content. Its parameter is used to access to assert Tools.
   * @return {GasUnitTest} - The created test
   */
  test(displayName, fct) {
    let test = new this.unitTestClass(displayName, fct, this.logger);
    this.elements.push(test);
    return test;
  }

  /**
   * Define parameterized Tests based on a unique test Method. [Decorator Like Method]
   * 
   * @param {Object} params
   * @param {String} params.displayName - Name of the global test (nested section)
   * @param {String} params.parameterizedTestNameTemplate - Customizing globally the name of each parameterized test
   * @param {Array.<Object>} params.valuesSource - Array of single value or multiple values (with a 2d Array or dict) that will be pass to the test method
   * @param {Array.<{displayName: string, args: Object}>} params.valuesSourceCustomName -
   * @param {function(GasUnitTest, ...*)} fct - This method defines the test content. Its first parameter is used to access to assert Tools, it is followed by Arguments or Test Arguments Dictionary
   * @return {Array.<GasUnitTest>} - The Created tests
   */
  parameterizedTest({ displayName = "", parameterizedTestNameTemplate = "",
    valuesSource = [], valuesSourceCustomName = [] }, fct) {

    if (displayName != "") { // Create the define Nested section that will contain all parameterized Tests
      delete arguments[0].displayName; // Remove displayName information
      return this.nested(displayName, (add) => add.parameterizedTest(arguments[0], fct));
    }

    // Concat All sources
    const ValueSourceType = Object.freeze({
      Values: 0,
      ValuesWithCustomName: 1,
    });
    let allSources = valuesSource.map(value => ({ type: ValueSourceType.Values, value: value }));
    allSources = allSources.concat(valuesSourceCustomName.map(value => ({ type: ValueSourceType.ValuesWithCustomName, value: value })));

    let addedTests = allSources.map((source, index) => {
      index = index + 1; // Start at One , no 0

      // -- Build the Test Name
      // Default Test Name
      let testName = `${index} ${source.value}`;
      let args = source.value;

      // IF Test Name is defined explicitely
      if (source.type == ValueSourceType.ValuesWithCustomName) {
        /** @type {ValuesSourceCustomName} */
        const valueWithName = source.value;
        testName = valueWithName.displayName;
        args = valueWithName.args;
      }
      // ELSE IF Test Name is defined with the global template
      else if (parameterizedTestNameTemplate != "") {
        // define placeholder
        const map = new Map();
        map.set("index", index);
        map.set("arguments", source.value);

        if (source.value instanceof Array) {
          source.value.forEach((arg_value, arg_index) => map.set(`${arg_index}`, arg_value));
        } else if (source.value instanceof Object) {
          // Build placeholder for each key
          Object.entries(source.value).forEach(([key, value]) => {
            map.set(key, value);
          });
        } else { // == alone parameter of Simple type as string, int...
          // valueSource iteration is not an array, only one parameter is defined
          map.set("0", source.value);
        }

        // replace placeholder
        testName = parameterizedTestNameTemplate.replace(/\$\{(.*?)\}/g, (...match) => {
          return map.has(match[1]) ? map.get(match[1]) : `${match[0]}`;
        });
      };

      // -- Build the Test
      let test = new this.unitTestClass(testName, fct, this.logger, args);
      this.elements.push(test);
      return test;
    });

    return addedTests;
  }

  /** 
   * Define a group of nested tests. [Decorator Like Method]
   * @param {string} displayName - The Nested Section Name
   * @param {function(GasUnitTestContainer)} fct - This method defines the test nested section content. Its parameter is used to define the test nested section content with test and other fixture.
   * @return {GasUnitTestContainer} - The created section
   */
  nested(displayName, fct) {
    let test = new GasUnitTestContainer(displayName, fct, this.logger, this.level + 1);
    this.elements.push(test);
    return test;
  }

  /**
   * Execute All the Tests of this Container (Section / Nested Section).
   * @ignore
   */
  execute() {
    this.logger.OnStartTestSection(this); // TODO: Section or nested 

    // Define Section Content
    this.handler(this);

    // Execute All element added to the Section
    this.elements.forEach(element => {
      if (element instanceof GasUnitTestContainer || element instanceof this.unitTestClass) {
        element.execute();
        
        // Compute nb TestOkKO for the current section
        this.updateCounterFrom(element);
      }
    })

    this.logger.OnEndTestSection(this); // TODO: Section or nested ?
  }
}


if (typeof module !== "undefined") {
  module.exports = { GasUnitTestContainer };
} 