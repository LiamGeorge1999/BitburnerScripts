/** @param {NS} ns **/
import {NS} from ".@ns"
export async function main(ns: NS) {
   var manager = new ScriptManager(ns);
   ns.print(ns.read("Interfaces/scripts.txt").length);
   ns.disableLog("ALL");
   ns.enableLog("print");
   //ns.tail();
   const fileContents: string = ns.read("Interfaces/scripts.txt");
   ns.tprint(fileContents);
   const scripts = JSON.parse(`{
      "manageGang": "managers/manageGang.js",
      "manageCorp": "managers/manageCorp.js",
      "HUDMod": "Interfaces/HUDMod.js"
  }`);
   const display: string = manager.getDisplay(scripts);
   //ns.print(display);
   ns.alert(display);
 }

export class ScriptManager {
   ns: NS;
   constructor(_ns: NS) {
      this.ns = _ns;
      }

   getDisplay(scripts: {scriptPath: string}[]): string {
      let display = "<div></button text='quit' method='quit()'></div>";

      return display;
 }
   quit() {
      this.ns.exit();
 }
 }