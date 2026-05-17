import type { KVNamespaceClient } from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { Rpc, RpcGroup, RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { CreateTaskFailed, createTask as createTaskImpl, getTask as getTaskImpl, Task, TaskNotFound } from "./task.ts";

export const getTaskRpc = Rpc.make("getTask", {
	success: Task,
	error: TaskNotFound,
	payload: {
		id: Schema.String,
	},
});

export const createTaskRpc = Rpc.make("createTask", {
	success: Task,
	error: CreateTaskFailed,
	payload: {
		title: Schema.String,
	},
});

export class TaskRpc extends RpcGroup.make(getTaskRpc, createTaskRpc) {}

export type TaskRpcs = RpcGroup.Rpcs<typeof TaskRpc>;

export const makeTaskRpcLive = (tasks: KVNamespaceClient<string>) =>
	TaskRpc.toLayer(
		Effect.gen(function* () {
			return {
				getTask: getTaskImpl(tasks),
				createTask: createTaskImpl(tasks),
			};
		}),
	);

export const makeTaskRpcHttpEffect = (tasks: KVNamespaceClient<string>) =>
	RpcServer.toHttpEffect(TaskRpc).pipe(
		Effect.provide(makeTaskRpcLive(tasks)),
		Effect.provide(RpcSerialization.layerJson),
	);
