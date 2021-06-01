import { isMainThread } from "worker_threads";
import { WorkerThreadsMaster } from "@WorkerThreads/Master";
import { WorkerThreadsWorker } from "@WorkerThreads/Worker";

isMainThread ? new WorkerThreadsMaster() : new WorkerThreadsWorker();
