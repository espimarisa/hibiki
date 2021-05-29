import { isMainThread } from "worker_threads";
import { WorkerThreadsMaster } from "./classes/WorkerThreads/Master";
import { WorkerThreadsWorker } from "./classes/WorkerThreads/Worker";

isMainThread ? new WorkerThreadsMaster() : new WorkerThreadsWorker();
