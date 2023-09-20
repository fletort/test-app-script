const { GasUnitTest, GasUnitTestContainer } = require("../src");

class GasUnitTestLoggerMock {
  constructor() {
    this.resetMock();
  }
  resetMock() {
    this.logCalledParameters = [];
    this.onStartAllTestParameters = [];
    this.onStartTestParameters = [];
    this.onStartTestSectionCalledParameters = [];
    this.onEndTestSectionCalledParameters = [];
    this.onAssertResultParameters = [];
    this.onEndTestParameters = [];
  }

  log(msg) {
    this.logCalledParameters.push({ "msg": msg });
  }

  OnStartAllTest() {
    this.onStartAllTestParameters.push({});
  }

  OnStartTestSection(section) {
    this.onStartTestSectionCalledParameters.push({ "section": section });
  }

  OnEndTestSection(section) {
    this.onEndTestSectionCalledParameters.push({ "section": section });
  }

  OnStartTest(test) {
    this.onStartTestParameters.push({"test": test});
  }

  OnAssertResult(test, status, message) {
    this.onAssertResultParameters.push({ "test": test, "status": status, "message": message });
  }

  OnEndTest(test) {
    this.onEndTestParameters.push({"test": test});
  }
}

class GasUnitTest_HandlerMock {
  constructor() {
    this.resetMock();
  }
  resetMock() {
    this.givenObject = null;
    this.args = null;
  }
  handlerMock(givenObject, ...args) {
    this.givenObject = givenObject;
    this.args = args;
  }

}

class GasUnitTestMock extends GasUnitTest {
  constructor(testName, handler) {
    super(testName, handler)
    this.resetMock();
  }

  resetMock() {
    this.executeIsCalled = false;
  }

  execute() {
    this.executeIsCalled = true;
  }
}

class GasUnitTestContainerMock extends GasUnitTestContainer {
  constructor(testName, handler) {
    super(testName, handler)
    this.resetMock();
  }

  resetMock() {
    this.executeIsCalled = false;
  }

  execute() {
    this.executeIsCalled = true;
  }  
}

if (typeof module !== "undefined") {
  module.exports = { GasUnitTestLoggerMock, GasUnitTest_HandlerMock, GasUnitTestMock, GasUnitTestContainerMock };
} 