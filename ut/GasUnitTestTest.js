const Logger = require('../mock/Logger');
const { GasUnitTestManager, GasUnitTest, GasUnitTestRunningContext } = require('../src/');
const { GasUnitTestLoggerMock, GasUnitTest_HandlerMock } = require('./GasUnitTestMock.js');

/**
 * Unit Test of GasUnitTest class
 * @param {GasUnitTestManager} testSuite 
 */
function GasUnitTestTest(testSuite) {
  const loggerMock = new GasUnitTestLoggerMock();
  var testContainerHandler = new GasUnitTest_HandlerMock();
  const testName= "My TEST";
  let exceptionMessage = 'This is My Exception';
  let exceptionMessageRegex = 'Exception'
  let exceptionMessageWrongRegex = 'WrongRegex'
  let exception = new Error(exceptionMessage);
  function testFunctionOk() {
    return true;
  }
  function testFunctionKo() {
    return false;
  }
  function testFunctionException() {
    throw exception;
  }

  function genericResultTest(test, testedMethod, underTest, waitedStatus, waitedMessage,
                              nbTestOkWaited = waitedStatus ? 1 : 0,
                              nbTestKoWaited = waitedStatus ? 0 : 1) {
    test.assert(
      loggerMock.onAssertResultParameters.length == 1,
      `${testedMethod} result notification is received`
    );
    test.assert(
      loggerMock.onAssertResultParameters[0].test == underTest,
      `${testedMethod} result test parameter is ok`
    );
    test.assert(
      loggerMock.onAssertResultParameters[0].status == waitedStatus,
      `${testedMethod} result status parameter is ok`
    );
    test.assert(
      loggerMock.onAssertResultParameters[0].message == waitedMessage,
      `${testedMethod} result message parameter is ok`
    );
    test.assert(underTest.nbAssertOk == nbTestOkWaited);
    test.assert(underTest.nbAssertKo == nbTestKoWaited);
  }


  testSuite.testSection("GasUnitTestTest", (add) => {
    
    add.test("constructor() - Initialized values are correct", (test) => {
      const underTestDefault = new GasUnitTest(testName, testContainerHandler.handlerMock);
      test.assert(underTestDefault.name === testName, "name property is correct");
      test.assert(underTestDefault.handler == testContainerHandler.handlerMock, "handler property is correct");
      test.assert(underTestDefault.logger.constructor.name === "GasUnitTestNotificationManager",
        "logger property is the default one (GasUnitTestNotificationManager)");
      test.assert(
        underTestDefault.runningContext === GasUnitTestRunningContext.InsideAndOutsideGas,
        "Default RunningContext is InsideAndOutsideGas");
      test.assert(
        underTestDefault.msgPrefix === "",
        "Default Message Prefix is empty");
      test.assert(
        underTestDefault.handlerParameters.length === 0, "Default handlerParameters is empty"
      );
      
      const mockParameter1 = new Object();
      const mockParameter2 = new Object();
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock, mockParameter1, mockParameter2);
      test.assert(underTest.logger.constructor.name === "GasUnitTestLoggerMock",
        "logger can be changed by constructor");
      test.assertArrayEquals(underTest.handlerParameters, [mockParameter1, mockParameter2],
        "handlerParameters can be defined by constructor");
    });

    add.test("log() - Shortcut to log notification", (test) => {
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
      const myTestMessage = "LOG ARE MOCKED";
      loggerMock.resetMock();

      underTest.log(myTestMessage);

      test.assert(loggerMock.logCalledParameters.length == 1,
        "Log notification is received");
      test.assert(
        loggerMock.logCalledParameters[0].msg === myTestMessage,
        `Log is correct`);
    });

    add.test("execute() - Execute a test without extra parameter", (test) => {
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock.bind(testContainerHandler), loggerMock);
      loggerMock.resetMock();

      underTest.execute();

      test.assert(
        loggerMock.onStartTestParameters[0].test === underTest,
        "Logger OnStartTest is called with test parameter");
      test.assert(testContainerHandler.givenObject === underTest, "Test Handler is called");
      test.assert(testContainerHandler.args.length === 0, "No extra parameters are received");
      test.assert(
        loggerMock.onEndTestParameters[0].test === underTest,
        "Logger OnEndTest is called with test parameter");
      test.assert(underTest.nbTestOk == 1);
      test.assert(underTest.nbTestKo == 0);
    });

    add.test("execute() - Execute a test without extra parameter and ko assert", (test) => {
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock.bind(testContainerHandler), loggerMock);
      loggerMock.resetMock();
      underTest.nbAssertKo = 5;

      underTest.execute();

      test.assert(
        loggerMock.onStartTestParameters[0].test === underTest,
        "Logger OnStartTest is called with test parameter");
      test.assert(testContainerHandler.givenObject === underTest, "Test Handler is called");
      test.assert(testContainerHandler.args.length === 0, "No extra parameters are received");
      test.assert(
        loggerMock.onEndTestParameters[0].test === underTest,
        "Logger OnEndTest is called with test parameter");
      test.assert(underTest.nbTestOk == 0);
      test.assert(underTest.nbTestKo == 1);
    });

    add.test("execute() - Execute a test with extra parameters", (test) => {
      const mockParameter1 = new Object();
      const mockParameter2 = new Object();
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock.bind(testContainerHandler), 
        loggerMock, mockParameter1, mockParameter2);
      loggerMock.resetMock();

      underTest.execute();

      test.assert(
        loggerMock.onStartTestParameters[0].test === underTest,
        "Logger OnStartTest is called with test parameter");
      test.assert(testContainerHandler.givenObject === underTest, "Test Handler is called");
      test.assertArrayEquals(testContainerHandler.args, [mockParameter1, mockParameter2],
        "Extra parameters are received");
        test.assert(
          loggerMock.onEndTestParameters[0].test === underTest,
          "Logger OnEndTest is called with test parameter");
    });

    add.parameterizedTest({
      displayName: "assert() Test",
      valuesSourceCustomName:[
        {displayName: "assert() - true condition is successful", args: {condition: true, testStatus: true}},
        {displayName: "assert() - false condition is in error", args: {condition: false, testStatus: false}},
        {displayName: "assert() - false condition waiting false is successful", args: {condition: false, waiting: false, testStatus: true}},
        {displayName: "assert() - function returning ok is successful", args: {condition: testFunctionOk, testStatus: true}},
        {displayName: "assert() - function returning ko is in error", args: {condition: testFunctionKo, testStatus: false}},
        {displayName: "assert() - function returning ok waiting false is in error", args: {condition: testFunctionOk, waiting: false, testStatus: false}},
        {displayName: "assert() - function returning exception is in error with exception in output message", 
          args: {condition: testFunctionException, waiting: false, testStatus: false, messageRequested: "MY TEST", messageReceived: `MY TEST (${exception})`}},
      ]}, 
      (test, {condition, testStatus, waiting=null, messageRequested=test.name, messageReceived=test.name}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();
        
        if (waiting == null) {
          underTest.assert(condition, messageRequested);
        } else {
          underTest.assert(condition, messageRequested, waiting);
        }

        genericResultTest(test, "Assert", underTest, testStatus, messageReceived);
      }
    );
    
    add.parameterizedTest({
      displayName: "assertFalse() Test",
      valuesSourceCustomName:[
        {displayName: "assertFalse() - true condition is in error", args: {condition: true, testStatus: false}},
        {displayName: "assertFalse() - false condition is successful", args: {condition: false, testStatus: true}},
        {displayName: "assertFalse() - function returning ok is in error", args: {condition: testFunctionOk, testStatus: false}},
        {displayName: "assertFalse() - function returning ko is successful", args: {condition: testFunctionKo, testStatus: true}},
        {displayName: "assertFalse() - function returning exception is in error with exception in output message", 
          args: {condition: testFunctionException, testStatus: false, localTestMsg: "MY TEST", waitedMsg: `MY TEST (${exception})`}}
      ]},
      (test, {condition, testStatus, localTestMsg=test.name, waitedMsg=test.name}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.assertFalse(condition, localTestMsg);

        genericResultTest(test, "assertFalse", underTest, testStatus, waitedMsg);
      }
    );

    add.parameterizedTest({
      displayName: "assertThrowErr() Test",
      valuesSourceCustomName:[
        {displayName: "assertThrowErr() - function returning exception is successful when exception is the waited one", 
          args: {fct: testFunctionException, exceptionMsg: exceptionMessage, waitedStatus: true }},
        {displayName: "assertThrowErr() - function returning exception is successful when exception is matching given regex",
          args: {fct: testFunctionException, exceptionMsg: exceptionMessageRegex, waitedStatus: true }},
        {displayName: "assertThrowErr() - function returning exception is in error when exception is not matching given regex",
          args: {fct: testFunctionException, exceptionMsg: exceptionMessageWrongRegex, waitedStatus: false }},
        {displayName: "assertThrowErr() - function returning exception is in error when exception is not thrown",
          args: {fct: testFunctionOk, exceptionMsg: exceptionMessage, waitedStatus: false }}
      ]}, 
      (test, {fct, exceptionMsg, waitedStatus}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        localTestMsg = test.name;
        underTest.assertThrowErr(fct, exceptionMsg, localTestMsg);

        genericResultTest(test, "assertThrowErr", underTest, waitedStatus, localTestMsg);
      }
    );

    const testArraySimple = [12, 14];
    const testArraySimpleSame = [12, 14];
    const testArraySimpleDifferent = [12, 15];
    const testNoArray = 12;
    const testArrayDifferentSize = [12];
    const testArrayComplex = [{ name: "kenobi", surname: "obiwan" }, { surname: "tony", name: "stark" }]
    const testArrayComplexSame = [{ surname: "obiwan", name: "kenobi" }, { name: "stark", surname: "tony" }]
    const testArrayComplexDifferent = [{ name: "vador", surname: "dark" }, { surname: "tony", name: "stark" }]
    function testArrayComplexIsEqual(val1, val2) {
      return (val1.name == val2.name) && (val1.surname == val2.surname);
    }


    add.parameterizedTest({
      displayName: "assertArrayEquals() Test",
      valuesSourceCustomName:[
        {displayName: "assertArrayEquals() - with identiques arrays is successful", 
          args: { in_array1: testArraySimple, in_array2: testArraySimple, output_result: true }},
        {displayName: "assertArrayEquals() - with different arrays is in error",
          args: { in_array1: testArraySimple, in_array2: testArraySimpleDifferent, output_result: false }},
        {displayName: "assertArrayEquals() - with an argument that is not an array is in error",
          args: { in_array1: testArraySimple, in_array2: testNoArray, output_result: false }},
        {displayName: "assertArrayEquals() - with arrays of different size is in error",
          args: { in_array1: testArraySimple, in_array2: testArrayDifferentSize, output_result: false }},
        {displayName: "assertArrayEquals() - with identiques complexes arrays without custom equality method is in error",
          args: { in_array1: testArrayComplex, in_array2: testArrayComplexSame, output_result: false }},
        {displayName: "assertArrayEquals() - with identiques complexes arrays with custom equality method is successful",
          args: { in_array1: testArrayComplex, in_array2: testArrayComplexSame, in_equality_method: testArrayComplexIsEqual, output_result: true }},
        {displayName: "assertArrayEquals() - with different complexes arrays with custom equality method is in error",
          args: { in_array1: testArrayComplex, in_array2: testArrayComplexDifferent, in_equality_method: testArrayComplexIsEqual, output_result: false }},       
      ]},
      (test, {in_array1, in_array2, in_message=test.name, in_equality_method=null, output_result, output_message=test.name}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        if (in_equality_method) {
          underTest.assertArrayEquals(in_array1, in_array2, in_message, in_equality_method);
        } else {
          underTest.assertArrayEquals(in_array1, in_array2, in_message);
        }

        genericResultTest(test, "assertArrayEquals", underTest, output_result, output_message);
      }
    );

    const testArray2dSimple = [[1, 2, 3], [3, 4, 5]];
    const testArray2dSimpleSame = [[1, 2, 3], [3, 4, 5]];
    const testArray2dSimpleSizeError = [[1, 2, 3], [3, 4, 5, 6]];
    const testArray2dSimpleDifferent = [[1, 2, 3], [3, 4, 6]];
    const testArray2dNotCorrect = [[1, 2, 3], 2];
    function testFunction2dArray() {
      return testArray2dSimple;
    }
    
    add.parameterizedTest({
      displayName: "assertIs2dArray() Test",
      valuesSourceCustomName:[
        {displayName: "assertIs2dArray() - with a 2dArray is successful", 
          args: { in_array: testArray2dSimple, output_result: true }},
        {displayName: "assertIs2dArray() - with an argument that is not an array is in error",
          args: { in_array: testNoArray, output_result: false }},
        {displayName: "assertIs2dArray() - with a 2dArray not correct is in error",
          args: { in_array: testArray2dNotCorrect, output_result: false }},
        {displayName: "assertIs2dArray() - with a function returning 2dArray is successful",
          args: { in_array: testFunction2dArray, output_result: true }},
        {displayName: "assertIs2dArray() - with a function returning exception is in error with exception in output message",
          args: { in_array: testFunctionException, output_result: false, in_message: "MY TEST", output_message: `MY TEST (${exception})` }},     
      ]},
      (test, {in_array, in_message=test.name, output_result, output_message=test.name}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.assertIs2dArray(in_array, in_message);
        
        genericResultTest(test, "assertIs2dArray", underTest, output_result, output_message);
      }
    );

    const testArray2dComplex = [[{ name: "kenobi", surname: "obiwan" }, { surname: "vador", name: "dark" }], [{ surname: "tony", name: "stark" }, { surname: "nick", name: "furry" }]];
    const testArray2dComplexSame = [[{ name: "kenobi", surname: "obiwan" }, { surname: "vador", name: "dark" }], [{ surname: "tony", name: "stark" }, { surname: "nick", name: "furry" }]];
    const testArray2dComplexDifferent = [[{ name: "kenobi", surname: "obiwan" }, { surname: "vador", name: "dark" }], [{ surname: "toni", name: "stark" }, { surname: "nick", name: "furry" }]];

    add.parameterizedTest({
      displayName: "assert2dArrayEquals() Test",
      valuesSourceCustomName:[
        {displayName: "assert2dArrayEquals() - with identiques 2dArrays is successful", 
          args: { in_array1: testArray2dSimple, in_array2: testArray2dSimpleSame, output_result: true }},
        {displayName: "assert2dArrayEquals() - with different 2dArrays is in error",
          args: { in_array1: testArray2dSimple, in_array2: testArray2dSimpleDifferent, output_result: false }},
        {displayName: "assert2dArrayEquals() - with an argument that is not an 2dArray is in error",
          args: { in_array1: testArray2dSimple, in_array2: testArray2dNotCorrect, output_result: false }},
        {displayName: "assert2dArrayEquals() - with 2dArray where some inner array length differ is in error",
          args: { in_array1: testArray2dSimple, in_array2: testArray2dSimpleSizeError, output_result: false }},
        {displayName: "assert2dArrayEquals() - with identiques complexes 2dArrays without custom equality method is in error",
          args: { in_array1: testArray2dComplex, in_array2: testArray2dComplexSame, output_result: false }},
        {displayName: "assert2dArrayEquals() - with identiques complexes 2dArrays with custom equality method is successful",
          args: { in_array1: testArray2dComplex, in_array2: testArray2dComplexSame, in_equality_method: testArrayComplexIsEqual, output_result: true }},
        {displayName: "assert2dArrayEquals() - with different complexes 2dArrays with custom equality method is in error",
          args: { in_array1: testArray2dComplex, in_array2: testArray2dComplexDifferent, in_equality_method: testArrayComplexIsEqual, output_result: false }},       
      ]},
      (test, {in_array1, in_array2, in_message=test.name, in_equality_method=null, output_result, output_message=test.name}) => {
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        if (in_equality_method) {
          underTest.assert2dArrayEquals(in_array1, in_array2, in_message, in_equality_method);
        } else {
          underTest.assert2dArrayEquals(in_array1, in_array2, in_message);
        }

        genericResultTest(test, "assert2dArrayEquals", underTest, output_result, output_message);
      }
    );

    add.nested("assertLogMatch(),startCaptureLog(),assertLogNotMatch() Tests", (add) => {
      const testLog = "my function is logging";
      const testNoLogRegex = ["toto", "tata"];
      Logger.mock_outputToConsole = false;
      
      add.test("assertLogMatch() - Log are not available", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.assertLogMatch(testLog, localTestMsg);

        genericResultTest(test, "assertLogMatch", underTest, false, localTestMsg);
      });

      add.test("startCaptureLog(),assertLogMatch() - Log is the waited one", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.startCaptureLog();
        Logger.log(testLog);
        underTest.assertLogMatch(testLog, localTestMsg);

        genericResultTest(test, "assertLogMatch", underTest, true, localTestMsg);
      });

      add.test("startCaptureLog(),assertLogMatch() - Log are no more in the captured window", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.startCaptureLog();
        Logger.log(testLog);
        underTest.startCaptureLog();
        underTest.assertLogMatch(testLog, localTestMsg);

        genericResultTest(test, "assertLogMatch", underTest, false, localTestMsg);
      });

      add.test("startCaptureLog(),assertLogMatch() - Log are present twice", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();

        underTest.startCaptureLog();
        Logger.log(testLog);
        Logger.log(testLog);
        underTest.assertLogMatch(testLog, localTestMsg, 2);

        genericResultTest(test, "assertLogMatch", underTest, true, localTestMsg);
      });

      add.test("assertLogMatch() - startIndex can be modified", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();
        Logger.mock_content = "";

        underTest.startCaptureLog();
        Logger.log(testLog);
        underTest.startCaptureLog();
        Logger.log(testLog);
        Logger.log(testLog);
        
        underTest.assertLogMatch(testLog, localTestMsg, 2);

        genericResultTest(test, "assertLogMatch", underTest, true, localTestMsg);

        loggerMock.resetMock();
        underTest.assertLogMatch(testLog, localTestMsg, 3, 0);

        genericResultTest(test, "assertLogMatch", underTest, true, localTestMsg, 2, 0);
      });

      add.test("assertLogNoMatch() - Logs are not present", (test) => {
        localTestMsg = "My Log Test"
        const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
        loggerMock.resetMock();
        Logger.mock_content = "";

        underTest.startCaptureLog();
        Logger.log(testLog);
        
        underTest.assertLogNotMatch(testNoLogRegex, localTestMsg);

        genericResultTest(test, "assertLogNotMatch", underTest, true, localTestMsg);
        
        loggerMock.resetMock();
        underTest.assertLogNotMatch([testLog], localTestMsg);
        
        genericResultTest(test, "assertLogNotMatch", underTest, false, localTestMsg, 1 ,1);
      });
    });

    add.test("runningContext can skip the test", (test) => {
      const underTest = new GasUnitTest(testName, testContainerHandler.handlerMock, loggerMock);
      loggerMock.resetMock();

      if (test.isInGas) {
        underTest.runningContext = GasUnitTestRunningContext.OutsideGasOnly;
      } else {
        underTest.runningContext = GasUnitTestRunningContext.InsideGasOnly;
      }

      test.assertFalse(underTest.isRunningContextOk(),
        "isRunningContextOk() return False"
      );

      underTest.assert(true, "TEST");
      underTest.assert2dArrayEquals(null, null, "TEST");
      underTest.assertArrayEquals(null, null, "TEST");
      underTest.assertFalse(true, "TEST");
      underTest.assertIs2dArray(null, "TEST");
      underTest.assertLogMatch(null, "TEST");
      underTest.assertLogNotMatch(null, "TEST");
      underTest.assertThrowErr(null, "", "TEST");

      test.assert(loggerMock.onAssertResultParameters.length == 0, 
        "No assert result notification are received"
      );

    });
    
  });

}

if (typeof module !== "undefined") {
  module.exports = { GasUnitTestTest };
} 