import * as Cloudflare from "alchemy/Cloudflare";
import { Effect, Redacted } from "effect";

export const Store = Cloudflare.SecretsStore("FlowSecretStore");

export const ExampleSecret = Effect.gen(function* () {
	const store = yield* Store;

	return yield* Cloudflare.Secret("REPRO_SECRET_NUMBER", {
		store,
		value: Redacted.make(String(Math.random())),
	});
});
