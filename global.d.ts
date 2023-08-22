// This file help vscode intellisense (that does not manage correctly global var (located in my IIFE doing the dynamic require).)
// thanks to: https://stackoverflow.com/a/67927104

import { GasUnitTestingFrameworkExport } from '../src/GasUnitTestingFramework.js';
import Logger from '../mock/Logger.js';

declare global {
    var GasUnitTestingFramework: GasUnitTestingFrameworkExport.GasUnitTestingFramework;
    var RunningContext: GasUnitTestingFrameworkExport.RunningContext;
    var Logger: Logger
}