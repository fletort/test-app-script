const { GasUnitTestManager } = require("../src");
const { GasUnitTestContainerTest } = require("./GasUnitTestContainerTest");
const { GasUnitTestDefaultLoggerTest } = require("./GasUnitTestDefaultLoggerTest");
const { GasUnitTestManagerTest } = require("./GasUnitTestManagerTest");
const { GasUnitTestNotificationManagerTest } = require("./GasUnitTestNotificationManagerTest");
const { GasUnitTestTest } = require("./GasUnitTestTest");


function runTestSuite() {
  const manager = new GasUnitTestManager();
  GasUnitTestDefaultLoggerTest(manager);
  GasUnitTestContainerTest(manager);
  GasUnitTestManagerTest(manager);
  GasUnitTestNotificationManagerTest(manager);
  GasUnitTestTest(manager)
  manager.execute();
}


/**
 * If we're running locally, execute the tests.
 * In GAS environment, runTestSuite() needs to be executed manually
 */
(function () {
  /**
 * @type {Boolean} - if true, were're in the GAS environment, otherwise we're running locally
 */
  const IS_GAS_ENV = (typeof ScriptApp !== 'undefined');
  if (!IS_GAS_ENV) runTestSuite();
})();