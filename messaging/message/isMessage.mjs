import {MessageWrapperBase} from "./MessageWrapperBase.mjs";
import {MessageWrapper} from "./MessageWrapper.mjs";

export function isMessage(message) {
    return message instanceof MessageWrapperBase ||
        message instanceof MessageWrapper ||
        (message?.buffer instanceof ArrayBuffer) &&
        typeof message.info === 'object' &&
        Number.isInteger(message.info.id) &&
        Number.isInteger(message.info.messageType) &&
        Number.isInteger(message.info.dataType);
}

export function validateMessage(message) {
    if (!isMessage(message)) {
        throw new Error("message must have a buffer property of type ArrayBuffer");
    }
}