import { PublicTaskUnavailable, TaskApi } from "@repo/api-contracts/http";
import type { TaskNotFound, TaskUnavailable } from "@repo/domain/task";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";

import { TaskOperations } from "./tasks/task-operations.ts";
export { TaskApi } from "@repo/api-contracts/http";

const publicTaskUnavailable = () => new PublicTaskUnavailable({ message: "Task persistence is unavailable" });

const redactTaskUnavailable = (error: TaskNotFound | TaskUnavailable) =>
	error._tag === "TaskUnavailable" ? publicTaskUnavailable() : error;

export const TaskApiLive = HttpApiBuilder.layer(TaskApi).pipe(
	Layer.provide(
		HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
			Effect.gen(function* () {
				const tasks = yield* TaskOperations;
				return handlers
					.handle(
						"listTasks",
						Effect.fn(() => tasks.list.pipe(Effect.mapError(publicTaskUnavailable))),
					)
					.handle(
						"getTask",
						Effect.fn((req) => tasks.get(req.params).pipe(Effect.mapError(redactTaskUnavailable))),
					)
					.handle(
						"createTask",
						Effect.fn((req) => tasks.create(req.payload).pipe(Effect.mapError(publicTaskUnavailable))),
					);
			}),
		),
	),
);
