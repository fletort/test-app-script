const { GasUnitTestInfo } = require("./GasUnitTestInfo");

/**
 * GasUnitTest Client Notification (Logger) Interface 
 * @interface
 */
class IGasUnitTestNotification {
    constructor() { 
      if (this.constructor === IGasUnitTestNotification) {
        throw new TypeError('Interface class "IGasUnitTestNotification" cannot be instantiated directly');
      }
    }
    
    /**
     * Log Message
     * 
     * @param {String} msg - Message to Print.
     */
    log(msg) {
      throw new Error('You must implement this function');
    }
    
    /**
     * Called when test Manager is starting test sequence.
     */
    OnStartAllTest() {
        throw new Error('You must implement this function');
    }
    
    /**
     * Called when test section is starting execution of its internal test sequence.
     * @param {GasUnitTestInfo} section 
     */
    OnStartTestSection(section) {
      throw new Error('You must implement this function');
    }

    /**
     * Called when test section finished its execution of its internal test sequence.
     * @param {GasUnitTestInfo} section 
     */
    OnEndTestSection(section) {
      throw new Error('You must implement this function');
    }
  
    /**
     * Called when a test is starting execution.
     * @param {GasUnitTestInfo} test 
     */
    OnStartTest(test) {
        throw new Error('You must implement this function');
    }
  
    /**
     * Called when a assert test return a result.
     * @param {GasUnitTestInfo} test 
     * @param {Boolean} status 
     * @param {String} message 
     */
    OnAssertResult(test, status, message) {
        throw new Error('You must implement this function');
    }
  
    /**
     * Called when a test is finishing its execution.
     * @param {GasUnitTestInfo} test 
     */
    OnEndTest(test) {
        throw new Error('You must implement this function');
    }
  }

  if (typeof module !== "undefined") {
    module.exports = {IGasUnitTestNotification};
  } 