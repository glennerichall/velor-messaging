import {
    MESSAGE_CONTENT_BINARY,
    MESSAGE_CONTENT_EMPTY,
    MESSAGE_CONTENT_JSON,
    MESSAGE_CONTENT_STRING
} from "../constants.mjs";

export class MessageWrapperBase {
    #message;
    #builder;

    constructor(message, builder) {
        this.#message = message;
        this.#builder = builder;
    }

    get id() {
        return this.info.id;
    }

    get info() {
        return this.#message.info;
    }

    get version() {
        return this.#message.version;
    }

    get dataType() {
        return this.info.dataType;
    }

    get type() {
        return this.info.messageType;
    }

    get datetime() {
        return new Date(this.timestamp);
    }

    get timestamp() {
        return this.info.timestamp;
    }

    get isJson() {
        return this.dataType === MESSAGE_CONTENT_JSON;
    }

    get isEmpty() {
        return this.dataType === MESSAGE_CONTENT_EMPTY;
    }

    get isBinary() {
        return this.dataType === MESSAGE_CONTENT_BINARY;
    }

    get isString() {
        return this.dataType === MESSAGE_CONTENT_STRING;
    }

    get isSigned() {
        return false;
    }

    get buffer() {
        let buffer = this.#message.buffer;

        // a message may contain another message wrapper or some sort (DataView or any class having buffer).
        while (!(buffer instanceof ArrayBuffer) && !!buffer) {
            buffer = buffer.buffer;
        }
        return buffer;
    }

    get data() {
        return this.#message.data;
    }

    json() {
        return this.#builder.decodeJson(this.data);
    }

    string() {
        return this.#builder.decodeString(this.data);
    }

    uInt8Array() {
        return new Uint8Array(this.data);
    }

    array() {
        return Array.from(this.data);
    }

    getData() {
        if (this.isJson) {
            return this.json();
        } else if (this.isBinary) {
            return this.buffer;
        } else if (this.isString) {
            return this.string();
        }
        return undefined;
    }
}