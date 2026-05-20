import { WorkerEnvironment } from "alchemy/Cloudflare/Workers";
import { expect, test } from "bun:test";

import * as Effect from "effect/Effect";

import { Task, TaskNotFound } from "../src/domain/task.ts";
import { makeTaskOperations } from "../src/task-operations.ts";
import type { IdGenerator } from "../src/services/id-generator.ts";
import type { TaskRepository } from "../src/services/task-repository.ts";

const makeInMemoryRepository = (): TaskRepository["Service"] => {
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

const fixedIds = (id: string): IdGenerator["Service"] => ({
	nextUuid: Effect.succeed(id),
});

const runTaskEffect = <A, E>(effect: Effect.Effect<A, E, WorkerEnvironment>) =>
	effect.pipe(Effect.provideService(WorkerEnvironment, {}), Effect.runPromise);

test("task operations create incomplete tasks and persist them", async () => {
	const tasks = makeTaskOperations(makeInMemoryRepository(), fixedIds("task-1"));

	const created = await runTaskEffect(tasks.create({ title: "Deepen the Task use case" }));
	const listed = await runTaskEffect(tasks.list);
	const found = await runTaskEffect(tasks.get({ id: "task-1" }));

	expect(created).toEqual(new Task({ id: "task-1", title: "Deepen the Task use case", completed: false }));
	expect(listed).toEqual([created]);
	expect(found).toEqual(created);
});
