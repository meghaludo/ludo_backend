import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

// Success response
export function sendResponse(res: Response, status: number, message: string, result?: any, pagination?: any, token?: string) {
    let payloadData: any;

    if (token) {
        payloadData = {
            token: token,
            pager: pagination,
            data: result
        }
    } else {
        payloadData = {
            pager: pagination,
            data: result
        }
    }

    const response = {
        status: status,
        message,
        payload: payloadData
    }

    return res.status(StatusCodes.OK).json(response);
}

// Error Response
export function errorResponse(res: Response, status: number, message: string, error?: any) {
    const response = {
        status: status,
        statusText: error ? error : '',
        error: {
            message,
        }

    }

    return res.status(status).json(response);
}