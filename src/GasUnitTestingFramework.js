/**
 * Class for running unit tests
 * inspired/forked from: https://github.com/WildH0g/UnitTestingApp/
 */

/**
 * require libraries if the require method exists (outside GAS Mode)
 */
if (typeof require !== 'undefined') {
  const Logger = require('../mock/Logger.js');
}


/**
 * Singleton classes uses to run Unit Test.
 */
class GasUnitTestingFramework {
  constructor() {
    if (GasUnitTestingFramework.instance) return GasUnitTestingFramework.instance;
    GasUnitTestingFramework._runningInGas.set(this, RunningContext.InsideAndOutsideGas);
    GasUnitTestingFramework._msgPrefix.set(this, "");
    GasUnitTestingFramework._log.set(this, console.log);
    GasUnitTestingFramework.instance = this;
    this.startCaptureLogIndex = 0;

    return GasUnitTestingFramework.instance;
  }

  /**
   * Indicates it current execution is from online Google App Script IDE or not.
   * @type {boolean}
   * @readonly
   */
  get isInGas() {
    return typeof ScriptApp !== 'undefined';
  }

  /**
   * Get/Set Test Running Context (in GAS or not).
   * When Set to RunningContext.InsideGasOnly, the tests are executed only if executed from online Google App Script IDE.
   * When Set to RunningContext.OutsideGasOnly, the tests are executed only if executed from a local environnement.
   * When Set to RunningContext.InsideAndOutsideGas, the test are executed whatever the environnement is.
   * @type {RunningContext}
   */
  get runningContext() {
    return GasUnitTestingFramework._runningInGas.get(this);
  }
  set runningContext(value) {
    GasUnitTestingFramework._runningInGas.set(this, value);
  }

  /** 
   * Indicates if test will be executed or nor depending the context.
   * This method is used by each internal test method to know if
   * running context is ok (test will be run in this case).
   * Running context is ok when :
   * - Test is executed from Gas Environment and {@link GasUnitTestingFramework#runningContext runningContext}
   * is set to {@link RunningContext InsideAndOutsideGas} or 
   * to {@link GasUnitTestingFramework. InsideGasOnly} 
   * - Test is executed outside Gas Environment and {@link GasUnitTestingFramework#runningContext runningContext}
   * is set to {@link GasUnitTestingFramework InsideAndOutsideGas} or 
   * to {@link GasUnitTestingFramework OutsideGasOnly}
   * 
   * @return {boolean} True if test will be executed, false otherwise.
   */
  isRunningContextOk() {
    return (
      (this.runningContext == RunningContext.InsideAndOutsideGas) ||
      (this.isInGas && this.runningContext == RunningContext.InsideGasOnly) ||
      (!this.isInGas && this.runningContext == RunningContext.OutsideGasOnly)
    )
  }

  /**
   * Get/Set the prefix to use for displayed messages.
   * Each test message will have this prefix written.
   * @type {string}
   */
  get msgPrefix() {
    return GasUnitTestingFramework._msgPrefix.get(this);
  }
  set msgPrefix(prefix) {
    GasUnitTestingFramework._msgPrefix.set(this, prefix);
  }

  /**
   * Log callback type.
   * @callback GasUnitTestingFramework~Log
   * @param {string} msg - Message to Print.
   */

  /**
   * Log Message to Internal Method (console.log by default)
   * 
   * The output can be modified with {@link logFunction}.
   * This redefinition is useful to test the GasUnitTestingFramework itself or to modify the output behavior.
   * 
   * @param {GasUnitTestingFramework} msg - Message to Print.
   * @see logFunction
   */
  log(msg) {
    let fct = GasUnitTestingFramework._log.get(this);
    fct(msg);
  }
  
