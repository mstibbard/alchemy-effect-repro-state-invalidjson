import { Task, TaskNotFound } from "@repo/domain/task";
import { expect, test } from "bun:test";
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
