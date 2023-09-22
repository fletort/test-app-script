const { GasUnitTestInfo, GasUnitTestDefaultLogger, GasUnitTestContainer, GasUnitTestManager } = require('../src/');

/**
 * require libraries if the require method exists (outside GAS Mode)
 */
// if (typeof require !== 'undefined') {
//   Logger = require('../mock/Logger.js');
//   (function() {
//     // This is used to import outside GAS Environnement.
//     // In VSCode IDE import must also be added to global.d.ts file for intellisense purpose.
//     GasUnitTestManager = require('../src/GasUnitTestManager.js');
//     GasUnitTestContainer = require('../src/GasUnitTestContainer.js');
//   }());
// }

/**
 * Unit Test of GasUnitTestDefaultLogger class
 * @param {GasUnitTestManager} testSuite 
 */
function GasUnitTestDefaultLoggerTest(testSuite) {
  underTest
  var output = [];
  function resetConsoleMock() {
    output = [];
  }
  function testConsoleMock(msg) {
    output.push(msg);
  }
  function getNewUnderTest() {
    const underTest = new GasUnitTestDefaultLogger();
    underTest.logFunction = testConsoleMock;
    resetConsoleMock();
    return underTest;
  }

  /** @type {GasUnitTestDefaultLogger();} */
  var underTest = null;
  testSuite.testSection("GasUnitTestDefaultLoggerTest", (add) => {
    add.test("Default log output is console.log", (test) => {
      const underTest = new GasUnitTestDefaultLogger();
      const result = typeof (GasUnitTestDefaultLogger._log.get(underTest)) == typeof (console.log);
      test.assert(result, "GasUnitTestDefaultLogger._log.get return console.log");
    });

    add.test("Default prefix decorator are correct", (test) => {
      test.assert(
        GasUnitTestDefaultLogger.emojiOk == "✔️ ",
        "emojiOk is ok"
      );
      test.assert(
        GasUnitTestDefaultLogger.emojiKo == "❌",
        "emojiKo is ok"
      );
      test.assert(
        GasUnitTestDefaultLogger.sectionElementPrefix == "├─",
        "sectionElementPrefix is ok"
      );
      test.assert(
        GasUnitTestDefaultLogger.sectionLastElementPrefix == "└─",
        "sectionLastElementPrefix is ok"
      );
      test.assert(
        GasUnitTestDefaultLogger.SublevelPrefixToAdd == "│ ",
        "SublevelPrefixToAdd is ok"
      );
      test.assert(
        GasUnitTestDefaultLogger.SectionIcon == "📂 ",
        "SectionIcon is ok"
      );

    });

    add.test("Log function can be modified", (test) => {
      const myTestMsg = "TEST MESSAGE";
      underTest = getNewUnderTest();

      test.assert(
        typeof (GasUnitTestDefaultLogger._log.get(underTest)) == typeof (testConsoleMock),
        "GasUnitTestDefaultLogger._log.get return testConsoleMock");
      underTest.log(myTestMsg);
      test.assert(
        output == myTestMsg,
        "GasUnitTestDefaultLogger.log use the given logger method"
      );
    });

    add.test("Log starting global test execution", (test) => {
      const waitedMsg = `Test Start`;
      resetConsoleMock();

      underTest.OnStartAllTest();

      test.assert(output[0] === `Test Start`, `OnStartAllTest() logs $'{waitedMsg}`);
    });

    add.parameterizedTest({
      displayName: "Log finishing global test execution",
      valuesSourceCustomName: [
        {
          displayName: "Multiple tests and failures and assertions", args: {
            nbTestOk: 5, nbTestKo: 2, nbAssertOk: 162, nbAssertKo: 12,
            waitedMsg: `${GasUnitTestDefaultLogger.emojiKo} End TestSuite - 7 tests, 2 failures (174 assertions made)`
          }
        },
        {
          displayName: "Multiple tests,assertions and one failure", args: {
            nbTestOk: 5, nbTestKo: 1, nbAssertOk: 162, nbAssertKo: 12,
            waitedMsg: `${GasUnitTestDefaultLogger.emojiKo} End TestSuite - 6 tests, 1 failure (174 assertions made)`
          }
        },
        {
          displayName: "Multiple tests, one assertions, no failure", args: {
            nbTestOk: 5, nbTestKo: 0, nbAssertOk: 1, nbAssertKo: 0,
            waitedMsg: `${GasUnitTestDefaultLogger.emojiOk} End TestSuite - 5 tests, 0 failure (1 assertion made)`
          }
        },
        {
          displayName: "One test, no assertion, no failure", args: {
            nbTestOk: 1, nbTestKo: 0, nbAssertOk: 0, nbAssertKo: 0,
            waitedMsg: `${GasUnitTestDefaultLogger.emojiOk} End TestSuite - 1 tests, 0 failure (0 assertion made)`
          }
        },
      ]
    },
      (test, { nbTestOk, nbTestKo, nbAssertOk, nbAssertKo, waitedMsg}) => {
        const testMockName = `My Test`;
        const testMock = new GasUnitTestInfo(testMockName);
        testMock.nbTestOk = nbTestOk;
        testMock.nbTestKo = nbTestKo;
        testMock.nbAssertOk = nbAssertOk;
        testMock.nbAssertKo = nbAssertKo;
        resetConsoleMock();

        underTest.OnAllTestEnd(testMock);
        test.assert(output[0] === waitedMsg, `OnAllTestEnd() logs ${waitedMsg}`);
      }
    );

    add.test("Log starting section test execution", (test) => {
      const sectionMockName = `My Section`;
      const sectionMock = new GasUnitTestContainer(sectionMockName);
      const waitedMsg = `📂 ${sectionMockName}`;
      resetConsoleMock();

      underTest.OnStartTestSection(sectionMock);

      test.assert(output[0] === waitedMsg, `OnStartTestSection() logs $'{waitedMsg}`);
    });

    add.test("Log starting test execution", (test) => {
      const testMockName = `My Test`;
      const testMock = new GasUnitTestInfo(testMockName);
      const waitedMsg = ``;
      resetConsoleMock();

      underTest.OnStartTest(testMock);

      test.assert(output.length === 0, `OnStartTest() does not log`);
    });

    add.test("Log ok test execution", (test) => {
      const testMockName = `My OK Test`;
      const testMock = new GasUnitTestInfo(testMockName);
      const waitedMsg = `├─✔️  PASSED: ${testMockName}`;
      resetConsoleMock();
      underTest.OnEndTest(testMock);
      test.assert(output[0] === waitedMsg, `OnEndTest() logs ${waitedMsg}`);
    });

    add.test("Log ko test execution", (test) => {
      const testMockName = `My KO Test`;
      const testMock = new GasUnitTestInfo(testMockName);
      testMock.nbTestKo = 1;
      const waitedMsg = `├─❌ FAILED: ${testMockName}`;
      resetConsoleMock();
      underTest.OnEndTest(testMock);
      test.assert(output[0] === waitedMsg, `OnEndTest() logs ${waitedMsg}`);
    });

    add.test("Log assert/step ok", (test) => {
      const testMockName = `My OK Test`;
      const testMock = new GasUnitTestInfo(testMockName);
      const stepMsg = "My Assert OK";
      resetConsoleMock();
      underTest.OnAssertResult(testMock, true, stepMsg);
      test.assert(output.length === 0, `OnAssertResult() ok does not log`);

      const waitedEndTestMsg = `├─✔️  PASSED: ${testMockName}`;
      underTest.OnEndTest(testMock);
      test.assert(output[0] === waitedEndTestMsg, `OnEndTest() logs ${waitedEndTestMsg}`);
    });

    add.test("Log assert/step ko", (test) => {
      const testMockName = `My OK Test`;
      const testMock = new GasUnitTestInfo(testMockName);
      const stepMsg = "My Assert KO";
      resetConsoleMock();
      underTest.OnAssertResult(testMock, false, stepMsg);
      test.assert(output.length === 0, `OnAssertResult() ko does not log`);

      const waitedEndTestMsg = [`├─✔️  PASSED: ${testMockName}`, `│ ├─❌ FAILED: ${stepMsg}`];
      underTest.OnEndTest(testMock);
      test.assertArrayEquals(output, waitedEndTestMsg, "OnEndTest() logs the assert ko description");
    });



  });

}


if (typeof module !== "undefined") {
  module.exports = { GasUnitTestDefaultLoggerTest };
} 
