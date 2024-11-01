import {NotImplementedError} from "velor/utils/errors/NotImplementedError.mjs";
import {composeSendRetryStrategy} from "velor/utils/composers/composeSendRetryStrategy.mjs";


export class RequestError extends Error {
    constructor(message, request) {
        super(message);
        this.request = request;
    }
}

export class InvalidRequestError extends RequestError {
    constructor(...args) {
        super('request not accepted', ...args);
    }
}

export class InvalidTransportError extends RequestError {
    constructor(...args) {
        super('transport is empty', ...args);
    }
}

export class RequestTransmitterBase {
    constructor({
                    retryStrategy,
                    requestTracker,
                    requestRules,
                    requestObserver,
                } = {}) {

        this._retryStrategy = retryStrategy;
        this._requestTracker = requestTracker;
        this._requestRules = requestRules;
        this._requestObserver = requestObserver;
    }

    async sendRequest(request, transport) {
        throw new NotImplementedError();
    }

    async send(request, transport, options = {}) {
        if (!transport) {
            throw new InvalidTransportError(request);
        }

        let retryStrategy = {
            ...this._retryStrategy,
            signal: request.options?.signal,
            ...options.retryStrategy
        };

        const {
            handleError = true
        } = options;

        let accepted = await this._requestRules?.accept(request) ?? true;
        if (accepted) {
            this._requestTracker?.push(request);
            try {
                this._requestObserver?.beforeRequest(request);

                const send = request => this.sendRequest(request, transport);
                const invoke = composeSendRetryStrategy(retryStrategy, send);
                const response = await invoke(request);

                this._requestObserver?.afterRequest(response, request);
                return response;
            } catch (error) {
                if (handleError) {
                    this._requestObserver?.requestFailed(error, request);
                }
                throw error;
            } finally {
                this._requestTracker?.pop(request);
            }
        } else {
            throw new InvalidRequestError(request);
        }
    }
}