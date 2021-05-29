import { isMaster } from "cluster";
import { Master } from "./classes/data/Master";
import { Worker } from "./classes/data/Worker";

isMaster ? new Master() : new Worker();
