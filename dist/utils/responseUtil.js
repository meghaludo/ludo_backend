"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.sendResponse = void 0;
const http_status_codes_1 = require("http-status-codes");
// Success response
function sendResponse(res, status, message, result, pagination, token) {
    let payloadData;
    if (token) {
        payloadData = {
            token: token,
            pager: pagination,
            data: result
        };
    }
    else {
        payloadData = {
            pager: pagination,
            data: result
        };
    }
    const response = {
        status: status,
        message,
        payload: payloadData
    };
    return res.status(http_status_codes_1.StatusCodes.OK).json(response);
}
exports.sendResponse = sendResponse;
// Error Response
function errorResponse(res, status, message, error) {
    const response = {
        status: status,
        statusText: error ? error : '',
        error: {
            message,
        }
    };
    return res.status(status).json(response);
}
exports.errorResponse = errorResponse;
