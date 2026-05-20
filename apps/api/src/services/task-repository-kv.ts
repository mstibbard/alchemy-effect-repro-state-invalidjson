import type { KVNamespaceClient } from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { CreateTaskFailed, ListTasksFailed, Task, TaskNotFound } from "../domain/task.ts";
import { IdGenerator, makeCryptoIdGenerator } from "./id-generator.ts";
import { TaskRepository } from "./task-repository.ts";

export const makeKvTaskRepository = (
	tasks: KVNamespaceClient<string>,
	ids: IdGenerator["Service"] = makeCryptoIdGenerator(),
): TaskRepository["Service"] => ({
	list: tasks
		.list()
		.pipe(
			Effect.mapError((cause) => new ListTasksFailed({ message: cause.message })),
			Effect.flatMap((listed) => {
				const keys: Array<string> = listed.keys.map((key: { name: string }) => key.name);

				if (keys.length === 0) {
					return Effect.succeed([]);
				}

				return tasks
					.get<Task>(keys, "json")
					.pipe(
						Effect.mapError((cause) => new ListTasksFailed({ message: cause.message })),
						Effect.map((values) =>
							Array.from(values.values(), (task) => (task ? new Task(task) : undefined)).filter(
								(task): task is Task => task !== undefined,
							),
						),
					);
			}),
		),
	get: ({ id }) =>
		tasks.get<Task>(id, "json").pipe(
			Effect.mapError(() => new TaskNotFound({ id })),
			Effect.flatMap((task) => (task ? Effect.succeed(new Task(task)) : Effect.fail(new TaskNotFound({ id })))),
		),
	create: ({ title }) => {
		return Effect.gen(function* () {
			const task = new Task({
				id: yield* ids.nextUuid,
				title,
				completed: false,
			});

			yield* tasks
				.put(task.id, JSON.stringify(task))
				.pipe(Effect.mapError((cause) => new CreateTaskFailed({ message: cause.message })));
			return task;
		});
	},
});

export const makeKvTaskRepositoryLive = (tasks: KVNamespaceClient<string>) =>
	Layer.effect(TaskRepository)(IdGenerator.useSync((ids) => makeKvTaskRepository(tasks, ids)));
