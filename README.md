# GasUnitTestingFramework: Google Apps Script Unit Testing Framework

[![Coverage Status](https://fletort.github.io/test-app-script/coverage/badges.svg)](https://fletort.github.io/test-app-script/coverage/)

## Introduction

GasUnitTestingFramework is a unitary test Framework dedicated to Google Apps Script (GAS)

It can run online in the Google Apps Script environnement (IDE) as well as offline on your computer from your IDE.

Is is inspired from some of the Test Unit Framework in the place from Junit to [UnitTestingApp](https://github.com/WildH0g/UnitTestingApp) 
project more dedicated to Google Apps Script world. Other interesting GAS Unit framework are listed 
[here](https://github.com/contributorpw/google-apps-script-awesome-list#testing).

## How to Install

You can install it by:
 - importing it as a GAS library ([this is not the best way for performance, must be avoid in UI project](https://developers.google.com/apps-script/guides/support/best-practices#avoid_libraries_in_ui-heavy_scripts), but as it is a test Library, performance issue should not be seen in the real application)
 - importing it as a git submodule inside your GAS git project (the best way to keep update easy, and to choose which files will be sent to your appscript project)
 - copying src directory to your project

## Tutorial

Full API documentation (with example) can be found on this website https://fletort.github.io/test-app-script/

The Framework itself is tested by itself, so Unitary Test of this project are interesting to look.

### Simple Unit Test Mode

A simple unit test mode is available, to have a similar simple contexte as [UnitTestingApp](https://github.com/WildH0g/UnitTestingApp).
It can be used when you have only one "thing" to test.

....

### Test Suite Management

This framework give the possibility to have a testSuite composed of multiple UnitTest Section.

#### Test Suite Main

Usually, you define the test suite in a main file of your tests (for exemple ut/index.js).

```js
function runTestSuite() {
  const manager = new GasUnitTestManager();
  MyClass1Test(manager);
  MyClass2Test(manager);
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
```
[See exemple](ut/index.js)

#### Test Section Exemple

Then you will have one file by Test Section (Class). (Usually each Test Section is targeting a class located in a dedicated source file).
It is like in JUnit world where you have one TestClass by tested class.

Each test section file is usually adding one testSection to the test suite.

Here the template of such a Test Case file :

```js
/**
 * Unit Test of MyClass1 class
 * @param {GasUnitTestManager} testSuite 
 */
function MyClass1Test(testSuite) {
  // Here you can put some global tools/ define for your test code

  // Then you define the testSection 
  testSuite.testSection("MyClass1Test", (add) => {
    // Here you define the content of your UnitTest.
    // you can add tested, parameterizedTest or nested section
    // see GasUnitTestContainer test documentation to get more
    // info on what can be defined
  });
}
```

For exemple [ut/GasUnitTestDefaultLoggerTest.js](ut/GasUnitTestDefaultLoggerTest.js) file is testing the GasUnitTestDefaultLogger class implemented in the [src/GasUnitTestDefaultLogger.js](src/GasUnitTestDefaultLogger.js) file.
It is defining the section named _GasUnitTestDefaultLoggerTest_.

#### Test Section Content

Then test section contains multiple Test Case.
The simplest way to define a such test case is to add a simple test to the section as below :
```js

testSuite.testSection("MyClass1Test", (add) => {

  add.test("myFunction() simple test", (test) => {
    const underTest = new MyClass1();
    const waitedResult = bool;

    let ret = underTest.myFunction();

    test.assert(ret === waitedResult, "myFunction() is ok");
    // other assertions can be done inside this test case
  });

});

```

You can also define a new child section to group TestCase together.
This is done with the nested method of the section class :

```js

testSuite.testSection("MyClass1Test", (add) => {

  add.nested("myFunction() tests", (add) => {
    // Here new test can be added insied the nested section
    // in the same way as in the parent section
    add.test("myFunction() simple test", (test) => {
      // Test Case content
    });
  });
});
```

You can also define multiple test with only one implementation with the help of parameterizedTest. [As in JUnit world](https://www.baeldung.com/parameterized-tests-junit-5), this feature enables us to execute a single test method multiple times with different parameters.

### Test Tool (assertion)

Some assertions tools are available when you are inside a TestCase Contexte.
All these assertions are documented in the API documentation of the GasUnitTest class.







