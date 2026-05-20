import { TaskApi } from "@repo/api-contracts/http";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { TaskOperations } from "./tasks/task-operations.ts";
export { TaskApi } from "@repo/api-contracts/http";

export const TaskApiLive = HttpApiBuilder.layer(TaskApi).pipe(
	Layer.provide(
		HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
			Effect.gen(function* () {
				const tasks = yield* TaskOperations;
				return handlers
					.handle("listTasks", Effect.fn(() => tasks.list))
					.handle("getTask", Effect.fn((req) => tasks.get(req.params)))
					.handle("createTask", Effect.fn((req) => tasks.create(req.payload)));
			}),
		),
	),
);
