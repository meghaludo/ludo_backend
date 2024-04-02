"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumberString = exports.generateRandomString = void 0;
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789FGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyadasdadsasdqweqwe';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}
exports.generateRandomString = generateRandomString;
function generateRandomNumberString(length) {
    const charset = '0123456789';
    let randomNumberString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomNumberString += charset[randomIndex];
    }
    return randomNumberString;
}
exports.generateRandomNumberString = generateRandomNumberString;
