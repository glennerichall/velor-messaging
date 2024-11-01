import {
    DataDeserializer,
    DataSerializer,
    DataSerializerStack,
    SIZE_BYTE,
    SIZE_LONG,
    SIZE_SHORT
} from "./DataSerializer.mjs";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function encodeJson(content) {
    let data = JSON.stringify(content);
    return encoder.encode(data);
}

export function encodeString(content) {
    return encoder.encode(content);
}

export function decodeString(content) {
    return decoder.decode(content);
}

export function decodeJson(content) {
    let data = decoder.decode(content);
    return JSON.parse(data);
}


// id :         8 bytes
// timestamp:   8 bytes
// dataType:    1 byte
// messageType: 2 bytes
// messageMeta: 8 bytes

const SIZE_VERSION = SIZE_BYTE;
const SIZE_ID = SIZE_LONG;
const SIZE_TIMESTAMP = SIZE_LONG;
const SIZE_DATA_TYPE = SIZE_BYTE;
const SIZE_MESSAGE_TYPE = SIZE_SHORT;
const SIZE_MESSAGE_META = SIZE_LONG;

const POS_ID = 0;
const POS_TIMESTAMP = POS_ID + SIZE_ID;
const POS_DATA_TYPE = POS_TIMESTAMP + SIZE_TIMESTAMP;
const POS_MESSAGE_TYPE = POS_DATA_TYPE + SIZE_DATA_TYPE;
const POS_MESSAGE_META = POS_MESSAGE_TYPE + SIZE_MESSAGE_TYPE;

const infoSizes = [
    "id", SIZE_ID,
    "timestamp", SIZE_TIMESTAMP,
    "dataType", SIZE_DATA_TYPE,
    "messageType", SIZE_MESSAGE_TYPE,
    "messageMeta", SIZE_MESSAGE_META,
];

export function encodeHeader(info, dv) {
    return new DataSerializer(dv)
        .push(info.id, SIZE_ID)
        .push(info.timestamp, SIZE_TIMESTAMP)
        .push(info.dataType, SIZE_DATA_TYPE)
        .push(info.messageType, SIZE_MESSAGE_TYPE)
        .push(info.messageMeta, SIZE_MESSAGE_META)
        .buffer;

    //
    //
    // // all data are big endian
    // dv.setBigUint64(POS_ID, BigInt(info.id));
    // dv.setBigUint64(POS_TIMESTAMP, BigInt(info.timestamp));
    // dv.setUint8(POS_DATA_TYPE, info.dataType);
    // dv.setUint16(POS_MESSAGE_TYPE, info.messageType);
    // dv.setBigUint64(POS_MESSAGE_META, BigInt(info.messageMeta));
}

export function decodeHeader(dv) {
    const serializer = new DataDeserializer(dv);
    return {
        id: serializer.pop(SIZE_ID),
        timestamp: serializer.pop(SIZE_TIMESTAMP),
        dataType: serializer.pop(SIZE_DATA_TYPE),
        messageType: serializer.pop(SIZE_MESSAGE_TYPE),
        messageMeta: serializer.pop(SIZE_MESSAGE_META),
    };

    // return {
    //     id: Number(dv.getBigUint64(POS_ID)),
    //     timestamp: Number(dv.getBigUint64(POS_TIMESTAMP)),
    //     dataType: dv.getUint8(POS_DATA_TYPE),
    //     messageType: dv.getUint16(POS_MESSAGE_TYPE),
    //     messageMeta: Number(dv.getBigUint64(POS_MESSAGE_META)),
    // };
}

export function getHeaderByteLength(info) {
    return SIZE_ID +
        SIZE_TIMESTAMP +
        SIZE_DATA_TYPE +
        SIZE_MESSAGE_TYPE +
        SIZE_MESSAGE_META;
}

export class MessageCoderV1 {
    constructor() {
    }

    get version() {
        return 1;
    }

    pack(info, content, createBuffer = length => new ArrayBuffer(length)) {
        // set the version and header length
        return new DataSerializerStack(createBuffer)
            .push(this.version, SIZE_VERSION)
            .pushObject(info, infoSizes)
            .pushUint8Array(content)
            .buffer;
    }

    unpack(buffer) {

        const deserializer = new DataDeserializer(buffer);
        let version = deserializer.pop(SIZE_VERSION);

        if (version !== this.version) {
            throw new Error(`Bad message version ${version} != this.version (${this.version})`);
        }

        // let dv = buffer instanceof DataView ?
        //     buffer :
        //     new DataView(buffer);

        // the header length is after the version (1 byte)
        let info = deserializer.popObject(infoSizes);
        let data = deserializer.popUint8Array();

        return {
            info,
            version,
            data,
            buffer
        };

        // // the content is after the version (1 byte) and the header length (4 bytes) and the header (headerLength
        // bytes) let contentOffset = 1 + 4 + headerLength;  let contentLength = buffer.byteLength - contentOffset; let
        // contentBuffer = buffer instanceof DataView ? new Uint8Array(buffer.buffer, buffer.byteOffset +
        // contentOffset, contentLength) : new Uint8Array(buffer, contentOffset, contentLength);  let headerDataView =
        // buffer instanceof DataView ? new DataView(buffer.buffer, buffer.byteOffset + 5, buffer.byteLength) : new
        // DataView(buffer, 5);  let info = decodeHeader(headerDataView, headerLength); let data = contentBuffer;
        // return { version, info, data };
    }
}