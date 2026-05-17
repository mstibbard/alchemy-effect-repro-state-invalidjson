import type { KVNamespaceClient } from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

import { createTask, getTask, listTasks, Task } from "./task.ts";

const getTaskHttp = HttpApiEndpoint.get("getTask", "/:id", {
	params: {
		id: Schema.String,
	},
	success: Task,
});

const listTasksHttp = HttpApiEndpoint.get("listTasks", "/", {
	success: Schema.Array(Task),
});

const createTaskHttp = HttpApiEndpoint.post("createTask", "/", {
	success: Task,
	payload: Schema.Struct({
		title: Schema.String,
	}),
});

export const TaskApi = HttpApi.make("TaskApi").add(
	HttpApiGroup.make("Tasks").add(getTaskHttp, listTasksHttp, createTaskHttp),
);

export const makeTaskApiLive = (tasks: KVNamespaceClient<string>) =>
	HttpApiBuilder.layer(TaskApi).pipe(
		Layer.provide(
			HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
				Effect.gen(function* () {
					return handlers
						.handle(
							"listTasks",
							Effect.fn(() =>
								listTasks(tasks).pipe(
									Effect.catch(() => Effect.succeed(HttpServerResponse.text("Storage error", { status: 500 }))),
								),
							),
						)
						.handle(
							"getTask",
							Effect.fn((req) =>
								getTask(tasks)(req.params).pipe(
									Effect.catch(() => Effect.succeed(HttpServerResponse.text("Not found", { status: 404 }))),
								),
							),
						)
						.handle(
							"createTask",
							Effect.fn((req) =>
								createTask(tasks)(req.payload).pipe(
									Effect.catch(() => Effect.succeed(HttpServerResponse.text("Storage error", { status: 500 }))),
								),
							),
						);
				}),
			),
		),
	);
