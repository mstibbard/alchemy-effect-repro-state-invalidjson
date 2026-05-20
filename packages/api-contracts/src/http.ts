import { Task, TaskNotFound } from "@repo/domain/task";
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";

export class PublicTaskUnavailable extends Schema.TaggedClass<PublicTaskUnavailable>()("TaskUnavailable", {
	message: Schema.String,
}) {}

const taskNotFoundHttp = TaskNotFound.pipe(HttpApiSchema.status("NotFound"));
const taskUnavailableHttp = PublicTaskUnavailable.pipe(HttpApiSchema.status("InternalServerError"));

const getTaskHttp = HttpApiEndpoint.get("getTask", "/:id", {
	params: {
		id: Schema.String,
	},
	success: Task,
	error: [taskNotFoundHttp, taskUnavailableHttp],
});

const listTasksHttp = HttpApiEndpoint.get("listTasks", "/", {
	success: Schema.Array(Task),
	error: taskUnavailableHttp,
});

const createTaskHttp = HttpApiEndpoint.post("createTask", "/", {
	success: Task,
	error: taskUnavailableHttp,
	payload: Schema.Struct({
		title: Schema.String,
	}),
});

export const TaskApi = HttpApi.make("TaskApi").add(
	HttpApiGroup.make("Tasks").add(getTaskHttp, listTasksHttp, createTaskHttp),
);
