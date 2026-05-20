import { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "@repo/domain/task";
import * as Schema from "effect/Schema";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

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