  /**
   * Set specific Console Log Method.
   * 
   * All printed test result are send to this method.
   * By default {@link https://developer.mozilla.org/en-US/docs/Web/API/console/log console.log} is used.
   * This redefinition is useful to test the GasUnitTestingFramework itself or to modify the output behavior.
   * @type {GasUnitTestingFramework~Log}
   * @see log
   */
  set logFunction(func) {
    GasUnitTestingFramework._log.set(this, func);
  }

  /**
   * Tests and Print to Console whether condition is truthy or falsy.
   * 
   * The first argument _condition_ can either be a boolean value or a function that returns a boolean.
   * For simple test, function should be also a preferred approach for error catching reasons (see exemple below)
   * 
   * When argument _waitedResult_ is not defined (similar to equal to **true**), its logs out a "PASSED"
   * message if the condition is truthy, otherwise it logs out a "FAILED" message.
   *  
   * This _waitedResult_ optional argument can be set to **false** to inverse this behaviour: in this case
   * it logs out a "PASSED" message if the condition is **not** truthy.
   * The shortcut {@link GasUnitTestingFramework#assertFalse assertFalse} can also be used for this purpose.
   * 
   * If you pass in a function that throws en error, the assert method will catch the error and log out a "FAILED" message 
   * ending with the exception content.
   * 
   * @example
   * const testMyInt = 16;
   * const testTypeError = "I am not a number"
   * function testMyFunction() {
   *   return true;
   * }
   * 
   * test.assert( testMyInt % 2 === 0, `Number ${testMyInt} is even`);
   * // logs out: ✔ PASSED: Number 16 is even 
   * 
   * test.assert( testMyFunction, `testMyFunction is successful`);
   * // logs out: ✔ PASSED: testMyFunction is successful
   * 
   * test.assert( testMyInt > 100, `Number ${testMyInt} is bigger than 100`);
   * // logs out:❌ FAILED: Number 16 is bigger than 100 
   * 
   * test.assert( testMyInt > 100, `Number ${testMyInt} is NOT bigger than 100`, false);
   * // logs out: ✔ PASSED: Number 16 is NOT bigger than 100 
   * 
   * test.assert( testTypeError > 100, `Number ${testMyInt} is bigger than 100`);
   * // Stop the test program and throw an exception: "ReferenceError: testTypeError is not defined"
   * 
   * test.assert( () => testTypeError > 100, `Number ${testMyInt} is bigger than 100`);
   * // logs out:❌  FAILED: Number 16 is bigger than 100 (ReferenceError: testTypeError is not defined)
   * 
   * @param {Boolean | Function} condition - The condition/test to check. This can be a boolean (a test) or a function to call.
   * @param {String} message - the message to display in the console
   * @param {Boolean} [waitedResult=true] - Result that we want on the condition. true if not defined.
   * @see {@link GasUnitTestingFramework#assertFalse assertFalse}
   */
  assert(condition, message, waitedResult = true) {
    if (!this.isRunningContextOk()) return;
    try {
      if ("function" === typeof condition) condition = condition();
      if (condition == waitedResult) {
        this.log(`✔ PASSED: ${this.msgPrefix}${message}`);
      } else {
        this.log(`❌ FAILED: ${this.msgPrefix}${message}`);
      }
    } catch (err) {
      this.log(`❌ FAILED: ${this.msgPrefix}${message} (${err})`);
    }
  }

  /**
   * Tests and Print to Console whether condition is False.
   * 
   * This is a shortcut to assert(condition, false, message).
   * See the {@link GasUnitTestingFramework#assert assert method documentation} for more information.
   * 
   *    * @example
   * const testMyInt = 15;
   * function testMyFunction() {
   *   return false;
   * }
   * 
   * test.assertFalse( testMyInt % 2 === 0, `Number ${testMyInt} is not even`);
   * // logs out: ✔ PASSED: Number 15 is not even 
   * 
   * test.assertFalse( testMyFunction, `testMyFunction is not successful`);
   * // logs out: ✔ PASSED: testMyFunction is not successful
   * 
   * @param {Boolean | Function} condition - The condition/test to check
   * @param {String} message - the message to display in the console
   * @see {@link GasUnitTestingFramework#assertFalse assert}
   */
  assertFalse(condition, message) {
    return this.assert(condition, message, false);
  }




