import { expect, test } from "bun:test";

import { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed, TaskUnavailable } from "@repo/domain/task";
import * as Effect from "effect/Effect";

import { makeTaskOperations, type IdGenerator, type TaskStore } from "../src/task.ts";

const makeInMemoryStore = (): TaskStore => {
	const saved = new Map<string, Task>();

	return {
		list: Effect.sync(() => Array.from(saved.values())),
		get: ({ id }) =>
			Effect.sync(() => saved.get(id)).pipe(
				Effect.flatMap((task) => (task === undefined ? Effect.fail(new TaskNotFound({ id })) : Effect.succeed(task))),
			),
		save: (task) =>
			Effect.sync(() => {
				saved.set(task.id, task);
				return task;
			}),
	};
};

const fixedIds = (id: string): IdGenerator => ({
	nextUuid: Effect.succeed(id),
});

test("task operations create incomplete tasks and persist them", async () => {
	const tasks = makeTaskOperations(makeInMemoryStore(), fixedIds("task-1"));

	const created = await tasks.create({ title: "Deepen the Task use case" }).pipe(Effect.runPromise);
	const listed = await tasks.list.pipe(Effect.runPromise);
	const found = await tasks.get({ id: "task-1" }).pipe(Effect.runPromise);

	expect(created).toEqual(new Task({ id: "task-1", title: "Deepen the Task use case", completed: false }));
	expect(listed).toEqual([created]);
	expect(found).toEqual(created);
});

test("task operations translate storage failures into unavailable persistence", async () => {
	const store: TaskStore = {
		list: Effect.fail(new TaskStorageFailed({ message: "KV is unavailable" })),
		get: () => Effect.fail(new TaskStorageFailed({ message: "KV is unavailable" })),
		save: () => Effect.fail(new TaskStorageFailed({ message: "KV is unavailable" })),
	};
	const tasks = makeTaskOperations(store, fixedIds("task-1"));

	const listError = await tasks.list.pipe(Effect.flip, Effect.runPromise);
	const getError = await tasks.get({ id: "task-1" }).pipe(Effect.flip, Effect.runPromise);
	const createError = await tasks.create({ title: "Persist me" }).pipe(Effect.flip, Effect.runPromise);

	const expected = new TaskUnavailable({ message: "Task persistence is unavailable", cause: "storage" });
	expect(listError).toEqual(expected);
	expect(getError).toEqual(expected);
	expect(createError).toEqual(expected);
});

test("task operations translate corrupt persisted tasks into unavailable persistence", async () => {
	const store: TaskStore = {
		list: Effect.fail(new TaskDecodeFailed({ message: "bad payload" })),
		get: () => Effect.fail(new TaskDecodeFailed({ message: "bad payload" })),
		save: (task) => Effect.succeed(task),
	};
	const tasks = makeTaskOperations(store, fixedIds("task-1"));

	const listError = await tasks.list.pipe(Effect.flip, Effect.runPromise);
	const getError = await tasks.get({ id: "task-1" }).pipe(Effect.flip, Effect.runPromise);

	const expected = new TaskUnavailable({ message: "Task persistence is unavailable", cause: "corrupt" });
	expect(listError).toEqual(expected);
	expect(getError).toEqual(expected);
});

test("task operations preserve missing task outcomes", async () => {
	const tasks = makeTaskOperations(makeInMemoryStore(), fixedIds("task-1"));

	const missing = await tasks.get({ id: "missing-task" }).pipe(Effect.flip, Effect.runPromise);

	expect(missing).toEqual(new TaskNotFound({ id: "missing-task" }));
});
