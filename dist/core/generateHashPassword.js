"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchPassword = exports.generateHashPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
function generateHashPassword(password) {
    const hash = crypto_1.default.createHash('sha256').update(password).digest('hex');
    return hash;
}
exports.generateHashPassword = generateHashPassword;
function matchPassword(storePassword, enteredPassword) {
    const enteredHashedPassword = generateHashPassword(enteredPassword);
    if (storePassword === enteredHashedPassword) {
        return true;
    }
    else {
        return false;
    }
}
exports.matchPassword = matchPassword;
