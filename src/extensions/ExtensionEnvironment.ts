/**
 * @file Extension environment
 * @description Represents an isolated environment where multiple Extension.ts instances can run. Usually represented
 *              using a guild ID
 * @see Extension.ts
 * @author lambdagg <lambda@jikt.im>
 */

import type { HibikiClient } from "../classes/Client";
import { HibikiExtension } from "./Extension";

import { logger } from "../utils/logger";

import ivm from "isolated-vm";

export class HibikiExtensionEnvironment {
  readonly client: HibikiClient;
  readonly id: string;
  readonly errorChannel?: string;

  vm?: ivm.Isolate;
  vmSyncContext?: ivm.Context;
  vmGlobalContext?: ivm.Reference<Record<string | number | symbol, any>>;

  extensions: HibikiExtension[] = [];

  constructor(id: string, errorChannel: string | undefined, client: HibikiClient) {
    this.id = id;
    this.errorChannel = errorChannel || undefined;
    this.client = client;
    this.reloadVm();
  }

  reloadVm() {
    this.disposeVm();
    this.vm = new ivm.Isolate({ memoryLimit: this.client.config.extensions.maxAllocatedSizePerGuild });
    this.vmSyncContext = this.vm.createContextSync();
    this.vmGlobalContext = this.vmSyncContext.global;
    this.vmGlobalContext.setSync("global", this.vmGlobalContext.derefInto());

    const id = this.id;
    this.vmSyncContext.evalClosureSync(
      `globalThis.log = (...args) =>
        $0.applyIgnored(undefined, args, { arguments: { copy: true } });`,
      [(...args: string[]) => logger.info(`${id}| ${args.join(" ")}`)],
      { arguments: { reference: true } },
    );

    this.vmGlobalContext.setSync("on", (event: ExtensionEvent, callback: (...args: string[]) => any) => {
      switch (event) {
        case "command": {
          callback();
          break;
        }
        default:
          break;
      }
    });
    return this;
  }

  disposeVm() {
    try {
      this.vmSyncContext?.release();
      this.vmGlobalContext?.release();
      this.vm?.dispose();
      this.unsafeDisposeVm();
    } finally {
      this.unsafeDisposeVm();
    }
    return this;
  }

  unsafeDisposeVm() {
    this.vmSyncContext = undefined;
    this.vmGlobalContext = undefined;
    this.vm = undefined;
    return this;
  }

  registerNewExtension() {
    const ext = new HibikiExtension(this);
    this.extensions.push(ext);
    return ext;
  }

  runNewTestExtension() {
    this.registerNewExtension().runTest();
  }

  runNewMemoryStressExtension() {
    this.registerNewExtension().runMemoryStress();
  }
}
