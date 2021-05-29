import { isMaster } from "cluster";
import { ClusterMaster } from "./classes/Cluster/Master";
import { ClusterWorker } from "./classes/Cluster/Worker";

isMaster ? new ClusterMaster() : new ClusterWorker();