  /**
   * Tests functions that must throw on exception
   * 
   * @example
   * 
   * test.assertThrowErr(testFunctionWithException, "This is My Exception", `testFunctionWithException throw the waited exception`)
   * // logs out: ✔ PASSED: testFunctionWithException throw the waited exception
   * 
   * test.assertThrowErr(testFunctionWithException, "Not a Number", `testFunctionWithException throw the waited exception`)
   * // logs out: ❌ FAILED: testFunctionWithException throw the waited exception
   * 
   * @param {Function} callback - the function that you expect to throw the exception
   * @param {String} errorMessage - the error message you are expecting in the exception (regex test)
   * @param {String} message - the message to display in the console
   */
  assertThrowErr(callback, errorMessage, message) {
    if (!this.isRunningContextOk()) return;
    let isCaught = false;
    try {
      callback();
    } catch (err) {
      isCaught = new RegExp(errorMessage).test(err);
    } finally {
      this.assert(isCaught, message);
    }
  }

  /**
   * This callback type is used by some test method for custom equality.
   * @callback GasUnitTestingFramework~ItemEquality
   * @param {any} value1 - First value to compare
   * @param {any} value2 - Second value to compare
   * @returns {Boolean} True if value are equal, False otherwise
   */

  /**
   * Tests and Print to Console whether arrays are equals.
   * 
   * Check that both given element are arrays of the same size and
   * then compare their elements using optional given equalityMethod or 
   * default Object.is method.
   * 
   * @example
   * 
   * const arraySimple1 = [12, 14];
   * const arraySimple2 = [12, 14];
   * const arraySimple3 = [12, 15];
   * const arrayComplex1 = [{name: "kenobi", surname: "obiwan"}, {surname: "tony", name: "stark"} ]
   * const arrayComplex2 = [{ surname: "obiwan", name: "kenobi"}, {name: "stark", surname: "tony"} ]
   * const arrayComplex3 = [{name: "vador", surname: "dark"}, {surname: "tony", name: "stark"} ]
   * function arrayComplexIsEqual(val1, val2) {
   *   return (val1.name == val2.name) && (val1.surname == val2.surname);
   * }
   * 
   * test.assertArrayEquals(arraySimple1, arraySimple2, "arraySimple1 and arraySimple2 are equals");
   * // logs out: ✔ PASSED: arraySimple1 and arraySimple2 are equals
   * 
   * test.assertArrayEquals(arraySimple1, arraySimple3, "arraySimple1 and arraySimple3 are equals");
   * // logs out: ❌ FAILED: arraySimple1 and arraySimple3 are equals
   * 
   * test.assertArrayEquals(arrayComplex1, arrayComplex2, "arrayComplex1 and arrayComplex2 are equals", arrayComplexIsEqual);
   * // logs out: ✔ PASSED: arrayComplex1 and arrayComplex2 are equals
   * 
   * test.assertArrayEquals(arrayComplex1, arrayComplex3, "arrayComplex1 and arrayComplex3 are equals", arrayComplexIsEqual);
   * // logs out: ❌ FAILED: arrayComplex1 and arrayComplex3 are equals    
   * 
   * @param {Array} array1 - First Array to compare
   * @param {Array} array2 - Second Array to compare
   * @param {String} message - the message to display in the console
   * @param {GasUnitTestingFramework~ItemEquality} [equalityMethod=Object.is] - Method used to check for array item equality.
   *        {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is Object.is}
   *        is used if not defined.
   */
  assertArrayEquals(array1, array2, message, equalityMethod = Object.is) {
    if (!this.isRunningContextOk()) return;
    this.assert(
      Array.isArray(array1) && Array.isArray(array2) && (array1.length === array2.length) &&
      array1.every((val, index) => equalityMethod(val, array2[index])),
      message
    );
  }

