import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { makeTaskApiLive } from "../http.ts";
import { makeTaskRpcLive, TaskRpc } from "../rpc.ts";
import { ApiKv } from "./kv.ts";
import { ExampleSecret } from "./secret.ts";

const makeAppLive = (tasks: Cloudflare.KVNamespaceClient<string>) =>
	Layer.mergeAll(
		makeTaskApiLive(tasks),

		RpcServer.layerHttp({
			group: TaskRpc,
			path: "/rpc",
			protocol: "http",
		}),
	).pipe(Layer.provide(makeTaskRpcLive(tasks)), Layer.provide(RpcSerialization.layerJson));

export class Worker extends Cloudflare.Worker<Worker, {}>()("Worker", { main: import.meta.path }) {}

export default Worker.make(
	Effect.gen(function* () {
		yield* Cloudflare.Secret.bind(ExampleSecret);
		const tasks = yield* Cloudflare.KVNamespace.bind(ApiKv);
		const fetch = HttpRouter.toHttpEffect(makeAppLive(tasks)).pipe(
			Effect.provide(Layer.mergeAll(HttpPlatform.layer, Etag.layer)),
		);

		return Worker.of({ fetch });
	}).pipe(Effect.provide(Layer.mergeAll(Cloudflare.SecretBindingLive, Cloudflare.KVNamespaceBindingLive))),
);
