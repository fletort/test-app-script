const { GasUnitTestContainer } = require('../src/');
const { GasUnitTestLoggerMock, GasUnitTest_HandlerMock, GasUnitTestMock } = require('./GasUnitTestMock');

function GasUnitTestContainerTest(testSuite) {
  
  const loggerMock = new GasUnitTestLoggerMock();
  var testContainerHandler = new GasUnitTest_HandlerMock();

  testSuite.testSection("GasUnitTestContainerTest", (add) => {
    add.test("constructor() - Initialized values are correct", (test) => {
      const testName = "My Name";
      const underTest = new GasUnitTestContainer(testName, testContainerHandler.handlerMock);
      test.assert(underTest.name === testName, "name property is correct");
      test.assert(underTest.handler == testContainerHandler.handlerMock, "handler property is correct");
      test.assert(underTest.logger.constructor.name === "GasUnitTestNotificationManager",
        "logger property is the default one (GasUnitTestNotificationManager)");

      const underTest2 = new GasUnitTestContainer(testName, testContainerHandler.handlerMock, loggerMock);
      test.assert(underTest2.logger.constructor.name != "GasUnitTestLoggerMock",
        "logger property is correct");
    });

    add.test("execute() - Execute an empty container", (test) => {
      const testName = "My Name";
      const underTest = new GasUnitTestContainer(testName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      loggerMock.resetMock();
      testContainerHandler.resetMock();

      underTest.execute();
      test.assert(
        loggerMock.onStartTestSectionCalledParameters.length == 1,
        "Logger onStartTestSection is called one time");
      test.assert(  
        loggerMock.onStartTestSectionCalledParameters[0].section === underTest,
        "Logger onStartTestSection receive the section as argument");
      test.assert(
        testContainerHandler.givenObject != null,
        "Container Handler is called");
      test.assert(
        testContainerHandler.givenObject === underTest,
        "Container Handler receive the section as argument");
    });

    add.test("test() - Create a test", (test) => {
      const testContainerName = "My Container Under Test";
      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;

      const test1Name = "My First Test";
      var test1Handler = new GasUnitTest_HandlerMock();
      const test1 = underTest.test(test1Name, test1Handler.handlerMock);
      
      test.assert(test1.name === test1Name, "Test name is correct");
      test.assert(test1.handler == test1Handler.handlerMock, "Test handler is correct");
      test.assert(test1.logger === loggerMock, "Test logger is correct");
    });

    add.test("nested() - Create a nested", (test) => {
      const testContainerName = "My Container Under Test";
      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;

      const nestedName = "My Nested";
      var nestedHandler = new GasUnitTest_HandlerMock();
      const nested = underTest.nested(nestedName, nestedHandler.handlerMock);
      
      test.assert(nested.name === nestedName, "Nested name is correct");
      test.assert(nested.handler == nestedHandler.handlerMock, "Nested handler is correct");
      test.assert(nested.logger === loggerMock, "Nested logger is correct");
    });

    add.test("parameterizedTest() - Create parameterized Tests with simple arg", (test) => {
      const testContainerName = "My Container Under Test";
      var testHandler = new GasUnitTest_HandlerMock();
      const templateName = "Index:${index} - FirstArg:${0} - SecondArg:${1} - AllArgs:${arguments}";
      const testSimpleArg = ["first test mono arg", "second test mono arg"];
      const testSimpleArgCustomName = [{displayName: "Custom Test Name", args: "my simple arg"}];
      const waitedTestName = [
        `Index:1 - FirstArg:${testSimpleArg[0]} - SecondArg:${"${1}"} - AllArgs:${testSimpleArg[0]}`,
        `Index:2 - FirstArg:${testSimpleArg[1]} - SecondArg:${"${1}"} - AllArgs:${testSimpleArg[1]}`,
        `${testSimpleArgCustomName[0].displayName}`
      ];
      const waitedTestArg = [
        [testSimpleArg[0]],  [testSimpleArg[1]], [testSimpleArgCustomName[0].args]
      ];

      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      const tests = underTest.parameterizedTest(
        {
          parameterizedTestNameTemplate: templateName,
          valuesSource: testSimpleArg,
          valuesSourceCustomName: testSimpleArgCustomName
        },
        testHandler.handlerMock
      );
      
      test.assert(tests.length === 3, "All tests are created");
      tests.forEach((createdTest, index) => {
        test.assert(createdTest.name === waitedTestName[index], `Test ${index+1} name is correct`);
        test.assert(createdTest.handler == testHandler.handlerMock, `Test ${index+1} handler is correct`);
        test.assert(createdTest.logger === loggerMock, `Test ${index+1} logger is correct`);
        test.assertArrayEquals(createdTest.handlerParameters, waitedTestArg[index], `Test ${index+1} arguments are correct`)
      });

    });

    add.test("parameterizedTest() - Create parameterized Tests with multiple args", (test) => {
      const testContainerName = "My Container Under Test";
      var testHandler = new GasUnitTest_HandlerMock();
      const templateName = "Index:${index} - FirstArg:${0} - SecondArg:${1} - AllArgs:${arguments}";
      const testMultipleArg = [["test1 arg1", "test1 arg2"], ["test2 arg1", "test2 arg2"]];
      const testMultipleArgCustomName = [{displayName: "Custom Test Name", args: ["test3 arg1", "test3 arg2"]}];
      const waitedTestName = [
        `Index:1 - FirstArg:${testMultipleArg[0][0]} - SecondArg:${testMultipleArg[0][1]} - AllArgs:${testMultipleArg[0]}`,
        `Index:2 - FirstArg:${testMultipleArg[1][0]} - SecondArg:${testMultipleArg[1][1]} - AllArgs:${testMultipleArg[1]}`,
        `${testMultipleArgCustomName[0].displayName}`
      ];
      const waitedTestArg = [
        [testMultipleArg[0]],  [testMultipleArg[1]], [testMultipleArgCustomName[0].args]
      ];

      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      const tests = underTest.parameterizedTest(
        {
          parameterizedTestNameTemplate: templateName,
          valuesSource: testMultipleArg,
          valuesSourceCustomName: testMultipleArgCustomName
        },
        testHandler.handlerMock
      );
      
      test.assert(tests.length === 3, "All tests are created");
      tests.forEach((createdTest, index) => {
        test.assert(createdTest.name === waitedTestName[index], `Test ${index+1} name is correct`);
        test.assert(createdTest.handler == testHandler.handlerMock, `Test ${index+1}handler is correct`);
        test.assert(createdTest.logger === loggerMock, `Test ${index+1} logger is correct`);
        test.assertArrayEquals(createdTest.handlerParameters, waitedTestArg[index], `Test ${index+1} arguments are correct`)
      });
    });

    add.test("parameterizedTest() - Create parameterized Tests with dict arg", (test) => {
      const testContainerName = "My Container Under Test";
      var testHandler = new GasUnitTest_HandlerMock();
      const templateName = "Index:${index} - FirstArg:${0} - NamedArg1:${arg1} - NamedArg2:${arg2} - AllArgs:${arguments}";
      const testDictArg = [{arg1: "test1 arg1", arg2: "test1 arg2"}, {arg1: "test2 arg1", arg2: "test2 arg2"}];
      const testDictArgCustomName = [{displayName: "Custom Test Name", args: {arg1: "test3 arg1", arg2: "test3 arg2"}}];
      const waitedTestName = [
        `Index:1 - FirstArg:${"${0}"} - NamedArg1:${testDictArg[0].arg1} - NamedArg2:${testDictArg[0].arg2} - AllArgs:${testDictArg[0]}`,
        `Index:2 - FirstArg:${"${0}"} - NamedArg1:${testDictArg[1].arg1} - NamedArg2:${testDictArg[1].arg2} - AllArgs:${testDictArg[1]}`,
        `${testDictArgCustomName[0].displayName}`
      ];
      const waitedTestArg = [
        [testDictArg[0]],  [testDictArg[1]], [testDictArgCustomName[0].args]
      ];

      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      const tests = underTest.parameterizedTest(
        {
          parameterizedTestNameTemplate: templateName,
          valuesSource: testDictArg,
          valuesSourceCustomName: testDictArgCustomName
        },
        testHandler.handlerMock
      );
      
      test.assert(tests.length === 3, "All tests are created");
      tests.forEach((createdTest, index) => {
        test.assert(createdTest.name === waitedTestName[index], `Test ${index+1} name is correct`);
        test.assert(createdTest.handler == testHandler.handlerMock, `Test ${index+1}handler is correct`);
        test.assert(createdTest.logger === loggerMock, `Test ${index+1} logger is correct`);
        test.assertArrayEquals(createdTest.handlerParameters, waitedTestArg[index], `Test ${index+1} arguments are correct`)
      });
    });

    add.test("parameterizedTest() - Create parameterized Tests with simple arg and with a nested Name", (test) => {
      const testContainerName = "My Container Under Test";
      var testHandler = new GasUnitTest_HandlerMock();
      const templateName = "Index:${index} - FirstArg:${0} - SecondArg:${1} - AllArgs:${arguments}";
      const testSimpleArg = ["first test mono arg", "second test mono arg"];
      const testSimpleArgCustomName = [{displayName: "Custom Test Name", args: "my simple arg"}];
      const waitedTestName = [
        `Index:1 - FirstArg:${testSimpleArg[0]} - SecondArg:${"${1}"} - AllArgs:${testSimpleArg[0]}`,
        `Index:2 - FirstArg:${testSimpleArg[1]} - SecondArg:${"${1}"} - AllArgs:${testSimpleArg[1]}`,
        `${testSimpleArgCustomName[0].displayName}`
      ];
      const waitedTestArg = [
        [testSimpleArg[0]],  [testSimpleArg[1]], [testSimpleArgCustomName[0].args]
      ];

      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      /** @type {GasUnitTestContainer} */
      const section = underTest.parameterizedTest(
        {
          displayName: "My Parameterized Test",
          parameterizedTestNameTemplate: templateName,
          valuesSource: testSimpleArg,
          valuesSourceCustomName: testSimpleArgCustomName
        },
        testHandler.handlerMock
      );
      
      test.assert(section instanceof GasUnitTestContainer, "A new Container is returned");
      test.assert(section.handler.toString().includes("parameterizedTest"), "The New Container handler is parameterizedTest method");
      
      // Call manually the handler of this new section
      const tests = section.handler(section);
      
      test.assert(tests.length === 3, "All tests are created");
      tests.forEach((createdTest, index) => {
        test.assert(createdTest.name === waitedTestName[index], `Test ${index+1} name is correct`);
        test.assert(createdTest.handler == testHandler.handlerMock, `Test ${index+1} handler is correct`);
        test.assert(createdTest.logger === loggerMock, `Test ${index+1} logger is correct`);
        test.assertArrayEquals(createdTest.handlerParameters, waitedTestArg[index], `Test ${index+1} arguments are correct`)
      });
    });
    

    add.test("execute() - Execute a container with test and nested", (test) => {
      const testContainerName = "My Container Under Test";
      const underTest = new GasUnitTestContainer(testContainerName, testContainerHandler.handlerMock.bind(testContainerHandler));
      underTest.logger = loggerMock;
      underTest.unitTestClass = GasUnitTestMock; // injection of Mock UnitTest
      loggerMock.resetMock();
      testContainerHandler.resetMock();
      
      const test1Name = "My First Test";
      var test1Handler = new GasUnitTest_HandlerMock();
      /** @type {GasUnitTestMock} */
      const test1 = underTest.test(test1Name, test1Handler.handlerMock.bind(test1Handler));
      
      const test2Name = "My Second Test";
      var test2Handler = new GasUnitTest_HandlerMock();
      /** @type {GasUnitTestMock} */
      const test2 = underTest.test(test2Name, test2Handler.handlerMock.bind(test2Handler));
      
      const nestedName = "Nested Name";
      var nestedHandler = new GasUnitTest_HandlerMock();
      const nestedContainer = underTest.nested(nestedName, nestedHandler.handlerMock.bind(nestedHandler));
        
      underTest.execute();
      test.assert(
        loggerMock.onStartTestSectionCalledParameters.length == 2,
        "Logger onStartTestSection is called twice");
      test.assert(  
        loggerMock.onStartTestSectionCalledParameters[0].section === underTest,
        "Logger onStartTestSection receive the section as argument on first call");
      test.assert(
        test1.executeIsCalled,
        "Test1 is executed");
      test.assert(
        test2.executeIsCalled,
        "Test2 is executed");
      test.assert(
        nestedHandler.givenObject != null,
        "Nested Handler is called");
        test.assert(  
          loggerMock.onStartTestSectionCalledParameters[1].section === nestedContainer,
          "Logger onStartTestSection receive the nested as argument on second call");
    });



  });
}

if (typeof module !== "undefined") {
  module.exports = {GasUnitTestContainerTest};
} 