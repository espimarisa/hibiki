import { isMaster } from "cluster";
import { ClusterMaster } from "@Cluster/Master";
import { ClusterWorker } from "@Cluster/Worker";

isMaster ? new ClusterMaster() : new ClusterWorker();
