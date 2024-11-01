import {
    MESSAGE_TYPE_EVENT,
    MESSAGE_TYPE_MJPEG,
    MESSAGE_TYPE_RPC_CALL,
    MESSAGE_TYPE_RPC_REJECT,
    MESSAGE_TYPE_RPC_REPLY,
    MESSAGE_TYPE_STREAM
} from "../constants.mjs";
import {MessageWrapperBase} from "./MessageWrapperBase.mjs";

export class MessageWrapper extends MessageWrapperBase {
    constructor(...args) {
        super(...args);
    }

    get isEvent() {
        return this.type === MESSAGE_TYPE_EVENT;
    }

    get isCommand() {
        return this.type === MESSAGE_TYPE_RPC_CALL;
    }

    get isStream() {
        return this.type === MESSAGE_TYPE_STREAM;
    }

    get isMJPEG() {
        return this.type === MESSAGE_TYPE_MJPEG;
    }

    get isReply() {
        return this.type === MESSAGE_TYPE_RPC_REPLY;
    }

    get isRejection() {
        return this.type === MESSAGE_TYPE_RPC_REJECT;
    }

    get event() {
        return this.info.messageMeta;
    }

    get command() {
        return this.info.messageMeta;
    }

    get repliesTo() {
        return this.info.messageMeta;
    }

    get streamId() {
        return this.info.messageMeta;
    }

    get error() {
        return new Error(this.string());
    }

    toString() {
        let details;
        if (this.isCommand) {
            details = `command: ${this.commandName}`;
        } else if (this.isEvent) {
            details = `event: ${this.eventName}`;
        } else if (this.isMJPEG) {
            details = `camera id: ${this.streamId}`;
        } else if (this.isStream) {
            details = `stream id: ${this.streamId}`;
        } else if (this.isReply) {
            details = `replies to: ${this.repliesTo}`;
        }else if (this.isRejection) {
            details = `replies to: ${this.repliesTo}
error: ${this.error.message}`;
        }

        return `version: ${this.version} 
timestamp: ${this.timestamp}
id: ${this.id}
${details}`;
    }
}