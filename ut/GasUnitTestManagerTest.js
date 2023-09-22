const { GasUnitTestManager } = require('../src/');
const { GasUnitTestLoggerMock, GasUnitTest_HandlerMock, GasUnitTestContainerMock } = require('./GasUnitTestMock');

/**
 * Unit Test of GasUnitTestManager class
 * @param {GasUnitTestManager} testSuite 
 */
function GasUnitTestManagerTest(testSuite) {
  
  const loggerMock = new GasUnitTestLoggerMock();
  var exitHandler = new GasUnitTest_HandlerMock();

  testSuite.testSection("GasUnitTestManagerTest", (add) => {
    add.test("constructor() - Initialized values are correct", (test) => {
      const underTest = new GasUnitTestManager();
      test.assert(underTest.logger.constructor.name === "GasUnitTestNotificationManager",
        "logger property is the default one (GasUnitTestNotificationManager)");
    });

    add.test("execute() - Execute an empty manager", (test) => {
      const underTest = new GasUnitTestManager();
      underTest.logger = loggerMock;
      underTest.exitOnError = exitHandler.handlerMock.bind(exitHandler);
      loggerMock.resetMock();
      exitHandler.resetMock();

      underTest.execute();
      test.assert(
        loggerMock.onStartAllTestParameters.length == 1,
        "Logger onStartAllTest is called one time");
      test.assert(
        exitHandler.givenObject == null,
        "Exit Method is not called");
      test.assert(
        loggerMock.onAllTestEndParameters.length == 1,
        "Logger onAllTestEnd is called one time");
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
    
    add.parameterizedTest({
      displayName: "execute() - Execute a testsuite with sections",
      valuesSourceCustomName:[
        {displayName: "execute() - Execute a testsuite with sections finishing Ok", 
          args: { in_section1_nbOk: 5, in_section2_nbOk: 10, in_section1_nbAssertOk: 18, in_section2_nbAssertOk: 6 }},
        {displayName: "execute() - Execute a testsuite with sections finishing Ko",
          args: { in_section1_nbOk: 5, in_section2_nbOk: 10, in_section1_nbKo: 1, in_section2_nbKo: 3,
            in_section1_nbAssertOk: 18, in_section2_nbAssertOk: 6, in_section1_nbAssertKo: 2, in_section2_nbAssertKo: 4, }},       
      ]},
      (test, {in_section1_nbOk, in_section1_nbKo = 0, in_section2_nbOk, in_section2_nbKo = 0,
        in_section1_nbAssertOk, in_section1_nbAssertKo = 0, in_section2_nbAssertOk, in_section2_nbAssertKo = 0}) => {
        const underTest = new GasUnitTestManager();
        underTest.logger = loggerMock;
        underTest.sectionClass = GasUnitTestContainerMock; // injection of Mock UnitTest
        underTest.exitOnError = exitHandler.handlerMock.bind(exitHandler);
        loggerMock.resetMock();
        exitHandler.resetMock();
        
        const sectionName = "Section Name";
        var sectionHandler = new GasUnitTest_HandlerMock();
        /** @type {GasUnitTestContainerMock} */
        const nestedContainer1 = underTest.testSection(sectionName, sectionHandler.handlerMock.bind(sectionHandler));
        nestedContainer1.nbTestOk = in_section1_nbOk;
        nestedContainer1.nbTestKo = in_section1_nbKo;
        nestedContainer1.nbAssertOk = in_section1_nbAssertOk;
        nestedContainer1.nbAssertKo = in_section1_nbAssertKo;

        const nestedContainer2 = underTest.testSection(sectionName, sectionHandler.handlerMock.bind(sectionHandler));
        nestedContainer2.nbTestOk = in_section2_nbOk;
        nestedContainer2.nbTestKo = in_section2_nbKo;
        nestedContainer2.nbAssertOk = in_section2_nbAssertOk;
        nestedContainer2.nbAssertKo = in_section2_nbAssertKo;
        const waitedTestOk = in_section1_nbOk + in_section2_nbOk;
        const waitedTestKo = in_section1_nbKo + in_section2_nbKo;
        const waitedAssertOk = in_section1_nbAssertOk + in_section2_nbAssertOk;
        const waitedAssertKo = in_section1_nbAssertKo + in_section2_nbAssertKo;
          
        underTest.execute();

        test.assert(
          loggerMock.onStartAllTestParameters.length == 1,
          "Logger onStartAllTest is called one time");
        test.assert(
          nestedContainer1.executeIsCalled && nestedContainer2.executeIsCalled ,
          "All Sections are executed");
        test.assert(
          loggerMock.onAllTestEndParameters.length == 1,
          "Logger onAllTestEnd is called one time");
        test.assert(underTest.nbTestOk === waitedTestOk, "nbTestOk property is correct");
        test.assert(underTest.nbTestKo === waitedTestKo, "nbTestKo property is correct");
        test.assert(underTest.nbAssertOk === waitedAssertOk, "nbAssertOk property is correct");
        test.assert(underTest.nbAssertKo === waitedAssertKo, "nbAssertKo property is correct");
        if (waitedTestKo > 0) {
          test.assert(
            exitHandler.givenObject != null,
            "Exit Method is called");
        } else {
          test.assert(
            exitHandler.givenObject == null,
            "Exit Method is not called");
        }
      });
    });
}

if (typeof module !== "undefined") {
  module.exports = {GasUnitTestManagerTest};
} 