import type { KVNamespaceClient } from "alchemy/Cloudflare";
export { CreateTaskFailed, ListTasksFailed, Task, TaskNotFound } from "./domain/task.ts";
import { makeKvTaskRepository } from "./services/task-repository-kv.ts";

export const listTasks = (tasks: KVNamespaceClient<string>) =>
	makeKvTaskRepository(tasks).list;

export const getTask =
	(tasks: KVNamespaceClient<string>) =>
	({ id }: { id: string }) =>
		makeKvTaskRepository(tasks).get({ id });

export const createTask =
	(tasks: KVNamespaceClient<string>) =>
	({ title }: { title: string }) =>
		makeKvTaskRepository(tasks).create({ title });
