//const { GasUnitTestContainer } = require("./GasUnitTestContainer"); Comme quoi c pas top de detecter le last element ici (pb depence cycliq,e ou virer le dafault logger du Notification Manager)
const { GasUnitTestInfo } = require("./GasUnitTestInfo");
const { IGasUnitTestNotification } = require("./IGasUnitTestNotification");

/**
 * Default Test Logger.
 * 
 * Simple Console Logger instanced by default on TestSuite.
 * 
 * @implements IGasUnitTestNotification
 */
class GasUnitTestDefaultLogger extends IGasUnitTestNotification {
    
    /**
     * Init a new GasUnitTestDefaultLogger instance.
     */
    constructor() {
      super();
      GasUnitTestDefaultLogger._log.set(this, console.log);
      /** @type {Array.<GasUnitTestContainer>} */
      this.currentSections = [];
      this.currentTest = null;
      /** @type {Array.<String>} */
      this.currentPrefixList = [];
      this.currentTestAssertResults = [];
      this.logAssertOk = false;
    }
  
    /**
     * Log callback type.
     * @callback GasUnitTestDefaultLogger~Log
     * @param {string} msg - Message to Print.
     */  
  
    /**
     * Set specific Log Method.
     * 
     * All printed test result are send to this method.
     * By default {@link https://developer.mozilla.org/en-US/docs/Web/API/console/log console.log} is used.
     * This redefinition is useful to modify the output target.
     * @type {GasUnitTestDefaultLogger~Log}
     * @see log
     */
    set logFunction(func) {
      GasUnitTestDefaultLogger._log.set(this, func);
    }

    log(msg) {
      let fct = GasUnitTestDefaultLogger._log.get(this);
      fct(msg);
    }
    
    OnStartAllTest() {
      this.log(`Test Start`);
    }

    /**
     * @param {GasUnitTestInfo} info 
     */
    OnAllTestEnd(info) {
      let prefix = info.isOk() ? GasUnitTestDefaultLogger.emojiOk : GasUnitTestDefaultLogger.emojiKo;
      this.log(`${prefix} End TestSuite - ${info.NbTests} tests, ${info.nbTestKo} failures`);
    }
    
    OnStartTestSection(section) {
      this._adaptPrefixForLastSectionElement(section);
      this.log(`${this.currentPrefixList.join("")}${GasUnitTestDefaultLogger.SectionIcon}${section.name}`);
      this.currentSections.push(section);

      if (section.level ===0) {
        this.currentPrefixList.push(GasUnitTestDefaultLogger.sectionElementPrefix);
      } else {
        this.currentPrefixList.unshift(GasUnitTestDefaultLogger.SublevelPrefixToAdd);
      }
    }

    _adaptPrefixForLastSectionElement(element) {
      let currentSection = this.currentSections[this.currentSections.length -1];
      if (currentSection) {
        if (element == currentSection.elements[currentSection.elements.length - 1]) {
          this.currentPrefixList.pop();
          this.currentPrefixList.push(GasUnitTestDefaultLogger.sectionLastElementPrefix)
        }
      }
    }

    OnEndTestSection(section) {
      let removeSection = this.currentSections.pop();
      if (removeSection != section) {
        throw new Error("Given section is not correct");
        // TODO: Add testUnit
      }
      if (section.level ===0) {
        this.currentPrefixList = [];
        this.log(``);
      } else {
        this.currentPrefixList.shift(); // remove the "tab"
        this.currentPrefixList.pop(); // Replace "last element prefix" with "normal" element prefix
        this.currentPrefixList.push(GasUnitTestDefaultLogger.sectionElementPrefix);
      }
      
    }
  
    OnStartTest(test) {
      this.currentTest = test;
      this.currentTestAssertResults = [];
    }
  
    OnAssertResult(test, status, message) {
      this.currentTestAssertResults.push(
        {
          test: test,
          status: status,
          message: message
        }
      );
    }

    _printAssertResult() {
      this.currentTestAssertResults.forEach(assertResult => {
        if (assertResult.status == false) {
          this.log(`${this.currentPrefixList.join('')}${GasUnitTestDefaultLogger.emojiKo} FAILED: ${assertResult.message}`);
        } else if (this.logAssertOk == true) {
          this.log(`${this.currentPrefixList.join('')}${GasUnitTestDefaultLogger.emojiOk} PASSED: ${assertResult.message}`);
        }
      });
    }

  
    OnEndTest(test) {
      //this.log(`End ${test.testName} - ${test.totalOk + test.totalKo} tests, ${test.totalKo} failures`);
      //this.log('******************************************')

      // TODO: Need to know that we are the last test, to change prefix
      this._adaptPrefixForLastSectionElement(test);
      if (test.nbTestKo == 0) {
        this.log(`${this.currentPrefixList.join('')}${GasUnitTestDefaultLogger.emojiOk} PASSED: ${test.name}`);
      } else {
        this.log(`${this.currentPrefixList.join('')}${GasUnitTestDefaultLogger.emojiKo} FAILED: ${test.name}`);
      }
      this.currentPrefixList.unshift(GasUnitTestDefaultLogger.SublevelPrefixToAdd);
      this._printAssertResult();
      this.currentPrefixList.shift();
    }
  }
  GasUnitTestDefaultLogger._log = new WeakMap();
  GasUnitTestDefaultLogger.emojiOk = "✔️ ";
  GasUnitTestDefaultLogger.emojiKo = "❌";
  GasUnitTestDefaultLogger.sectionElementPrefix = "├─";
  GasUnitTestDefaultLogger.sectionLastElementPrefix = "└─";
  GasUnitTestDefaultLogger.SublevelPrefixToAdd = "│ ";
  GasUnitTestDefaultLogger.SectionIcon = "📂 ";

  if (typeof module !== "undefined") {
    module.exports = {GasUnitTestDefaultLogger};
  } 