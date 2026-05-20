import type { WorkerEnvironment } from "alchemy/Cloudflare/Workers";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "./domain/task.ts";
import { IdGenerator } from "./services/id-generator.ts";
import { TaskRepository } from "./services/task-repository.ts";
import { Task as TaskModel } from "./domain/task.ts";

export interface CreateTaskInput {
	readonly title: string;
}

export class TaskOperations extends Context.Service<
	TaskOperations,
	{
		readonly list: Effect.Effect<Array<Task>, TaskStorageFailed | TaskDecodeFailed, WorkerEnvironment>;
		readonly get: (
			input: { readonly id: string },
		) => Effect.Effect<Task, TaskNotFound | TaskStorageFailed | TaskDecodeFailed, WorkerEnvironment>;
		readonly create: (input: CreateTaskInput) => Effect.Effect<Task, TaskStorageFailed, WorkerEnvironment>;
	}
>()("TaskOperations") {}

export const makeTaskOperations = (
	tasks: TaskRepository["Service"],
	ids: IdGenerator["Service"],
): TaskOperations["Service"] => ({
	list: tasks.list,
	get: tasks.get,
	create: ({ title }) =>
		ids.nextUuid.pipe(
			Effect.map(
				(id) =>
					new TaskModel({
						id,
						title,
						completed: false,
					}),
			),
			Effect.flatMap(tasks.save),
		),
});

export const TaskOperationsLive = Layer.effect(TaskOperations)(
	Effect.gen(function* () {
		const tasks = yield* TaskRepository;
		const ids = yield* IdGenerator;
		return makeTaskOperations(tasks, ids);
	}),
);
