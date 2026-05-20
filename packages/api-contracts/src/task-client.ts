import type { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "@repo/domain/task";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";

import { Client } from "./client.ts";

export interface TaskClientService {
	readonly createTask: (input: { readonly title: string }) => Effect.Effect<Task, TaskStorageFailed | RpcClientError>;
	readonly getTask: (
		input: { readonly id: string },
	) => Effect.Effect<Task, TaskDecodeFailed | TaskNotFound | TaskStorageFailed | RpcClientError>;
}

export class TaskClient extends Context.Service<TaskClient, TaskClientService>()("TaskClient") {}

export const makeTaskClientLive = (baseUrl: string) =>
	Layer.effect(TaskClient)(Client(baseUrl)).pipe(Layer.provide(FetchHttpClient.layer));
