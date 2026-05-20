import { Client } from "@repo/api/client";
import type { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "@repo/api/task";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import type { RpcClientError } from "effect/unstable/rpc/RpcClientError";

const ApiConfigSchema = Schema.Struct({
	baseUrl: Schema.URLFromString,
});

export class ApiConfigError extends Schema.TaggedClass<ApiConfigError>()("ApiConfigError", {
	message: Schema.String,
}) {}

export class ApiConfig extends Context.Service<ApiConfig, typeof ApiConfigSchema.Type>()("ApiConfig") {}

export interface TaskClientService {
	readonly createTask: (input: { readonly title: string }) => Effect.Effect<Task, TaskStorageFailed | RpcClientError>;
	readonly getTask: (
		input: { readonly id: string },
	) => Effect.Effect<Task, TaskDecodeFailed | TaskNotFound | TaskStorageFailed | RpcClientError>;
}

export class TaskClient extends Context.Service<TaskClient, TaskClientService>()("TaskClient") {}

export const ApiConfigLive = Layer.effect(ApiConfig)(
	Schema.decodeUnknownEffect(ApiConfigSchema)({
		baseUrl: import.meta.env.VITE_API_URL,
	}).pipe(Effect.mapError((error) => new ApiConfigError({ message: String(error) }))),
);

export const TaskClientLive = Layer.effect(TaskClient)(
	Effect.gen(function* () {
		const config = yield* ApiConfig;
		return yield* Client(config.baseUrl.toString());
	}),
).pipe(Layer.provide(ApiConfigLive), Layer.provide(FetchHttpClient.layer));
