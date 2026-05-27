#!/usr/bin/env node
import { initQueueFileIfNeeded, saveQueue, loadQueue } from "./story-queue.mjs";

const queue = initQueueFileIfNeeded();
saveQueue(queue);
console.log(`Story queue ready: ${queue.items.length} items (${queue.items.filter((i) => i.status === "pending").length} pending).`);