  /**
   * Tests whether the given object is a 2d array
   * 
   * @example
   * test.assertIs2dArray([[1,2,3], [3,4,5]], "Array is a 2d Array");
   * // logs out: ✔ PASSED: Array is a 2d Array
   * 
   * @param {Array.<Array<Object>> | Function} array - any 2d-array of a function returning a such array
   * @param {String} message - the message to display in the console
   */
  assertIs2dArray(array, message) {
    if (!this.isRunningContextOk()) return;
    try {
      if (typeof array === 'function') array = array();
      this.assert(
        Array.isArray(array) &&
        array.every(row => Array.isArray(row)),
        message
      );
    } catch (err) {
      this.log(`❌ FAILED: ${this.msgPrefix}${message} (${err})`);
    }
  }

  /**
   * Tests and Print to Console whether 2dArrays are equals.
   * 
   * @example
   * 
   * const array2dSimple1 = [[1,2,3], [3,4,5]];
   * const array2dSimple2 = [[1,2,3], [3,4,5]];
   * const array2dSimple3 = [[1,2,3], [3,4,6]];
   * const array2dComplex1 = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];
   * const array2dComplex2 = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];
   * function arrayComplexIsEqual(val1, val2) {
   *   return (val1.name == val2.name) && (val1.surname == val2.surname);
   * }
   * 
   * test.assert2dArrayEquals(array2dSimple1, array2dSimple2, "array2dSimple1 and array2dSimple2 are equals");
   * // logs out: ✔ PASSED: array2dSimple1 and array2dSimple2 are equals
   * 
   * test.assert2dArrayEquals(array2dSimple1, array2dSimple3, "array2dSimple1 and array2dSimple3 are equals");
   * // logs out: ❌ FAILED: array2dSimple1 and array2dSimple3 are equals
   * 
   * test.assert2dArrayEquals(array2dComplex1, array2dComplex2, "array2dComplex1 and array2dComplex2 are equals", arrayComplexIsEqual);
   * // logs out: ✔ PASSED: array2dComplex1 and array2dComplex2 are equals
   * 
   * @param {Array.<Array<Object>>} array1 - First 2dArray to compare
   * @param {Array.<Array<Object>>} array2 - Second 2dArray to compare
   * @param {String} message - the message to display in the console
   * @param {itemEquality} [equalityMethod=Object.is] - Method used to check for item equality.
   *        {@link Object.is} is used if not defined.
   */
  assert2dArrayEquals(array1, array2, message, equalityMethod = Object.is) {
    if (!this.isRunningContextOk()) return;
    this.assert(
      Array.isArray(array1) && array1.every(row => Array.isArray(row)) &&
      Array.isArray(array2) && array2.every(row => Array.isArray(row)) &&
      array1.every((row, rowIndex) => (row.length === array2[rowIndex].length)) &&
      array1.every((row, rowIndex) => row.every((value, colIndex) => equalityMethod(value, array2[rowIndex][colIndex]))),
      message
    )
  }

  /**
   * Start the capture of Log.
   * 
   * This method is used in conjonction with the {@link assertLogMatch} method.
   * 
   * Is is usually call before the tested method. Then after, the {@link assertLogMatch}
   * can be used to check for waited log during the tested method execution.
   * 
   * See Example in {@link assertLogMatch}.
   */
  startCaptureLog() {
    if (!this.isRunningContextOk()) return;
    this.startCaptureLogIndex = Logger.getLog().length;
  }

