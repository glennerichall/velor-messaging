import {signData} from "velor/utils/signature.mjs";

export function getMessageSignature(message) {
    let {buffer} = message;

    const messageSize = buffer.byteLength - 32;

    // Generate the signature, expect buffer to have space at the end to keep the signature
    return signData(new DataView(buffer, 0, messageSize));
}

export function signMessage(message) {
    let {buffer} = message;

    const offset = buffer.byteLength - 32;

    // Generate the signature, expect buffer to have space at the end to keep the signature
    const signature = getMessageSignature(message);

    // copy the signature to the end of data
    new Uint8Array(buffer, offset, 32).set(signature);

    return message;
}