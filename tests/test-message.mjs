import {MessageBuilder,} from "../messaging/message/MessageBuilder.mjs";
import {
    MESSAGE_STREAM_END,
    MESSAGE_TYPE_RPC_CALL
} from "../messaging/constants.mjs";
import {MAX_RANDOM_INT} from "velor/utils/platform.mjs";

import {setupTestContext} from 'velor/test/setupTestContext.mjs';

import {MessageWrapper} from "../messaging/message/MessageWrapper.mjs";

const {test, expect} = setupTestContext();

const RPC_REQUEST_CONNECTION = 10;

test.describe('message', () => {
    let builder = new MessageBuilder();

    test('should not be signed', () => {
        let {info, buffer} = builder.newCommand(
            RPC_REQUEST_CONNECTION,
            {
                a: 1,
                b: 2
            });

        let message = builder.unpack(buffer);
        expect(message.isSigned).to.be.false;
    })

    test('should have header', () => {
        let {info, buffer} = builder.newCommand(
            RPC_REQUEST_CONNECTION,
            {
                a: 1,
                b: 2
            });

        expect(info.id).to.be.lessThanOrEqual(MAX_RANDOM_INT);
        expect(info.messageType).to.eq(MESSAGE_TYPE_RPC_CALL);
        expect(info.messageMeta).to.eq(RPC_REQUEST_CONNECTION);

        let message = builder.unpack(buffer);

        expect(message.info).excluding(["commandName", "dataTypeName", "typeName"]).to.deep.eq(info);
    })

    test('should pack json', () => {
        let start = new Date();
        let {buffer} = builder.newJson({
            a: 1,
            b: 2
        });
        let stop = new Date();

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);
        expect(unpack.isJson).to.be.true;
        expect(unpack.isStream).to.be.false;
        expect(unpack.isEvent).to.be.false;
        expect(unpack.isBinary).to.be.false;
        expect(unpack.isCommand).to.be.false;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.false;

        expect(unpack.json()).to.deep.eq({
            a: 1,
            b: 2
        });

        expect(unpack.datetime.getTime()).to.be.lessThanOrEqual(stop.getTime())
        expect(unpack.datetime.getTime()).to.be.greaterThanOrEqual(start.getTime())
    })

    test('should pack commands', () => {
        let {buffer} = builder.newCommand(
            RPC_REQUEST_CONNECTION,
            {
                a: 1,
                b: 2
            });

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);
        expect(unpack).to.be.an.instanceof(MessageWrapper);

        expect(unpack.isStream).to.be.false;
        expect(unpack.isEvent).to.be.false;
        expect(unpack.isJson).to.be.true;
        expect(unpack.isBinary).to.be.false;
        expect(unpack.isCommand).to.be.true;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.false;

        expect(unpack.json()).to.deep.eq({
            a: 1,
            b: 2
        });

        expect(unpack.command).to.eq(RPC_REQUEST_CONNECTION);
    })

    test('should pack events', () => {
        let {buffer} = builder.newEvent(
            MESSAGE_STREAM_END,
            {
                a: 1,
                b: 2
            });

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);

        expect(unpack.isStream).to.be.false;
        expect(unpack.isEvent).to.be.true;
        expect(unpack.isJson).to.be.true;
        expect(unpack.isBinary).to.be.false;
        expect(unpack.isCommand).to.be.false;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.false;

        expect(unpack.json()).to.deep.eq({
            a: 1,
            b: 2
        });

        expect(unpack.event).to.eq(MESSAGE_STREAM_END);
    })

    test('should pack events with binary data', () => {
        let {buffer} = builder.newEvent(
            MESSAGE_STREAM_END,
            Uint8Array.from([1, 2, 3, 4, 5, 66]));

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);

        expect(unpack.isStream).to.be.false;
        expect(unpack.isEvent).to.be.true;
        expect(unpack.isJson).to.be.false;
        expect(unpack.isBinary).to.be.true;
        expect(unpack.isCommand).to.be.false;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.false;

        expect(unpack.array()).to.deep.eq([1, 2, 3, 4, 5, 66]);
        expect(unpack.event).to.eq(MESSAGE_STREAM_END);
    })

    test('should pack events with no data', () => {
        let {buffer} = builder.newEvent(MESSAGE_STREAM_END);

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);

        expect(unpack.isStream).to.be.false;
        expect(unpack.isEvent).to.be.true;
        expect(unpack.isJson).to.be.false;
        expect(unpack.isBinary).to.be.false;
        expect(unpack.isCommand).to.be.false;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.true;

        expect(unpack.event).to.eq(MESSAGE_STREAM_END);
    })

    test('should pack streams', () => {
        let {buffer} = builder.newStreamChunk(12, Uint8Array.from([1, 2, 3, 4, 5, 6, 77, 88]));

        expect(buffer).to.be.a('ArrayBuffer');

        let unpack = builder.unpack(buffer);

        expect(unpack.isStream).to.be.true;
        expect(unpack.isEvent).to.be.false;
        expect(unpack.isJson).to.be.false;
        expect(unpack.isBinary).to.be.true;
        expect(unpack.isCommand).to.be.false;
        expect(unpack.isMJPEG).to.be.false;
        expect(unpack.isEmpty).to.be.false;

        expect(unpack.buffer).to.eq(buffer);

        expect(Array.from(unpack.data)).to.deep.eq([1, 2, 3, 4, 5, 6, 77, 88]);
        expect(Array.from(unpack.uInt8Array())).to.deep.eq([1, 2, 3, 4, 5, 6, 77, 88]);
        expect(unpack.array()).to.deep.eq([1, 2, 3, 4, 5, 6, 77, 88]);
        expect(unpack.streamId).to.eq(12);
    })

})