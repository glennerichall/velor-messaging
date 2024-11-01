import {
    cryptoLib,
    MAX_RANDOM_INT
} from "velor/utils/platform.mjs";
import {TimeoutError} from "velor/utils/sync.mjs";
import {
    MESSAGE_TYPE_RPC_REJECT,
    MESSAGE_TYPE_RPC_REPLY
} from "../constants.mjs";

export class RpcSignalingManager {
    constructor(signaling) {
        this._signaling = signaling;
        this._replies = new Map();
    }

    getRpcSync(options = {}) {
        let {
            id,
            resolveDelay = 0,
            failOnTimeout = true
        } = options;

        let promise;

        if (id === undefined) {
            do {
                id = cryptoLib.randomInt(MAX_RANDOM_INT);
            } while (this._signaling.hasSync(id));

            // the id was auto generated, let the caller know what is the id.
            options.id = id;
        } else {
            if (this._signaling.hasSync(id)) {
                throw new Error(`Lock ${id} was already declared`);
            }
        }

        // we will use this to count the number of replies received before
        // calling notify on the signaling object
        this._replies.set(id, {
            id,
            resolveDelay,
            responses: [],
        });

        promise = this._signaling.getSync(id);

        // await here to capture any exception thrown
        return promise.catch(e => {
            // do not let sync throw a timeout error if sending failed other than for a timeout.
            this._signaling.revoke(id);

            if (e instanceof TimeoutError) {
                if (failOnTimeout) {
                    throw e;
                } else {
                    // caller do not wish to fail on timeout, send it back the error
                    return e;
                }
            } else {
                throw e;
            }
        });

    }

    #consumeReply(repliesTo, response, accepted) {
        let replies = this._replies.get(repliesTo);
        if (!replies) {
            // Maybe the rpc is already resolved.
            return null;
        }

        clearTimeout(replies.timeoutId);

        replies.responses.push({
            response,
            accepted
        });

        const {resolveDelay} = replies;

        if (resolveDelay === 0) {
            this._replies.delete(repliesTo);
            if (accepted) {
                this._signaling.notify(repliesTo, response);
            } else {
                if (!(response instanceof Error)) {
                    response = response.error;
                }
                this._signaling.reject(repliesTo, response);
            }
        } else {
            replies.timeoutId = setTimeout(() => {
                this._replies.delete(repliesTo);
                this._signaling.notify(repliesTo, replies.responses);
            }, replies.resolveDelay);
        }
    }

    accept(message) {
        let accepted;
        if (message.type === MESSAGE_TYPE_RPC_REPLY) {
            accepted = true;
        } else if (message.type === MESSAGE_TYPE_RPC_REJECT) {
            accepted = false;
        } else {
            throw new Error("Invalid message type: " + message.type);
        }

        let repliesTo = message.repliesTo;
        return this.#consumeReply(repliesTo, message, accepted);
    }
}