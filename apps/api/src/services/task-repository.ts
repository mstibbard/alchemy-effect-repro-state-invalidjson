import type { WorkerEnvironment } from "alchemy/Cloudflare/Workers";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";

import type { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "../domain/task.ts";

export class TaskRepository extends Context.Service<
	TaskRepository,
	{
		readonly list: Effect.Effect<Array<Task>, TaskStorageFailed | TaskDecodeFailed, WorkerEnvironment>;
		readonly get: (
			input: { readonly id: string },
		) => Effect.Effect<Task, TaskNotFound | TaskStorageFailed | TaskDecodeFailed, WorkerEnvironment>;
		readonly save: (task: Task) => Effect.Effect<Task, TaskStorageFailed, WorkerEnvironment>;
	}
>()("TaskRepository") {}
