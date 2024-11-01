export class BufferView {
    constructor(buffer, byteOffset = 0, byteSize) {
        if (buffer instanceof DataView || buffer instanceof BufferView) {
            buffer = new DataView(buffer.buffer, buffer.byteOffset + byteOffset, byteSize ?? buffer.byteLength);
        } else {
            buffer = new DataView(buffer, byteOffset, byteSize);
        }
        this._buffer = buffer;
    }

    get byteLength() {
        return this._buffer.byteLength;
    }

    get byteOffset() {
        return this._buffer.byteOffset;
    }

    get buffer() {
        return this._buffer.buffer;
    }

    getBigUint64(pos) {
        return this._buffer.getBigUint64(pos, false);
    }

    getUint8(pos) {
        return this._buffer.getUint8(pos);
    }

    getUint16(pos) {
        return this._buffer.getUint16(pos, false);
    }

    getUint32(pos) {
        return this._buffer.getUint32(pos, false);
    }

    setBigUint64(pos, value) {
        return this._buffer.setBigUint64(pos, value, false);
    }

    setUint8(pos, value) {
        return this._buffer.setUint8(pos, value);
    }

    setUint16(pos, value) {
        return this._buffer.setUint16(pos, value, false);
    }

    setUint32(pos, value) {
        return this._buffer.setUint32(pos, value, false);
    }
}