import logger from "$shared/logger.ts";
import { ClusterManager, HeartbeatManager, ReClusterManager } from "discord-hybrid-sharding";
type Auto = number | "auto";

export class HibikiClusterManager {
  readonly clusterManager: ClusterManager;
  private readonly _mainFile: string;
  private readonly _token: string;
  private readonly _shardCount: Auto;

  constructor(file: string, token: string, shardCount: Auto = "auto") {
    this._mainFile = file;
    this._token = token;
    this._shardCount = shardCount;

    this.clusterManager = new ClusterManager(this._mainFile, {
      token: this._token,
      totalShards: this._shardCount,
      mode: "process",
      execArgv: process.execArgv,
      respawn: false,
      spawnOptions: {
        timeout: 30_000,
      },
    });

    this.clusterManager.on("clusterCreate", (individualCluster) => {
      logger.info(`Cluster ${individualCluster.id} was created`);

      individualCluster.on("message", (msg) => {
        logger.info(`Cluster ${individualCluster.id} sent a message: ${Bun.inspect(msg)}`);
      });

      individualCluster.on("death", (cluster) => {
        logger.error(`Cluster ${cluster.id} died`);
      });

      individualCluster.on("error", (error) => {
        logger.error(`Cluster ${individualCluster.id} ran into an error:`, Bun.inspect(error));
      });
    });
  }

  public spawn() {
    // Spawns a new heartbeat manager
    const heartbeatManager = new HeartbeatManager({
      interval: 5000,
      maxMissedHeartbeats: 10,
    });

    // Spawns a new reclustering manager
    const reClusterManager = new ReClusterManager({
      restartMode: "rolling",
    });

    // Extends the cluster manager
    this.clusterManager.extend(heartbeatManager, reClusterManager);

    this.clusterManager
      .spawn({
        amount: this._shardCount,
        timeout: -1,
      })
      .catch((error) => {
        throw new Error(Bun.inspect(error));
      });
  }
}
