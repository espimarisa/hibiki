/**
 * @file MemberRoleUpdate Logger
 * @description Logs when a member is given a role through the bot
 */

import { Logger } from "../classes/Logger";

export class MemberRoleUpdate extends Logger {
  events = ["memberVerify", "memberUnverify", "roleAssign", "roleUnassign"];

  async run(event: string) {
    
  }
}
