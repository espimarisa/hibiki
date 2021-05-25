/**
 * @file Extension
 * @description Represents a single Extension
 * @author lambdagg <lambda@jikt.im>
 */

import type { HibikiExtensionEnvironment } from "./ExtensionEnvironment";

import { createEmbed } from "../utils/embed";

export class HibikiExtension {
  readonly environment: HibikiExtensionEnvironment;

  constructor(environment: HibikiExtensionEnvironment) {
    this.environment = environment;
  }

  async run(code: string) {
    await this.environment.vm
      .compileScriptSync(`"use strict";\n${code.replace(/console\.log/g, "log")}`)
      .run(this.environment.vmSyncContext)
      .catch((err) => {
        if (!this.environment.errorChannel || !this.environment.client.getChannel(this.environment.errorChannel))
          this.environment.client.log.error(err.stack || err);
        else createEmbed.call(this.environment.client.getChannel(this.environment.errorChannel), err.stack || err, "error");
        this.environment.disposeVm();
      });
    return this;
  }

  runTest() {
    return this.run(`log("Hello world!");`);
  }

  runMemoryStress() {
    return this.run(`
      const storage = [];
      const twoMegabytes = 1024 * 1024 * 2;
      for (;;) {
        const array = new Uint8Array(twoMegabytes);
        for (let ii = 0; ii < twoMegabytes; ii += 4096) {
          array[ii] = 1;
        }
        storage.push(array);
        log(\`\${storage.length * 2}MB wasted on stress test!\`);
      }
    `);
  }

  /* runExtension(code: string, memoryLimit = 128) {
    const isolate = new ivm.Isolate({ memoryLimit });
    const context = isolate.createContextSync();
    const jail = context.global;

    jail.setSync("global", jail.derefInto());

    jail.setSync("log", function (...args: any[]) {
      console.log(...args);
    });

    jail.setSync("on", (event: ExtensionEvent, callback: () => any) => {
      switch (event) {
        case "command": {
          context.evalSync(callback.toString());
          break;
        }
        default:
          break;
      }
    });

    jail.setSync("sendMessage", (channelId: string, content: Eris.MessageContent) => {
      this.client.createMessage(channelId, content);
    });

    const hostile = isolate.compileScriptSync(
      `
        ${fs.readFileSync("./hibiki-ext/extension-module.js", { encoding: "utf8" })}
        ${code}
      `
        .split("console.log")
        .join("log"),
    );

    hostile.run(context).catch((err) => {
      console.error(err);
      // Get outta the memory!
      isolate.dispose();
    });
  }*/
}
