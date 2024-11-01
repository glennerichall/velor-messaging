// These constants represent basic message data types
// All messages in V1 has a header in json followed by the
// type defined in this constant
export const MESSAGE_CONTENT_JSON = 2;
export const MESSAGE_CONTENT_BINARY = 5;
export const MESSAGE_CONTENT_EMPTY = 7;
export const MESSAGE_CONTENT_STRING = 6;

// All messages are of certain types, regardless of their payload.
export const MESSAGE_TYPE_UNDEFINED = 0;
export const MESSAGE_TYPE_EVENT = 13;
export const MESSAGE_TYPE_STREAM = 1;
export const MESSAGE_TYPE_MJPEG = 3;
export const MESSAGE_TYPE_RPC_CALL = 4;
export const MESSAGE_TYPE_RPC_REPLY = 8;
export const MESSAGE_TYPE_RPC_REJECT = 9;

export const MESSAGE_STREAM_END = 10;
export const MESSAGE_STREAM_FILE = 12;
