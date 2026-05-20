import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

export class IdGenerator extends Context.Service<
	IdGenerator,
	{
		readonly nextUuid: Effect.Effect<string>;
	}
>()("IdGenerator") {}

export const makeCryptoIdGenerator = (): IdGenerator["Service"] => ({
	nextUuid: Effect.sync(() => crypto.randomUUID()),
});

export const IdGeneratorLive = Layer.succeed(IdGenerator)(makeCryptoIdGenerator());
