import {MessageCoderV1} from "./MessageCoderV1.mjs";
import {constantNames} from "../constantNames.mjs";
import {
    MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_RPC_CALL,
    MESSAGE_TYPE_RPC_REJECT,
    MESSAGE_TYPE_RPC_REPLY,
    MESSAGE_TYPE_STREAM
} from "../constants.mjs";

import {MessageWrapper} from "./MessageWrapper.mjs";

export const MessageBuilderMixin = Parent => class extends Parent {
    constructor(coder = new MessageCoderV1(), ...args) {
        super(coder, ...args);
    }

    createHeader(...args) {
        const info = super.createHeader(...args);
        info.typeName = constantNames[info.messageType];
        info.dataTypeName = constantNames[info.dataType];
        return info;
    }

    newMessage(...args) {
        let messageRaw = super.newMessage(...args);
        return new MessageWrapper(messageRaw, this);
    }

    newReply(message, data, options) {
        let replyTo = message.info.id;
        return this.newVariant(MESSAGE_TYPE_RPC_REPLY, replyTo, data, options);
    }

    newRejection(message, error, options) {
        let replyTo = message.info.id;
        return this.newVariant(MESSAGE_TYPE_RPC_REJECT, replyTo, error, options);
    }

    newEvent(event, data, options) {
        return this.newVariant(MESSAGE_TYPE_EVENT, event, data, options);
    }

    newCommand(command, data, options) {
        return this.newVariant(MESSAGE_TYPE_RPC_CALL, command, data, options);
    }

    newStreamChunk(streamId, data, options) {
        return this.newVariant(MESSAGE_TYPE_STREAM, streamId, data, options);
    }

    newStreamEnd(streamId, options) {
        return this.newVariant(MESSAGE_TYPE_STREAM, streamId, undefined, options);
    }

}