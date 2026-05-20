import type { WorkerEnvironment } from "alchemy/Cloudflare/Workers";
import type { TaskStore } from "@repo/operations/task";
import * as Context from "effect/Context";

export class TaskStoreContext extends Context.Service<TaskStoreContext, TaskStore<WorkerEnvironment>>()("TaskStore") {}
