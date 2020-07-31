/**
 * @fileoverview Docker checker
 * @description Looks to see if the bot is running in docker
 * @module docker
 */

const { statSync, readFileSync } = require("fs");
let docker;

module.exports = {
  isDocker() {
    function hasDockerEnv() {
      try {
        statSync("/.dockerenv");
        return true;
      } catch (err) {
        return false;
      }
    }

    function hasDockerCGroup() {
      try {
        return readFileSync("/proc/self/cgroup", "utf8").includes("docker");
      } catch (err) {
        return false;
      }
    }

    if (docker === undefined) {
      docker = hasDockerEnv() || hasDockerCGroup();
      return docker;
    }
  },
};

module.exports = docker;
