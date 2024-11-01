import {
    isBrowser,
    isNode,
    MAX_RANDOM_INT,
    randomInt
} from "velor/utils/platform.mjs";

class ReadableStreamController {
    constructor() {
        this._controller = null;
    }

    start(controller) {
        this._controller = controller;
    }

    push(data) {
        this._controller.enqueue(data);
    }

    close() {
        this._controller.close();
    }

    fail(error) {
        this._controller.error(error);
    }
}

let ReadableImpl;
if (isBrowser) {
    ReadableImpl = ReadableStream;
} else if (isNode) {
    ;(async () => {
        const {Readable} = await import('stream');
        ReadableImpl = class extends Readable {
            _read() {
            }

            fail(error) {
                this.emit('error', error);
            }
        }
    })();
}

export class ReadStreamHandler {
    #streams;

    constructor() {
        this.#streams = new Map();
    }

    createReadStream(options = {}) {
        const {
            timeout = 5 * 1000 * 60, /* 5 minutes */
            id = randomInt(MAX_RANDOM_INT)
        } = options;

        let writer, reader;
        if (isBrowser) {
            writer = new ReadableStreamController();
            reader = new ReadableImpl(writer)
        } else if (isNode) {
            reader = new ReadableImpl();
            writer = {
                push: data => reader.push(data),
                close: () => reader.push(null),
                fail: (e) => reader.fail(e)
            };
        }
        this.#streams.set(id, {
            writer,
            reader,
            ttl: setTimeout(() => {
                // FIXME raise en Error
                this.#streams.get(id).writer.close();
                this.#streams.delete(id);
            }, timeout)
        });
        return {
            isReadableStream: true,
            id,
            reader,
            fail: error => this.fail(id, error)
        };
    }

    getReadStream(id) {
        return this.#streams.get(id)?.reader;
    }

    fail(id, error) {
        this.#streams.get(id)?.writer.fail(error);
    }

    append(message) {
        let {streamId, data} = message;
        let id = streamId;

        if (!streamId || !this.#streams.get(id)) {
            return false;
        }

        if (message.isEmpty) {
            console.log('stream finished ' + streamId)
            let stream = this.#streams.get(id);
            if (stream) {
                stream.writer.close();
                clearTimeout(stream.ttl);
                this.#streams.delete(id);
            }
        } else if (message.isRejection) {
            this.fail(id, message.error);
        } else {
            this.#streams.get(id).writer.push(data);
        }

        return true;
    }
}