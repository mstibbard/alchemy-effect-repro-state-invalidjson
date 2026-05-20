import type { KVNamespaceClient } from "alchemy/Cloudflare";
import { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "@repo/domain/task";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

import { TaskStoreContext } from "./task-store.ts";

const storageFailed = (cause: { readonly message: string }) => new TaskStorageFailed({ message: cause.message });

const decodeTask = (input: unknown): Effect.Effect<Task, TaskDecodeFailed> =>
	Schema.decodeUnknownEffect(Task)(input).pipe(
		Effect.mapError((error) => new TaskDecodeFailed({ message: String(error) })),
	);

export const makeKvTaskStore = (tasks: KVNamespaceClient<string>): TaskStoreContext["Service"] => ({
	list: tasks
		.list()
		.pipe(
			Effect.mapError(storageFailed),
			Effect.flatMap((listed) => {
				const keys: Array<string> = listed.keys.map((key: { name: string }) => key.name);

				if (keys.length === 0) {
					return Effect.succeed([]);
				}

				return tasks
					.get<unknown>(keys, "json")
					.pipe(
						Effect.mapError(storageFailed),
						Effect.flatMap((values) =>
							Effect.forEach(Array.from(values.values()), (task) =>
								task === null ? Effect.succeed(undefined) : decodeTask(task),
							).pipe(Effect.map((tasks) => tasks.filter((task): task is Task => task !== undefined))),
						),
					);
			}),
		),
	get: ({ id }) =>
		tasks.get<unknown>(id, "json").pipe(
			Effect.mapError(storageFailed),
			Effect.flatMap((task): Effect.Effect<Task, TaskNotFound | TaskDecodeFailed> => {
				if (task === null) {
					return Effect.fail(new TaskNotFound({ id }));
				}
				return decodeTask(task);
			}),
		),
	save: (task) =>
		tasks
			.put(task.id, JSON.stringify(task))
			.pipe(Effect.mapError(storageFailed), Effect.as(task)),
});

export const makeKvTaskStoreLive = (tasks: KVNamespaceClient<string>) =>
	Layer.succeed(TaskStoreContext)(makeKvTaskStore(tasks));
