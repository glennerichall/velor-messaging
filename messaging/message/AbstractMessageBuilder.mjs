import {
    getCrypto,
    MAX_RANDOM_INT
} from "velor/utils/platform.mjs";
import {NotImplementedError} from "velor/utils/errors/NotImplementedError.mjs";
import {
    MESSAGE_CONTENT_BINARY,
    MESSAGE_CONTENT_EMPTY,
    MESSAGE_CONTENT_JSON,
    MESSAGE_CONTENT_STRING,
    MESSAGE_TYPE_UNDEFINED
} from "../constants.mjs";

import {isTypedArray} from "velor/utils/buffer/isTypedArray.mjs";

const cryptoLib = await getCrypto();

export class AbstractMessageBuilder {
    #getId;

    constructor(options) {
        this.#getId = options.getId ?? (() => cryptoLib.randomInt(MAX_RANDOM_INT));
    }

    getNewId(options = {}) {
        let {
            id,
            getId
        } = options;
        return id ?? getId?.call() ?? this.#getId();
    }

    createHeader(dataType, messageType, messageMeta, content, options = {}) {
        return {
            id: this.getNewId(options),
            timestamp: new Date().getTime(),
            dataType,
            messageType,
            messageMeta,
        }
    }

    encodeJson(content) {
        throw new NotImplementedError();
    }

    encodeString(content) {
        throw new NotImplementedError();
    }

    decodeString(data) {
        throw new NotImplementedError();
    }

    decodeJson(data) {
        throw new NotImplementedError();
    }

    unpack(message) {
        throw new NotImplementedError();
    }

    pack(info, content, options) {
        throw new NotImplementedError();
    }

    // -------------------------------------------------------------------------

    newMessage(contentType,
               messageType = MESSAGE_TYPE_UNDEFINED,
               messageMeta = 0,
               content,
               options = {}) {
        let info = this.createHeader(contentType, messageType, messageMeta, content, options);

        return {
            info,
            data: content,
            buffer: this.pack(info, content, options)
        };
    }

    newEmpty(messageType, messageMeta, options) {
        return this.newMessage(MESSAGE_CONTENT_EMPTY, messageType,
            messageMeta, options);
    }

    newJson(content, messageType, messageMeta, options) {
        return this.newMessage(MESSAGE_CONTENT_JSON, messageType,
            messageMeta, this.encodeJson(content), options);
    }

    newString(content, messageType, messageMeta, options) {
        return this.newMessage(MESSAGE_CONTENT_STRING, messageType,
            messageMeta, this.encodeString(content), options);
    }

    newBinary(content, messageType, messageMeta, options) {
        return this.newMessage(MESSAGE_CONTENT_BINARY, messageType,
            messageMeta, content, options);
    }

    // -------------------------------------------------------------------------

    newVariant(messageType, messageMeta, data, options) {
        let pack;
        if (isTypedArray(data)) {
            pack = this.newBinary(data, messageType, messageMeta, options);
        } else if (data instanceof Object) {
            pack = this.newJson(data, messageType, messageMeta, options);
        } else if (typeof data === "string") {
            pack = this.newString(data, messageType, messageMeta, options);
        } else {
            pack = this.newEmpty(messageType, messageMeta, options);
        }
        return pack;
    }
}
