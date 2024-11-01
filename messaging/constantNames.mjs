import * as constants from './constants.mjs';

export const constantNames = {};

for (let key in constants) {
    constantNames[constants[key]] = key;
}