const { GasUnitTestManager, GasUnitTestNotificationManager } = require("../src");
const { GasUnitTestLoggerMock } = require("./GasUnitTestMock");

/**
 * Unit Test of GasUnitTestNotificationManager class
 * @param {GasUnitTestManager} testSuite 
 */
function GasUnitTestNotificationManagerTest(testSuite) {

  const loggerMock1 = new GasUnitTestLoggerMock();
  const loggerMock2 = new GasUnitTestLoggerMock();
  const myClients = [loggerMock1, loggerMock2];
  function prepareToAll() {
    const underTest = new GasUnitTestNotificationManager();
    underTest.clients = myClients;
    myClients.forEach(loggerMock => loggerMock.resetMock());
    return underTest;
  }

  testSuite.testSection("GasUnitTestNotificationManagerTest", (add) => {
    add.test("constructor() - Initialized values are correct", (test) => {
      const underTest = new GasUnitTestNotificationManager();
      test.assert(
        underTest.clients.length === 1,
        "One Loger is initialized by default"
      );
      test.assert(
        underTest.clients[0].constructor.name === "GasUnitTestDefaultLogger",
        "Default Logger is GasUnitTestDefaultLogger"
      );
    });

    add.test("addClient() - Add a client to internal list if not already added", (test) => {
      const underTest = new GasUnitTestNotificationManager();
      underTest.addClient(loggerMock1);
      test.assert(underTest.clients.length === 2, "Client is added");
      test.assert(
        underTest.clients[1].constructor.name === "GasUnitTestLoggerMock",
        "Logger added is the correct one"
      );

      test.assertThrowErr(
        () => underTest.addClient(loggerMock1), "This client already exists",
        "A client can not be added twice"
      );
    });

    add.test("removeClient() - Remove a client", (test) => {
      const underTest = new GasUnitTestNotificationManager();
      underTest.addClient(loggerMock1);
      test.assert(underTest.clients.length === 2, "Client is added");
      underTest.removeClient(loggerMock1);
      test.assert(underTest.clients.length === 1, "Client is removed");
      underTest.removeClient(loggerMock1);
      test.assert(underTest.clients.length === 1, "No error when removing an unknow client");
    });

    add.test("log() - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const myTestMessage = "MY TEST LOG";

      underTest.log(myTestMessage);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.logCalledParameters.length === 1,
          `Log is received on client ${index}`);
        test.assert(
          loggerMock.logCalledParameters[0].msg === myTestMessage,
          `Log on client ${index} is correct`);
      });
    });

    add.test("OnStartAllTest - is send to all clients", (test) => {
      const underTest = prepareToAll();

      underTest.OnStartAllTest();

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onStartAllTestParameters.length === 1,
          `OnStartAllTest event is received on client ${index}`);
      });
    });

    add.test("OnAllTestEnd - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const infoMock = new Object();

      underTest.OnAllTestEnd(infoMock);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onAllTestEndParameters.length === 1,
          `OnAllTestEnd event is received on client ${index}`);
      });
    });

    add.test("OnStartTestSection - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const section = new Object();

      underTest.OnStartTestSection(section);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onStartTestSectionCalledParameters.length === 1,
          `OnStartTestSection event is received on client ${index}`);
        test.assert(
          loggerMock.onStartTestSectionCalledParameters[0].section === section,
          `Received section on client ${index} is correct`);
      });
    });

    add.test("OnStartTest - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const testMock = new Object();

      underTest.OnStartTest(testMock);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onStartTestParameters.length === 1,
          `OnStartTest event is received on client ${index}`);
        test.assert(
          loggerMock.onStartTestParameters[0].test === testMock,
          `Received test on client ${index} is correct`);
      });
    });

    add.test("OnEndTest - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const testMock = new Object();

      underTest.OnEndTest(testMock);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onEndTestParameters.length === 1,
          `OnEndTest event is received on client ${index}`);
        test.assert(
          loggerMock.onEndTestParameters[0].test === testMock,
          `Received test on client ${index} is correct`);
      });
    });

    add.test("OnAssertResult - is send to all clients", (test) => {
      const underTest = prepareToAll();
      const testMock = new Object();
      const myStatus = false;
      const myMsg = "Message"

      underTest.OnAssertResult(testMock, myStatus, myMsg);

      myClients.forEach((loggerMock, index) => {
        test.assert(
          loggerMock.onAssertResultParameters.length === 1,
          `OnAssertResult event is received on client ${index}`);
        test.assert(
          loggerMock.onAssertResultParameters[0].test === testMock,
          `Received test on client ${index} is correct`);
        test.assert(
          loggerMock.onAssertResultParameters[0].status === myStatus,
          `Received status on client ${index} is correct`);
        test.assert(
          loggerMock.onAssertResultParameters[0].message === myMsg,
          `Received message on client ${index} is correct`);
      });
    });

  });
}

if (typeof module !== "undefined") {
  module.exports = { GasUnitTestNotificationManagerTest };
} 