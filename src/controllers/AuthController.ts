import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { generateHashPassword, matchPassword } from "../core/generateHashPassword";
import { generateRandomString } from "../core/generateString";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import jwt from 'jsonwebtoken';
import { ReferTable } from "../entity/referUser.entiry";

export class AuthController {
    // Login user
    public async login(req: any, res: any) {
        const { userName, password } = req?.body;

        try {
            const emailLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { email: userName }
            });

            if (emailLogin && emailLogin?.status != 1) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }

            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (mobileLogin && mobileLogin?.status != 1) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }

            if (!emailLogin && !mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin) {
                const passwordMatch = await matchPassword(mobileLogin?.password, password);

                if (!passwordMatch) {
                    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }

                const token = jwt.sign({ userId: mobileLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });

                return sendResponse(res, StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
            }

            if (emailLogin) {
                const passwordMatch = await matchPassword(emailLogin?.password, password);

                if (!passwordMatch) {
                    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }

                const token = jwt.sign({ userId: emailLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });

                return sendResponse(res, StatusCodes.OK, "User Login Successfully", emailLogin, null, token);
            }
        } catch (error) {
            console.log('errror', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Register User
    public async register(req: any, res: any) {
        try {
            const userData: any = req?.body;

            if (!userData['email'] && !userData['mobile_no']) {
                return errorResponse(res, StatusCodes.NOT_FOUND, "Please Enter Mobile Number / Email.");
            }

            if (userData['email']) {
                const existingUserWithEmail: any = await AppDataSource.getRepository(User).findOne(
                    { where: { email: String(req?.body?.email) } }
                );

                if (existingUserWithEmail) {
                    return errorResponse(res, StatusCodes.CONFLICT, "Email Already Exist");
                }
            }

            if (userData['mobile_no']) {
                const existingUserWithMobile: any = await AppDataSource.getRepository(User).findOne(
                    { where: { mobile_no: String(req?.body?.mobile_no) } }
                );

                if (existingUserWithMobile) {
                    return errorResponse(res, StatusCodes.CONFLICT, "Mobile Number Already Exist");
                }
            }

            const enterUserData: any = {
                full_name: userData?.full_name || null,
                mobile_no: userData?.mobile_no || null,
                email: userData?.email || null,
                password: userData?.password || null,
            }

            const cryptoPassword = generateHashPassword(userData['password']);
            enterUserData['password'] = cryptoPassword;
            enterUserData['refer_code'] = generateRandomString(7);

            const userCreate = await AppDataSource.getRepository(User).save(enterUserData);

            if (!!userData?.code) {
                const userWithCode = await AppDataSource.getRepository(User).findOne({
                    where: { refer_code: userData['code'] }
                });

                if(userWithCode){
                    const referTableData = {
                        user_id: userCreate?.id,
                        refrence_user_id: userWithCode?.id,
                        code: userData['code']
                    }
                    await AppDataSource.getRepository(ReferTable).save(referTableData);
                }
            }

            return sendResponse(res, StatusCodes.OK, 'Login Successfully', userCreate);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // verify user name
    public async verifyUserName(req: any, res: any) {
        const { userName } = req?.body;
        try {
            const emailLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { email: userName }
            });

            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!emailLogin && !mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin) {
                return sendResponse(res, StatusCodes.OK, "UserName Verify Successfully", mobileLogin);
            }

            if (emailLogin) {
                return sendResponse(res, StatusCodes.OK, "UserName Verify Successfully", emailLogin);
            }
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // forgot Password
    public async forgotPassword(req: any, res: any) {
        const { userName, password } = req?.body;
        try {
            const emailLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { email: userName }
            });

            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!emailLogin && !mobileLogin) {

                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin) {
                const cryptoPassword = generateHashPassword(password);
                mobileLogin['password'] = cryptoPassword;
                const updateUserWithMobileNumber = await AppDataSource.getRepository(User).save(mobileLogin);
                return sendResponse(res, StatusCodes.OK, "Password Updated", updateUserWithMobileNumber);
            }

            if (emailLogin) {
                const cryptoPassword = generateHashPassword(password);
                emailLogin['password'] = cryptoPassword;
                const updateUserWithEmail = await AppDataSource.getRepository(User).save(emailLogin);
                return sendResponse(res, StatusCodes.OK, "Password Updated", updateUserWithEmail);
            }
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // admin login 
    public async adminLogin(req: any, res: any) {
        const { userName, password } = req?.body;

        try {
            const emailLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { email: userName, role: 1 }
            });

            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName, role: 1 }
            });

            if (!emailLogin && !mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin) {
                const passwordMatch = await matchPassword(mobileLogin?.password, password);

                if (!passwordMatch) {
                    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }

                const token = jwt.sign({ userId: mobileLogin?.id, role: mobileLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });

                return sendResponse(res, StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
            }

            if (emailLogin) {
                const passwordMatch = await matchPassword(emailLogin?.password, password);

                if (!passwordMatch) {
                    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }

                const token = jwt.sign({ userId: emailLogin?.id, role: emailLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });

                return sendResponse(res, StatusCodes.OK, "User Login Successfully", emailLogin, null, token);
            }
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}