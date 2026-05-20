import { Task, TaskDecodeFailed, TaskNotFound, TaskStorageFailed } from "@repo/domain/task";
import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";
import * as HttpApiSchema from "effect/unstable/httpapi/HttpApiSchema";

const taskNotFoundHttp = TaskNotFound.pipe(HttpApiSchema.status("NotFound"));
const taskStorageFailedHttp = TaskStorageFailed.pipe(HttpApiSchema.status("InternalServerError"));
const taskDecodeFailedHttp = TaskDecodeFailed.pipe(HttpApiSchema.status("InternalServerError"));

const getTaskHttp = HttpApiEndpoint.get("getTask", "/:id", {
	params: {
		id: Schema.String,
	},
	success: Task,
	error: [taskNotFoundHttp, taskStorageFailedHttp, taskDecodeFailedHttp],
});

const listTasksHttp = HttpApiEndpoint.get("listTasks", "/", {
	success: Schema.Array(Task),
	error: [taskStorageFailedHttp, taskDecodeFailedHttp],
});

const createTaskHttp = HttpApiEndpoint.post("createTask", "/", {
	success: Task,
	error: taskStorageFailedHttp,
	payload: Schema.Struct({
		title: Schema.String,
	}),
});

export const TaskApi = HttpApi.make("TaskApi").add(
	HttpApiGroup.make("Tasks").add(getTaskHttp, listTasksHttp, createTaskHttp),
);
