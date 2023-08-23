
/**
 * require libraries if the require method exists (outside GAS Mode)
 */
if (typeof require !== 'undefined') {
  (function() {
    // This is used to import outside GAS Environnement.
    // In VSCode IDE import must also be added to global.d.ts file for intellisense purpose.
    var GasUnitTestingFrameworkExport = require('../src/GasUnitTestingFramework.js');
    GasUnitTestingFramework = GasUnitTestingFrameworkExport.GasUnitTestingFramework;
    RunningContext = GasUnitTestingFrameworkExport.RunningContext;
    Logger = require('../mock/Logger.js');
  }());
}

function runTests() {

  var output = "";
  var multilineOutput = false;
  function testConsoleMock(msg) {
    if (multilineOutput)
      output += msg;
    else
      output = msg;
  }
  function assert(result, message) {
    if (result) {
      console.log(`✔ PASSED: GasUnitTestingFramework - ${message}`);
    } else {
      console.log(`❌ FAILED: GasUnitTestingFramework - ${message}`);
    }
  }
  function assertOutput(waitedResult, waitedUserMessage, message=waitedUserMessage) {
    if (waitedResult) {
      waitedUserMessage = `✔ PASSED: ` + waitedUserMessage;
    }
    else {
      waitedUserMessage = `❌ FAILED: ` + waitedUserMessage;
    }
    assert(output == waitedUserMessage, message)
  }
  
  const underTest = new GasUnitTestingFramework();
  let result = typeof(GasUnitTestingFramework._log.get(underTest)) == typeof(console.log);
  assert(result, "Default Log Output is console.log");
  result = underTest.runningContext == RunningContext.InsideAndOutsideGas;
  assert(result, "runningContext - Default RunningContext is InsideAndOutsideGas");
  result = underTest.msgPrefix == "";
  assert(result, "msgPrefix - Default Message Prefix is empty");
  result = underTest == new GasUnitTestingFramework();
  assert(result, "class is a singleton");
  
  underTest.logFunction = testConsoleMock;
  let localTestMsg = "LOG ARE MOCKED";
  underTest.log(localTestMsg)
  assert(output == localTestMsg, "log() - method use logFunction property to print message");

  underTest.runningContext = RunningContext.OutsideGasOnly;
  result = underTest.runningContext == RunningContext.OutsideGasOnly;
  assert(result, "runningContext - getter/setter are in sync");
  underTest.runningContext = RunningContext.InsideAndOutsideGas;

  multilineOutput = true;
  testHeader = "MY TEST HEADER"
  underTest.printHeader(testHeader);
  result = output.match(testHeader);
  assert(result, "printHeader() - print the given text");
  multilineOutput = false;
  
  localTestMsg = "assert() - true condition is successful.";
  underTest.assert(true, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assert() - false condition is in error.";
  underTest.assert(false, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert() - false condition waiting false is successful.";
  underTest.assert(false, localTestMsg, false);
  assertOutput(true, localTestMsg);  

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

  localTestMsg = "assert() - function returning ok is successful.";
  underTest.assert(testFunctionOk, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assert() - function returning ko is in error.";
  underTest.assert(testFunctionKo, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert() - function returning ok waiting false is in error.";
  underTest.assert(testFunctionOk, localTestMsg, false);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert() - function returning exception is in error with exception in output message.";
  underTest.assert(testFunctionException, localTestMsg);
  assertOutput(false, localTestMsg + ` (${exception})`, localTestMsg);

  localTestMsg = "assertFalse() - true condition is in error.";
  underTest.assertFalse(true, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertFalse() - false condition is successful.";
  underTest.assertFalse(false, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertFalse() - function returning ok is in error.";
  underTest.assertFalse(testFunctionOk, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertFalse() - function returning ko is successful.";
  underTest.assertFalse(testFunctionKo, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertFalse() - function returning exception is in error with exception in output message.";
  underTest.assertFalse(testFunctionException, localTestMsg);
  assertOutput(false, localTestMsg + ` (${exception})`, localTestMsg);

  localTestMsg = "assertThrowErr() - function returning exception is successful when exception is the waited one.";
  underTest.assertThrowErr(testFunctionException, exceptionMessage, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertThrowErr() - function returning exception is successful when exception is matching given regex.";
  underTest.assertThrowErr(testFunctionException, exceptionMessageRegex, localTestMsg);
  assertOutput(true, localTestMsg);  

  localTestMsg = "assertThrowErr() - function returning exception is in error when exception is not matching given regex.";
  underTest.assertThrowErr(testFunctionException, exceptionMessageWrongRegex, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertThrowErr() - function returning exception is in error when exception is not thrown.";
  underTest.assertThrowErr(testFunctionOk, exceptionMessage, localTestMsg);
  assertOutput(false, localTestMsg);
  
  const testArraySimple = [12, 14];
  const testArraySimpleSame = [12, 14];
  const testArraySimpleDifferent = [12, 15];
  const testNoArray = 12;
  const testArrayDifferentSize = [12];
  const testArrayComplex = [{name: "kenobi", surname: "obiwan"}, {surname: "tony", name: "stark"} ]
  const testArrayComplexSame = [{ surname: "obiwan", name: "kenobi"}, {name: "stark", surname: "tony"} ]
  const testArrayComplexDifferent = [{name: "vador", surname: "dark"}, {surname: "tony", name: "stark"} ]
  function testArrayComplexIsEqual(val1, val2) {
    return (val1.name == val2.name) && (val1.surname == val2.surname);
  }

  localTestMsg = "assertArrayEquals() - with identiques arrays is successful.";
  underTest.assertArrayEquals(testArraySimple, testArraySimpleSame, localTestMsg);
  assertOutput(true, localTestMsg);
  
  localTestMsg = "assertArrayEquals() - with different arrays is in error.";
  underTest.assertArrayEquals(testArraySimple, testArraySimpleDifferent, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertArrayEquals() - with an argument that is not an array is in error.";
  underTest.assertArrayEquals(testArraySimple, testNoArray, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertArrayEquals() - with arrays of different size is in error.";
  underTest.assertArrayEquals(testArraySimple, testArrayDifferentSize, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertArrayEquals() - with identiques complexes arrays without custom equality method is in error.";
  underTest.assertArrayEquals(testArrayComplex, testArrayComplexSame, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertArrayEquals() - with identiques complexes arrays with custom equality method is successful.";
  underTest.assertArrayEquals(testArrayComplex, testArrayComplexSame, localTestMsg, testArrayComplexIsEqual);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertArrayEquals() - with different complexes arrays with custom equality method is in error.";
  underTest.assertArrayEquals(testArrayComplex, testArrayComplexDifferent, localTestMsg, testArrayComplexIsEqual);
  assertOutput(false, localTestMsg);

  const testArray2dSimple = [[1,2,3], [3,4,5]];
  const testArray2dSimpleSame = [[1,2,3], [3,4,5]];
  const testArray2dSimpleSizeError = [[1,2,3], [3,4,5,6]];
  const testArray2dSimpleDifferent = [[1,2,3], [3,4,6]];
  const testArray2dNotCorrect = [[1,2,3], 2];
  function testFunction2dArray() {
    return testArray2dSimple;
  }  
  const testArray2dComplex = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];
  const testArray2dComplexSame = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];
  const testArray2dComplexDifferent = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "toni", name: "stark"}, {surname: "nick", name: "furry"}]];


  localTestMsg = "assertIs2dArray() - with a 2dArray is successful.";
  underTest.assertIs2dArray(testArray2dSimple, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertIs2dArray() - with an argument that is not an array is in error.";
  underTest.assertIs2dArray(testNoArray, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertIs2dArray() - with a 2dArray not correct is in error.";
  underTest.assertIs2dArray(testArray2dNotCorrect, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assertIs2dArray() - with a function returning 2dArray is successful.";
  underTest.assertIs2dArray(testFunction2dArray, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertIs2dArray() - with a function returning exception is in error with exception in output message.";
  underTest.assertIs2dArray(testFunctionException, localTestMsg);
  assertOutput(false, localTestMsg + ` (${exception})`, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with identiques 2dArrays is successful.";
  underTest.assert2dArrayEquals(testArray2dSimple, testArray2dSimpleSame, localTestMsg);
  assertOutput(true, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with different 2dArrays is in error.";
  underTest.assert2dArrayEquals(testArray2dSimple, testArray2dSimpleDifferent, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with an argument that is not an 2dArray is in error.";
  underTest.assert2dArrayEquals(testArray2dSimple, testArray2dNotCorrect, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with 2dArray where some inner array length differ is in error.";
  underTest.assert2dArrayEquals(testArray2dSimple, testArray2dSimpleSizeError, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with identiques complexes 2dArrays without custom equality method is in error.";
  underTest.assert2dArrayEquals(testArray2dComplex, testArray2dComplexSame, localTestMsg);
  assertOutput(false, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with identiques complexes 2dArrays with custom equality method is successful.";
  underTest.assert2dArrayEquals(testArray2dComplex, testArray2dComplexSame, localTestMsg, testArrayComplexIsEqual);
  assertOutput(true, localTestMsg);

  localTestMsg = "assert2dArrayEquals() - with different complexes 2dArrays with custom equality method is in error.";
  underTest.assert2dArrayEquals(testArray2dComplex, testArray2dComplexDifferent, localTestMsg, testArrayComplexIsEqual);
  assertOutput(false, localTestMsg);

  const testLog = "my function is logging";
  const testLogRegex = /my function is logging/g;
  const testNoLogRegex = [/toto/g, /tata/g];

  localTestMsg = "assertLogMatch() - Log are not available"
  underTest.assertLogMatch(testLog, localTestMsg);
  assertOutput(false, localTestMsg);

  underTest.startCaptureLog();
  Logger.log(testLog);
  localTestMsg = "assertLogMatch() - Log is the waited one"
  underTest.assertLogMatch(testLog, localTestMsg);
  assertOutput(true, localTestMsg);

  underTest.startCaptureLog();
  localTestMsg = "assertLogMatch() - Log are no more in the captured window"
  underTest.assertLogMatch(testLog, localTestMsg);
  assertOutput(false, localTestMsg);

  Logger.log(testLog);
  Logger.log(testLog);
  localTestMsg = "assertLogMatch() - Log are present twice"
  underTest.assertLogMatch(testLogRegex, localTestMsg, 2);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertLogMatch() - startIndex can be modified"
  underTest.assertLogMatch(testLogRegex, localTestMsg, 3, 0);
  assertOutput(true, localTestMsg);

  localTestMsg = "assertLogNoMatch() Logs are not present"
  underTest.assertLogNotMatch(testNoLogRegex, localTestMsg);
  assertOutput(true, localTestMsg);

  process.exit(1)
}



function z_example() {
    const test = new GasUnitTestingFramework()
    test.runningContext = RunningContext.InsideAndOutsideGas;
    test.printHeader('LOCAL AND REMOTE TESTS');

    const testMyInt = 16;
    function testMyFunction() {
      return true;
    }
    
    
    test.assert( testMyInt % 2 === 0, `Number ${testMyInt} is even`);
    // logs out: ✔ PASSED: Number 16 is even 
    
    test.assert( testMyFunction, `testMyFunction is successful`);
    // logs out: ✔ PASSED: testMyFunction is successful
    
    test.assert( testMyInt > 100, `Number ${testMyInt} is bigger than 100`);
    // logs out:❌ FAILED: Number 16 is bigger than 100

    test.assert( testMyInt > 100, `Number ${testMyInt} is NOT bigger than 100`, false);
    // logs out: ✔ PASSED: Number 16 is NOT bigger than 100 

    //test.assert( testTypeError > 100, `Number ${testMyInt} is bigger than 100`);
    // Stop the test program and throw an exception: "ReferenceError: testTypeError is not defined"
    
    test.assert( () => testTypeError > 100, `Number ${testMyInt} is bigger than 100`);
    // logs out: ❌ FAILED: Number 16 is bigger than 100 (ReferenceError: testTypeError is not defined)

    test.assertFalse( testMyInt % 2 === 0, `Number ${testMyInt} is not even`);
    // logs out: ✔ PASSED: Number 15 is not even 
    
    test.assertFalse( testMyFunction, `testMyFunction is not successful`);
    // logs out: ✔ PASSED: testMyFunction is not successful    
    
    function testFunctionWithException() {
      throw new Error('This is My Exception');
    }

    test.assertThrowErr(testFunctionWithException, "This is My Exception", `testFunctionWithException throw the waited exception`);
    // logs out: ✔ PASSED: testFunctionWithException throw the waited exception

    test.assertThrowErr(testFunctionWithException, "Not a Number", `testFunctionWithException throw the waited exception`);
    // logs out: ❌ FAILED: testFunctionWithException throw the waited exception

    const arraySimple1 = [12, 14];
    const arraySimple2 = [12, 14];
    const arraySimple3 = [12, 15];
    const arrayComplex1 = [{name: "kenobi", surname: "obiwan"}, {surname: "tony", name: "stark"} ]
    const arrayComplex2 = [{ surname: "obiwan", name: "kenobi"}, {name: "stark", surname: "tony"} ]
    const arrayComplex3 = [{name: "vador", surname: "dark"}, {surname: "tony", name: "stark"} ]
    function arrayComplexIsEqual(val1, val2) {
      return (val1.name == val2.name) && (val1.surname == val2.surname);
    }

    test.assertArrayEquals(arraySimple1, arraySimple2, "arraySimple1 and arraySimple2 are equals");
    // logs out: ✔ PASSED: arraySimple1 and arraySimple2 are equals

    test.assertArrayEquals(arraySimple1, arraySimple3, "arraySimple1 and arraySimple3 are equals");
    // logs out: ❌ FAILED: arraySimple1 and arraySimple3 are equals

    test.assertArrayEquals(arrayComplex1, arrayComplex2, "arrayComplex1 and arrayComplex2 are equals", arrayComplexIsEqual);
    // logs out: ✔ PASSED: arrayComplex1 and arrayComplex2 are equals

    test.assertArrayEquals(arrayComplex1, arrayComplex3, "arrayComplex1 and arrayComplex3 are equals", arrayComplexIsEqual);
    // logs out: ❌ FAILED: arrayComplex1 and arrayComplex3 are equals    

    test.assertIs2dArray([[1,2,3], [3,4,5]], "Array is a 2d Array");
    // logs out: ✔ PASSED: Array is a 2d Array

    const array2dSimple1 = [[1,2,3], [3,4,5]];
    const array2dSimple2 = [[1,2,3], [3,4,5]];
    const array2dSimple3 = [[1,2,3], [3,4,6]];
    const array2dComplex1 = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];
    const array2dComplex2 = [[{name: "kenobi", surname: "obiwan"}, {surname: "vador", name: "dark"}], [{surname: "tony", name: "stark"}, {surname: "nick", name: "furry"}]];

    test.assert2dArrayEquals(array2dSimple1, array2dSimple2, "array2dSimple1 and array2dSimple2 are equals");
    // logs out: ✔ PASSED: array2dSimple1 and array2dSimple2 are equals

    test.assert2dArrayEquals(array2dSimple1, array2dSimple3, "array2dSimple1 and array2dSimple3 are equals");
    // logs out: ❌ FAILED: array2dSimple1 and array2dSimple3 are equals

    test.assert2dArrayEquals(array2dComplex1, array2dComplex2, "array2dComplex1 and array2dComplex2 are equals", arrayComplexIsEqual);
    // logs out: ✔ PASSED: array2dComplex1 and array2dComplex2 are equals

    function dummyLogFunction()
    {
      Logger.log("my function is logging");
    }
    
    test.startCaptureLog();
    test.assertLogMatch("my function is logging", "Log of dummyLogFunction are the waited one")
    // logs out: ❌ FAILED: "Log of dummyLogFunction are the waited one
    test.assertLogNotMatch(["my function is logging"], "Log of dummyLogFunction are not present")
    // logs out: ✔ PASSED: Log of dummyLogFunction are not present
    dummyLogFunction()
    test.assertLogMatch("my function is logging", "Log of dummyLogFunction are the waited one")
    // logs out: ✔ PASSED: Log of dummyLogFunction are the waited one

}

/**
 * If we're running locally, execute the tests. In GAS environment, runTests() needs to be executed manually
 */
(function () {
    /**
   * @param {Boolean} - if true, were're in the GAS environment, otherwise we're running locally
   */
    const IS_GAS_ENV = typeof ScriptApp !== 'undefined';
    if (!IS_GAS_ENV) runTests();
  })();