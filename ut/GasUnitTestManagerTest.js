const { GasUnitTestManager } = require('../src/');
const { GasUnitTestLoggerMock, GasUnitTest_HandlerMock, GasUnitTestContainerMock } = require('./GasUnitTestMock');

function GasUnitTestManagerTest(testSuite) {
  
  const loggerMock = new GasUnitTestLoggerMock();

  testSuite.testSection("GasUnitTestManagerTest", (add) => {
    add.test("constructor() - Initialized values are correct", (test) => {
      const underTest = new GasUnitTestManager();
      test.assert(underTest.logger.constructor.name === "GasUnitTestNotificationManager",
        "logger property is the default one (GasUnitTestNotificationManager)");
    });

    add.test("execute() - Execute an empty manager", (test) => {
      const underTest = new GasUnitTestManager();
      underTest.logger = loggerMock;
      loggerMock.resetMock();

      underTest.execute();
      test.assert(
        loggerMock.onStartAllTestParameters.length == 1,
        "Logger onStartAllTest is called one time");
    });

    add.test("testSection() - Create a test section", (test) => {
      const underTest = new GasUnitTestManager();
      underTest.logger = loggerMock;
      loggerMock.resetMock();

      const testSectionName = "My Section";
      var sectionHandler = new GasUnitTest_HandlerMock();
      const section = underTest.testSection(testSectionName, sectionHandler.handlerMock);
      
      test.assert(section.name === testSectionName, "Test name is correct");
      test.assert(section.handler == sectionHandler.handlerMock, "Test handler is correct");
      test.assert(section.logger === loggerMock, "Test logger is correct");
    });

    add.test("execute() - Execute a container with sections", (test) => {
      const underTest = new GasUnitTestManager();
      underTest.logger = loggerMock;
      underTest.sectionClass = GasUnitTestContainerMock; // injection of Mock UnitTest
      loggerMock.resetMock();
      
      const sectionName = "Section Name";
      var sectionHandler = new GasUnitTest_HandlerMock();
      /** @type {GasUnitTestContainerMock} */
      const nestedContainer1 = underTest.testSection(sectionName, sectionHandler.handlerMock.bind(sectionHandler));
      const nestedContainer2 = underTest.testSection(sectionName, sectionHandler.handlerMock.bind(sectionHandler));
        
      underTest.execute();

      test.assert(
        loggerMock.onStartAllTestParameters.length == 1,
        "Logger onStartAllTest is called one time");
      test.assert(
        nestedContainer1.executeIsCalled && nestedContainer2.executeIsCalled ,
        "All Sections are executed");
    });



  });
}

if (typeof module !== "undefined") {
  module.exports = {GasUnitTestManagerTest};
} 