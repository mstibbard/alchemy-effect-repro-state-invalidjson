import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { Rpc, RpcGroup, RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "./domain/task.ts";
import { TaskRepository } from "./services/task-repository.ts";

export const getTaskRpc = Rpc.make("getTask", {
	success: Task,
	error: Schema.Union([TaskNotFound, TaskStorageFailed, TaskDecodeFailed]),
	payload: {
		id: Schema.String,
	},
});

export const createTaskRpc = Rpc.make("createTask", {
	success: Task,
	error: TaskStorageFailed,
	payload: {
		title: Schema.String,
	},
});

export class TaskRpc extends RpcGroup.make(getTaskRpc, createTaskRpc) {}

export type TaskRpcs = RpcGroup.Rpcs<typeof TaskRpc>;

export const TaskRpcLive = TaskRpc.toLayer(
	Effect.gen(function* () {
		const tasks = yield* TaskRepository;
		return {
			getTask: tasks.get,
			createTask: tasks.create,
		};
	}),
);

export const makeTaskRpcHttpEffect = () =>
	RpcServer.toHttpEffect(TaskRpc).pipe(
		Effect.provide(TaskRpcLive),
		Effect.provide(RpcSerialization.layerJson),
	);
