import {decodeJson, decodeString, encodeJson, encodeString} from "./MessageCoderV1.mjs";
import {AbstractMessageBuilder} from "./AbstractMessageBuilder.mjs";
import {MessageWrapperBase} from "./MessageWrapperBase.mjs";
import {MessageWrapper} from "./MessageWrapper.mjs";

export class MessageBuilderBase extends AbstractMessageBuilder {
    #coder;

    constructor(coder, options = {}) {
        super(options);
        this.#coder = coder
    }

    get coder() {
        return this.#coder;
    }

    unpack(bufferOrMessageWrapper) {
        if (bufferOrMessageWrapper instanceof MessageWrapperBase) {
            return bufferOrMessageWrapper;
        }
        const message = this.coder.unpack(bufferOrMessageWrapper);
        return new MessageWrapper(message, this);
    }

    pack(info, content, options = {}) {
        const {createBuffer} = options;
        return this.#coder.pack(info, content, createBuffer);
    }

    encodeJson(content) {
        return encodeJson(content);
    }

    encodeString(content) {
        return encodeString(content);
    }

    decodeJson(data) {
        return decodeJson(data);
    }

    decodeString(data) {
        return decodeString(data);
    }

}