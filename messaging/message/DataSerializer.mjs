import {BufferView} from "./BufferView.mjs";

export const SIZE_BYTE = 1;
export const SIZE_INT = 4;
export const SIZE_SHORT = 2;
export const SIZE_LONG = 8;

export function pushValue(buffer, value, size, offset) {
    switch (size) {
        case SIZE_INT:
            buffer.setUint32(offset, value);
            break;

        case SIZE_BYTE:
            buffer.setUint8(offset, value);
            break;

        case SIZE_LONG:
            buffer.setBigUint64(offset, BigInt(value));
            break;

        case SIZE_SHORT:
            buffer.setUint16(offset, value);
            break;
    }
}

export function popValue(buffer, size, offset) {
    let value;
    switch (size) {
        case SIZE_INT:
            value = buffer.getUint32(offset);
            break;

        case SIZE_BYTE:
            value = buffer.getUint8(offset);
            break;

        case SIZE_LONG:
            value = Number(buffer.getBigUint64(offset));
            break;

        case SIZE_SHORT:
            value = buffer.getUint16(offset);
            break;
    }
    return value;
}

export function pushObject(serializer, object, schema) {
    let length = 0;
    for (let i = 1; i < schema.length; i += 2) {
        length += schema[i];
    }

    serializer.push(length, SIZE_INT);

    for (let i = 0; i < schema.length; i += 2) {
        let key = schema[i];
        serializer.push(object[key], schema[i + 1]);
    }
}

export class DataSerializerStack {
    constructor(createBuffer) {
        this._data = [];
        this._offset = 0;
        this._createBuffer = createBuffer;
    }

    get offset() {
        return this._offset;
    }

    get buffer() {
        return this.#pack(this._createBuffer);
    }

    pushUint8Array(uint8) {
        if (uint8 instanceof Uint8Array && uint8.length > 0) {
            this._data.push(uint8);
            this._offset += uint8.length;
        }
        return this;
    }

    pushObject(object, schema) {
        pushObject(this, object, schema);
        return this;
    }

    push(value, size) {
        this._data.push({value, size});
        this._offset += size;
        return this;
    }

    #calculateSize() {
        let size = 0;
        for (let data of this._data) {
            if (data instanceof Uint8Array) {
                size += data.length;
            } else {
                size += data.size;
            }
        }
        return size;
    }

    #pack(createBuffer) {
        const size = this.#calculateSize();
        const buffer = createBuffer(size);
        const serializer = new DataSerializer(buffer);

        for (let i = 0; i < this._data.length; i++) {
            let data = this._data[i];
            if (data instanceof Uint8Array) {
                serializer.pushUint8Array(data);
            } else {
                serializer.push(data.value, data.size);
            }
        }

        return buffer;
    }
}

export class DataDeserializer {
    constructor(buffer) {
        let offset = 0;
        if (buffer instanceof DataDeserializer) {
            buffer = buffer.buffer;
            offset = buffer.offset;
        } else if (!(buffer instanceof BufferView)) {
            buffer = new BufferView(buffer);
        }
        this._buffer = buffer;
        this._offset = offset;
    }

    get buffer() {
        return this._buffer;
    }

    get offset() {
        return this._offset;
    }

    popUint8Array() {
        let contentLength = this._buffer.byteLength - this._offset;
        return new Uint8Array(this._buffer.buffer, this._offset, contentLength);
    }

    popObject(schema) {
        const objSize = this.pop(SIZE_INT);
        const obj = {};
        for (let i = 0; i < schema.length; i += 2) {
            const key = schema[i];
            obj[key] = this.pop(schema[i + 1]);
        }
        return obj;
    }

    pop(size) {
        const value = popValue(this._buffer, size, this._offset);
        this._offset += size;
        return value;
    }
}

export class DataSerializer {
    constructor(buffer) {
        let offset = 0;
        if (buffer instanceof DataSerializer) {
            buffer = buffer.buffer;
            offset = buffer.offset;
        } else if (!(buffer instanceof BufferView)) {
            buffer = new BufferView(buffer);
        }
        this._buffer = buffer;
        this._offset = offset;
    }

    get offset() {
        return this._offset;
    }

    get buffer() {
        return this._buffer;
    }

    pushObject(object, schema) {
        pushObject(this, object, schema);
        return this;
    }

    pushUint8Array(content) {
        let contentLength = content?.length ?? 0;
        let contentBuffer = new Uint8Array(this._buffer.buffer, this._offset, contentLength);
        contentBuffer.set(content);
        return this;
    }

    push(value, size) {
        pushValue(this._buffer, value, size, this._offset);
        this._offset += size;
        return this;
    }
}