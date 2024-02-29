"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const responseUtil_1 = require("../utils/responseUtil");
const http_status_codes_1 = require("http-status-codes");
const secretKey = process.env.SECRET_KEY;
function verifyToken(req, res, next) {
    const authHeaders = req.header('Authorization');
    if (!authHeaders) {
        return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Token Not Found');
    }
    const token = authHeaders && authHeaders.split(' ')[1];
    jsonwebtoken_1.default.verify(token, 'dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs', (err, decoded) => {
        console.log('err :', err);
        // if (err) {
        //     return errorResponse(res, StatusCodes.UNAUTHORIZED, Message.TOKEN.INVALID);
        // }
        if (err) {
            if (err.name === "TokenExpiredError") {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Token Expire');
            }
            else {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'InValid Token');
            }
        }
        req.userId = decoded?.userId;
        req.role = decoded?.role;
        next();
    });
}
exports.verifyToken = verifyToken;
