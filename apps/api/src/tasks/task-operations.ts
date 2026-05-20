import type { WorkerEnvironment } from "alchemy/Cloudflare/Workers";
import { makeTaskOperations, type TaskOperations as TaskOperationsService } from "@repo/operations/task";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { TaskStoreContext } from "./task-store.ts";
import { IdGenerator } from "../util/id-generator.ts";

export class TaskOperations extends Context.Service<TaskOperations, TaskOperationsService<WorkerEnvironment>>()(
	"TaskOperations",
) {}

export const TaskOperationsLive = Layer.effect(TaskOperations)(
	Effect.gen(function* () {
		const tasks = yield* TaskStoreContext;
		const ids = yield* IdGenerator;
		return makeTaskOperations(tasks, ids);
	}),
);
