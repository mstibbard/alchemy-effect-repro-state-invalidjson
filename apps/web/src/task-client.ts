import { makeTaskClientLive, TaskClient } from "@repo/api-contracts/task-client";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

const ApiConfigSchema = Schema.Struct({
	baseUrl: Schema.URLFromString,
});

export class ApiConfigError extends Schema.TaggedClass<ApiConfigError>()("ApiConfigError", {
	message: Schema.String,
}) {}

export class ApiConfig extends Context.Service<ApiConfig, typeof ApiConfigSchema.Type>()("ApiConfig") {}
export { TaskClient };

export const ApiConfigLive = Layer.effect(ApiConfig)(
	Schema.decodeUnknownEffect(ApiConfigSchema)({
		baseUrl: import.meta.env.VITE_API_URL,
	}).pipe(Effect.mapError((error) => new ApiConfigError({ message: String(error) }))),
);

export const TaskClientLive = Layer.effect(TaskClient)(
	Effect.gen(function* () {
		const config = yield* ApiConfig;
		return yield* TaskClient.pipe(Effect.provide(makeTaskClientLive(config.baseUrl.toString())));
	}),
).pipe(Layer.provide(ApiConfigLive));
