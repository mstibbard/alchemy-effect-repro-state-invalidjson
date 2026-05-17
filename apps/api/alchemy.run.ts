import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

import { ApiKv } from "./src/infra/kv.ts";
import { Store } from "./src/infra/secret.ts";
import WorkerLive, { Worker } from "./src/infra/worker.ts";

export default Alchemy.Stack(
	"AlchemyReproApi",
	{
		providers: Cloudflare.providers(),
		state: Cloudflare.state(),
	},
	Effect.gen(function* () {
		const store = yield* Store;
		const apiKv = yield* ApiKv;
		const worker = yield* Worker;

		return {
			storeId: store.storeId,
			apiKvNamespaceId: apiKv.namespaceId,
			url: worker.url,
		};
	}).pipe(Effect.provide(WorkerLive)),
);
