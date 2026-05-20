import type { KVNamespaceClient } from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as HttpApiScalar from "effect/unstable/httpapi/HttpApiScalar";
import { RpcSerialization, RpcServer } from "effect/unstable/rpc";

import { TaskApi, TaskApiLive } from "./http.ts";
import { TaskRpc, TaskRpcLive } from "./rpc.ts";
import { makeKvTaskStoreLive } from "./tasks/task-store-kv.ts";
import { TaskOperationsLive } from "./tasks/task-operations.ts";
import { IdGeneratorLive } from "./util/id-generator.ts";

const corsHeaders = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, POST, OPTIONS",
	"access-control-allow-headers": "b3, content-type, traceparent, tracestate",
};

export const makeAppLive = (tasks: KVNamespaceClient<string>) =>
	Layer.mergeAll(
		TaskApiLive,
		HttpApiScalar.layerCdn(TaskApi, {
			path: "/docs",
			scalar: {
				layout: "modern",
				showOperationId: true,
				hideModels: false,
			},
		}),
		RpcServer.layerHttp({
			group: TaskRpc,
			path: "/rpc",
			protocol: "http",
		}),
		HttpRouter.cors({
			allowedMethods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["b3", "content-type", "traceparent", "tracestate"],
		}),
	).pipe(
		Layer.provide(TaskRpcLive),
		Layer.provide(TaskOperationsLive),
		Layer.provide(makeKvTaskStoreLive(tasks)),
		Layer.provide(IdGeneratorLive),
		Layer.provide(RpcSerialization.layerJson),
	);

export const makeWorkerFetch = (tasks: KVNamespaceClient<string>) =>
	HttpRouter.toHttpEffect(makeAppLive(tasks)).pipe(
		Effect.map((handleRequest) => handleRequest.pipe(Effect.map(HttpServerResponse.setHeaders(corsHeaders)))),
		Effect.provide(Layer.mergeAll(HttpPlatform.layer, Etag.layer)),
	);
