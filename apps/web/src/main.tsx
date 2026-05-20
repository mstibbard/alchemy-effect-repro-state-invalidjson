import * as Effect from "effect/Effect";
import React from "react";
import ReactDOM from "react-dom/client";

import { TaskClient, TaskClientLive } from "./task-client.ts";

const result = await Effect.gen(function* () {
	const client = yield* TaskClient;
	const created = yield* client.createTask({ title: "Created from web via RPC" });
	const found = yield* client.getTask({ id: created.id });

	return { created, found };
}).pipe(
	Effect.provide(TaskClientLive),
	Effect.scoped,
	Effect.runPromise,
);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<main>
			<h1>API RPC proof</h1>
			<pre>{JSON.stringify(result, null, 2)}</pre>
		</main>
	</React.StrictMode>,
);
