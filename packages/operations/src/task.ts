import { Task, type TaskDecodeFailed, type TaskNotFound, type TaskStorageFailed } from "@repo/domain/task";
import type * as Effect from "effect/Effect";
import * as EffectRuntime from "effect/Effect";

export interface CreateTaskInput {
	readonly title: string;
}

export interface IdGenerator {
	readonly nextUuid: Effect.Effect<string>;
}

export interface TaskStore<R = never> {
	readonly list: Effect.Effect<Array<Task>, TaskStorageFailed | TaskDecodeFailed, R>;
	readonly get: (input: { readonly id: string }) => Effect.Effect<Task, TaskNotFound | TaskStorageFailed | TaskDecodeFailed, R>;
	readonly save: (task: Task) => Effect.Effect<Task, TaskStorageFailed, R>;
}

export interface TaskOperations<R = never> {
	readonly list: Effect.Effect<Array<Task>, TaskStorageFailed | TaskDecodeFailed, R>;
	readonly get: (input: { readonly id: string }) => Effect.Effect<Task, TaskNotFound | TaskStorageFailed | TaskDecodeFailed, R>;
	readonly create: (input: CreateTaskInput) => Effect.Effect<Task, TaskStorageFailed, R>;
}

export const makeTaskOperations = <R>(
	tasks: TaskStore<R>,
	ids: IdGenerator,
): TaskOperations<R> => ({
	list: tasks.list,
	get: tasks.get,
	create: ({ title }) =>
		ids.nextUuid.pipe(
			EffectRuntime.map(
				(id) =>
					new Task({
						id,
						title,
						completed: false,
					}),
			),
			EffectRuntime.flatMap(tasks.save),
		),
});
