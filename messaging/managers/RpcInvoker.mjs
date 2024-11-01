
export class RpcInvoker {
    constructor() {
        this._invokers = new Map();
    }

    async invoke(message) {
        let data;
        if (message.isJson) {
            data = message.json();
        } else if (message.isBinary) {
            data = message.uInt8Array();
        }
        let command = message.command;
        if (!this._invokers.has(command)) {
            throw new Error(`The RPC ${command} does not exist`);
        }
        return this._invokers.get(command)(data);
    }

    registerProcedure(name, procedure) {
        this._invokers.set(name, procedure);
    }

    unregisterProcedure(name) {
        this._invokers.delete(name);
    }

}