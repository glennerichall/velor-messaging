import {RequestTransmitterBase} from "./RequestTransmitterBase.mjs";
import {
    MESSAGE_TYPE_RPC_CALL
} from "../constants.mjs";

export class SocketRequestTransmitter extends RequestTransmitterBase {
    constructor(rpcSignaling, options) {
        super(options);
        this._rpc = rpcSignaling;
    }

    async #sendRpc(message, transport) {
        const {info, buffer} = message;
        const promise = this._rpc.getRpcSync(info);
        await transport.send(buffer);
        return promise;
    }

    async sendRequest(message, transport) {
        let {info, buffer} = message;
        let result;
        switch (info.messageType) {
            case MESSAGE_TYPE_RPC_CALL:
                result = this.#sendRpc(message, transport);
                break;
            default:
                result = transport.send(buffer);
        }

        return result;
    }
}