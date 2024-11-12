import {RpcSignalingManager} from "../messaging/managers/RpcSignalingManager.mjs";

import {
    Synchronizer,
    timeoutAsync
} from "velor-utils/utils/sync.mjs";

import {MESSAGE_TYPE_RPC_REJECT, MESSAGE_TYPE_RPC_REPLY} from "../messaging/constants.mjs";

import {setupTestContext} from "velor-utils/test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('RpcSignalingManager', function () {

    test('should accept one reply', async () => {
        const signaling = new Synchronizer();
        const rpc = new RpcSignalingManager(signaling);

        let options = {};
        const promise = rpc.getRpcSync(options);

        expect(options).to.have.property('id');

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: options.id,
            content: 'toto'
        });

        let response = await promise;
        expect(response).to.have.property('content', 'toto');
    })

    test('should throw rejections', async () => {
        const signaling = new Synchronizer();
        const rpc = new RpcSignalingManager(signaling);

        let options = {
            failOnRejection: true
        };
        const promise = rpc.getRpcSync(options);

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REJECT,
            repliesTo: options.id,
            content: new Error('baz')
        });

        let error;
        try {
            let response = await promise;
        } catch (e) {
            error = e;
        }
        expect(error).to.be.an.instanceof(Error);
        expect(error.message).to.eq('baz');
    })

    test('should accept rejections', async () => {
        const signaling = new Synchronizer();
        const rpc = new RpcSignalingManager(signaling);

        let options = {
            failOnRejection: false,
        };
        const promise = rpc.getRpcSync(options);

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REJECT,
            repliesTo: options.id,
            content: new Error('baz')
        });

        let response = await promise;
        expect(response.type).to.eq(MESSAGE_TYPE_RPC_REJECT);
        expect(response.content).to.be.an.instanceof(Error);
        expect(response.content.message).to.eq('baz');
    })

    test('should accept multiple replies', async () => {
        const signaling = new Synchronizer();
        const rpc = new RpcSignalingManager(signaling);

        let options = {
            id: 'blah',
            resolveDelay: 100
        };
        const promise = rpc.getRpcSync(options);

        expect(options).to.have.property('id', 'blah');

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: 'blah',
            content: 'toto1'
        });

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: 'blah',
            content: 'toto2'
        });

        let response = await promise;
        expect(response).to.have.length(2);
        expect(response[0].response).to.have.property('content', 'toto1');
        expect(response[0].accepted).to.be.true
        expect(response[1].response).to.have.property('content', 'toto2');
        expect(response[1].accepted).to.be.true
    })

    test('should ignore delayed replies', async () => {
        const signaling = new Synchronizer();
        const rpc = new RpcSignalingManager(signaling);

        let options = {
            resolveDelay: 10
        };
        const promise = rpc.getRpcSync(options);

        expect(options).to.have.property('id');

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: options.id,
            content: 'toto1'
        });

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: options.id,
            content: 'toto2'
        });

        // wait before sending reply, the promise should be resolved with the
        // previous two replies and this reply should be ignored
        await timeoutAsync(20);

        rpc.accept({
            type: MESSAGE_TYPE_RPC_REPLY,
            repliesTo: options.id,
            content: 'toto3'
        });

        const responses = await promise;
        expect(responses).to.have.length(2);

        expect(responses[0].response).to.have.property('content', 'toto1');
        expect(responses[0].accepted).to.be.true
        expect(responses[1].response).to.have.property('content', 'toto2');
        expect(responses[1].accepted).to.be.true
    })
})