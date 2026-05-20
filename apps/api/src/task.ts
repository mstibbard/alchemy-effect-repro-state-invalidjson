import type { KVNamespaceClient } from "alchemy/Cloudflare";
export { CreateTaskFailed, ListTasksFailed, Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "./domain/task.ts";
import { makeCryptoIdGenerator } from "./services/id-generator.ts";
import { makeKvTaskRepository } from "./services/task-repository-kv.ts";
import { makeTaskOperations } from "./task-operations.ts";

const makeKvTaskOperations = (tasks: KVNamespaceClient<string>) =>
	makeTaskOperations(makeKvTaskRepository(tasks), makeCryptoIdGenerator());

export const listTasks = (tasks: KVNamespaceClient<string>) =>
	makeKvTaskOperations(tasks).list;

export const getTask =
	(tasks: KVNamespaceClient<string>) =>
	({ id }: { id: string }) =>
		makeKvTaskOperations(tasks).get({ id });

export const createTask =
	(tasks: KVNamespaceClient<string>) =>
	({ title }: { title: string }) =>
		makeKvTaskOperations(tasks).create({ title });
