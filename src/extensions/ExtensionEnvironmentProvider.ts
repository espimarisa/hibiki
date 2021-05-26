/**
 * @file Extension environment provider
 * @description Represents the manager handling everything related to Extensions
 * @author lambdagg <lambda@jikt.im>
 */

import type { HibikiClient } from "../classes/Client";

import { HibikiExtensionEnvironment } from "./ExtensionEnvironment";

export class HibikiExtensionEnvironmentProvider {
  readonly client: HibikiClient;
  private readonly _environments = new Map<string, HibikiExtensionEnvironment>();

  constructor(client: HibikiClient) {
    this.client = client;
  }

  createEnvironment(id: string, errorChannel?: string) {
    if (this.hasEnvironment(id)) this.disposeEnvironment(id);
    return this._environments.set(id, new HibikiExtensionEnvironment(id, errorChannel, this.client)).get(id);
  }

  getEnvironment(id: string) {
    return this.hasEnvironment(id) ? this._environments.get(id) : undefined;
  }

  hasEnvironment(id: string) {
    return this._environments.has(id);
  }

  disposeEnvironment(id: string) {
    if (!this.hasEnvironment(id)) return;
    return this._environments.delete(this.getEnvironment(id).disposeVm().id);
  }
}
