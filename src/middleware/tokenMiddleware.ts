import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/responseUtil';
import { StatusCodes } from 'http-status-codes';

const secretKey: any = process.env.SECRET_KEY;

export function verifyToken(req: Request | any, res: Response, next: NextFunction) {
    const authHeaders = req.header('Authorization');

    if (!authHeaders) {
        return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Token Not Found')
    }

    const token = authHeaders && (authHeaders as string).split(' ')[1];

    jwt.verify(token, 'dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs', (err: any, decoded: any) => {
        console.log('err :', err);
        // if (err) {
        //     return errorResponse(res, StatusCodes.UNAUTHORIZED, Message.TOKEN.INVALID);
        // }
        if (err) {
            if (err.name === "TokenExpiredError") {
              return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'Token Expire',
              );
            } else {
              return errorResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                'InValid Token',
              );
            }
          }

        req.userId = decoded?.userId;
        req.role = decoded?.role;
        next();
    });
}