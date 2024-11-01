import {AbstractMessageBuilder} from "./AbstractMessageBuilder.mjs";

import {MessageBuilderMixin} from "./MessageBuilderMixin.mjs";
import {MessageWrapper} from "./MessageWrapper.mjs";


class GenericMessageBuilderBase extends AbstractMessageBuilder {
    constructor(options) {
        super(options);
    }

    pack(info, data, options) {
        return {
            info,
            data,
            options
        };
    }

    unpack(buffer) {
        return new MessageWrapper(buffer, this);
    }

    encodeJson(content) {
        return content;
    }

    encodeString(content) {
        return content;
    }

    decodeJson(content) {
        return content;
    }

    decodeString(content) {
        return content;
    }
}

export const GenericMessageBuilder = MessageBuilderMixin(GenericMessageBuilderBase);