  /**
   * Test if the captured log contains the given regexp.
   * 
   * Start of the log caption can be indicated with a call
   * to the method {@link startCaptureLog}, or manually by using the startLogIndex parameter.
   * 
   * @example
   * 
   * function dummyLogFunction()
   * {
   *   Logger.log("my function is logging");
   * }
   * 
   * test.startCaptureLog();
   * test.assertLogMatch("my function is logging", "Log of dummyLogFunction are the waited one")
   * // logs out: ❌ FAILED: "Log of dummyLogFunction are the waited one
   *
   * test.assertLogNotMatch(["my function is logging"], "Log of dummyLogFunction are not present")
   * // logs out: ✔ PASSED: Log of dummyLogFunction are not present
   * 
   * dummyLogFunction()
   * 
   * test.assertLogMatch("my function is logging", "Log of dummyLogFunction are the waited one")
   * // logs out: ✔ PASSED: Log of dummyLogFunction are the waited one
   * 
   * @param {RegExp} regexp - Regex to test on the captured Logs.
   * @param {String} message - the message to display in the console 
   * @param {Integer} [nb=1] - Number of waited match for the given regexp in the captured logs. 1 if not defined.
   * @param {Integer?} startLogIndex - Index where Captured Log is starting in the full Log
   * output. If omitted, the index captured by the previous call to {@link startCaptureLog} is
   * used.
   */
  assertLogMatch(regexp, message, nb = 1, startLogIndex = this.startCaptureLogIndex) {
    if (!this.isRunningContextOk()) return;
    let capturedLogContent = Logger.getLog().slice(startLogIndex);
    let matches = capturedLogContent.match(regexp);
    this.assert(matches != null && matches.length == nb, message);
  }

  /**
   * Tests if captured Logs does not contains given regexps.
   * 
   * Start of the log caption can be indicated with a call
   * to the method {@link startCaptureLog}, or manually by using the startLogIndex parameter.
   * 
   * See Example in {@link assertLogMatch}.
   * 
   * @param {Array.<RegExp>} patterns - an array of Regex to check for in the captured log.
   * @param {String} message - the message to display in the console 
   * @param {Integer?} startLogIndex - Index where Captured Log is starting in the full Log
   * output. If omitted, the index captured by the previous call to {@link startCaptureLog} is
   * used.
   */
  assertLogNotMatch(patterns, message, startLogIndex = this.startCaptureLogIndex) {
    if (!this.isRunningContextOk()) return;
    let capturedLogContent = Logger.getLog().slice(startLogIndex);
    let isOk = patterns.every(pattern => capturedLogContent.match(pattern) == null);
    this.assert(isOk, message);
  }

  /**
   * Print Header in the console
   * Usually used before starting a test sequence.
   * @param {String} text - Text to display inside the header.
   */
  printHeader(text) {
    if (!this.isRunningContextOk()) return;
    this.log('*********************');
    this.log('* ' + text);
    this.log('*********************');
  }

  /**
   * Adds a new test to the prototype of the class
   * @param {String} name the name of the function
   * @param {Function} callback the function to add to the prototype of the class
   */
  addNewTest(name, callback) {
    GasUnitTestingFramework.prototype[name] = callback;
  }

}

GasUnitTestingFramework._runningInGas = new WeakMap();
GasUnitTestingFramework._msgPrefix = new WeakMap();
GasUnitTestingFramework._log = new WeakMap();

/**
 * An Enum that define Context of the execution related to Google AppScript Environnement.
 * @readonly
 * @enum {string}
 * @property {string} InsideGasOnly Context for execution from Google AppScript Environnement.
 * @property {string} OutsideGasOnly Context for execution outside Google AppScript Environnement.
 * @property {string} InsideAndOutsideGas Context for execution from or outside Google AppScript Environnement (everywhere).
 */
const RunningContext = Object.freeze({
  InsideGasOnly: 'InsideGasOnly',
  OutsideGasOnly: 'OutsideGasOnly',
  InsideAndOutsideGas: 'InsideAndOutsideGas'
})

 
if (typeof module !== "undefined") {
  module.exports = {
    GasUnitTestingFramework: GasUnitTestingFramework, 
    RunningContext: RunningContext
  }
} 
