import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";

import { CreateTaskFailed, ListTasksFailed, Task, TaskNotFound } from "./domain/task.ts";
import { TaskRepository } from "./services/task-repository.ts";

const taskNotFoundHttp = TaskNotFound.pipe(HttpApiSchema.status("NotFound"));
const listTasksFailedHttp = ListTasksFailed.pipe(HttpApiSchema.status("InternalServerError"));
const createTaskFailedHttp = CreateTaskFailed.pipe(HttpApiSchema.status("InternalServerError"));

const getTaskHttp = HttpApiEndpoint.get("getTask", "/:id", {
	params: {
		id: Schema.String,
	},
	success: Task,
	error: taskNotFoundHttp,
});

const listTasksHttp = HttpApiEndpoint.get("listTasks", "/", {
	success: Schema.Array(Task),
	error: listTasksFailedHttp,
});

const createTaskHttp = HttpApiEndpoint.post("createTask", "/", {
	success: Task,
	error: createTaskFailedHttp,
	payload: Schema.Struct({
		title: Schema.String,
	}),
});

export const TaskApi = HttpApi.make("TaskApi").add(
	HttpApiGroup.make("Tasks").add(getTaskHttp, listTasksHttp, createTaskHttp),
);

export const TaskApiLive = HttpApiBuilder.layer(TaskApi).pipe(
	Layer.provide(
		HttpApiBuilder.group(TaskApi, "Tasks", (handlers) =>
			Effect.gen(function* () {
				const tasks = yield* TaskRepository;
				return handlers
					.handle("listTasks", Effect.fn(() => tasks.list))
					.handle("getTask", Effect.fn((req) => tasks.get(req.params)))
					.handle("createTask", Effect.fn((req) => tasks.create(req.payload)));
			}),
		),
	),
);
