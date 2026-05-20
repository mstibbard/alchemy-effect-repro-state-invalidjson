import * as Schema from "effect/Schema";

export class Task extends Schema.Class<Task>("Task")({
	id: Schema.String,
	title: Schema.String,
	completed: Schema.Boolean,
}) {}

export class TaskNotFound extends Schema.TaggedClass<TaskNotFound>()("TaskNotFound", { id: Schema.String }) {}

export class TaskUnavailable extends Schema.TaggedClass<TaskUnavailable>()("TaskUnavailable", {
	message: Schema.String,
	cause: Schema.Literals(["storage", "corrupt"]),
}) {}

export class TaskStorageFailed extends Schema.TaggedClass<TaskStorageFailed>()("TaskStorageFailed", {
	message: Schema.String,
}) {}

export class TaskDecodeFailed extends Schema.TaggedClass<TaskDecodeFailed>()("TaskDecodeFailed", {
	message: Schema.String,
}) {}
