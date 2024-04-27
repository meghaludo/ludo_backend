import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { generateHashPassword, matchPassword } from "../core/generateHashPassword";
import { generateRandomNumberString, generateRandomString } from "../core/generateString";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import jwt from 'jsonwebtoken';
import { ReferTable } from "../entity/referUser.entiry";
import axios from "axios";

export class AuthController {
    // Login user
    public async login(req: any, res: any) {
        const { userName, password } = req?.body;

        try {
            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin && mobileLogin?.status != 1) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }

            const passwordMatch = await matchPassword(mobileLogin?.password, password);

            if (!passwordMatch) {
                return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Password');
            }

            const token = jwt.sign({ userId: mobileLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
            return sendResponse(res, StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
        } catch (error) {
            console.log('errror', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // verify OTP
    public async verifyOTP(req: any, res: any) {
        const { userName, otp, type } = req?.body;
        try {
            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!mobileLogin) {
                return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'User Not Found')
            }

            if (type == 'registerOTP') {
                if (mobileLogin['otp'] == String(otp)) {
                    mobileLogin['otp'] = null;
                    mobileLogin['status'] = 1;
                    const userData: any = await AppDataSource.getRepository(User).save(mobileLogin);
                    return sendResponse(res, StatusCodes.OK, "OTP Verify Successfully", userData);
                } else {
                    return errorResponse(res, StatusCodes.NOT_FOUND, 'Invalid OTP');
                }
            }


            if (type == 'forgotPassword') {
                if (mobileLogin && mobileLogin?.status != 1) {
                    return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
                }

                if (mobileLogin['otp'] == String(otp)) {
                    mobileLogin['otp'] = null;
                    const userData: any = await AppDataSource.getRepository(User).save(mobileLogin);

                    return sendResponse(res, StatusCodes.OK, "OTP Verify Successfully", userData);
                } else {
                    return errorResponse(res, StatusCodes.NOT_FOUND, 'Invalid OTP');
                }
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

            if (!userData['mobile_no']) {
                return errorResponse(res, StatusCodes.NOT_FOUND, "Please Enter Mobile Number.");
            }

            const existingUserWithMobile: any = await AppDataSource.getRepository(User).findOne(
                { where: { mobile_no: String(req?.body?.mobile_no) } }
            );

            if (existingUserWithMobile && existingUserWithMobile['status'] == 1) {
                return errorResponse(res, StatusCodes.CONFLICT, "Mobile Number Already Exist");
            }

            // if user not active and verify OTP 
            if (existingUserWithMobile && existingUserWithMobile['status'] == 0) {
                // opt send functionality
                const OTP = Math.floor(Math.random() * 9000) + 1000;

                const baseURL = 'https://www.fast2sms.com/dev/bulkV2';

                let params: any = {
                    authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                    route: 'otp',
                    variables_values: String(OTP),
                    numbers: existingUserWithMobile['mobile_no'],
                    flash: '0',
                };

                const response: any = await axios.get(baseURL, { params });

                if (response.status >= 200 && response.status < 300) {
                    existingUserWithMobile['full_name'] = userData?.full_name || null;
                    existingUserWithMobile['otp'] = String(OTP);
                    existingUserWithMobile['email'] = userData?.email || null;
                    existingUserWithMobile['status'] = 0;

                    const cryptoPassword = generateHashPassword(userData['password']);
                    existingUserWithMobile['password'] = cryptoPassword;

                    let userCreate = await AppDataSource.getRepository(User).save(existingUserWithMobile);

                    if (!!userData?.code && existingUserWithMobile?.reference_user_id == 0) {
                        const userWithCode: any = await AppDataSource.getRepository(User).findOne({
                            where: { refer_code: userData['code'] }
                        });

                        if (userWithCode) {
                            userWithCode['reference_user_id'] = userWithCode?.id;
                            const referTableData = {
                                user_id: userCreate?.id,
                                refrence_user_id: userWithCode?.id,
                                code: userData['code']
                            }
                            await AppDataSource.getRepository(ReferTable).save(referTableData);
                            userCreate = await AppDataSource.getRepository(User).save(userWithCode);
                        }
                    }

                    return sendResponse(res, StatusCodes.OK, 'Login Successfully', userCreate);
                } else {
                    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
                }


            }

            if (!existingUserWithMobile) {
                // opt send functionality
                const OTP = Math.floor(Math.random() * 9000) + 1000;

                const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
                let params: any = {
                    authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                    route: 'otp',
                    variables_values: String(OTP),
                    numbers: userData['mobile_no'],
                    flash: '0',
                };

                const response: any = await axios.get(baseURL, { params });

                if (response?.status >= 200 && response?.status < 300) {
                    const enterUserData: any = {
                        full_name: userData?.full_name || null,
                        ludo_name: userData?.full_name || 'test',
                        mobile_no: userData?.mobile_no || null,
                        email: userData?.email || null,
                        otp: String(OTP),
                        password: userData?.password || null,
                        game_key: `megaludo24${generateRandomNumberString(15)}`,
                        status: 0
                    }

                    const cryptoPassword = generateHashPassword(userData['password']);
                    enterUserData['password'] = cryptoPassword;
                    enterUserData['refer_code'] = generateRandomString(7);

                    let userCreate = await AppDataSource.getRepository(User).save(enterUserData);

                    if (!!userData?.code) {
                        const userWithCode: any = await AppDataSource.getRepository(User).findOne({
                            where: { refer_code: userData['code'] }
                        });

                        if (userWithCode) {
                            userWithCode['reference_user_id'] = userWithCode?.id;
                            const referTableData = {
                                user_id: userCreate?.id,
                                refrence_user_id: userWithCode?.id,
                                code: userData['code']
                            }
                            await AppDataSource.getRepository(ReferTable).save(referTableData);
                            userCreate = await AppDataSource.getRepository(User).save(userWithCode);
                        }
                    }
                    return sendResponse(res, StatusCodes.OK, 'Login Successfully', userCreate);
                } else {
                    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
                }
            }
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // verify user name
    public async verifyUserName(req: any, res: any) {
        const { userName } = req?.body;
        try {
            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            if (mobileLogin && mobileLogin?.status != 1) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }

            const OTP = Math.floor(Math.random() * 9000) + 1000;

            const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
            let params: any = {
                authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                route: 'otp',
                variables_values: String(OTP),
                numbers: mobileLogin['mobile_no'],
                flash: '0',
            };

            const response: any = await axios.get(baseURL, { params });

            if (response.status >= 200 && response.status < 300) {
                mobileLogin['otp'] = String(OTP);
                let userData = await AppDataSource.getRepository(User).save(mobileLogin);

                return sendResponse(res, StatusCodes.OK, "OTP Send Successfully", userData);
            } else {
                return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
            }
        } catch (error) {

            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // forgot Password
    public async forgotPassword(req: any, res: any) {
        const { userName, password } = req?.body;
        try {
            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: userName }
            });

            if (!mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            const cryptoPassword = generateHashPassword(password);
            mobileLogin['password'] = cryptoPassword;
            const updateUserWithMobileNumber = await AppDataSource.getRepository(User).save(mobileLogin);
            return sendResponse(res, StatusCodes.OK, "Password Updated", updateUserWithMobileNumber);

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

                const token = jwt.sign({ userId: mobileLogin?.id, role: mobileLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '48h' });

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


    // send otp for verify mobileNumber
    public async resendOTP(req: any, res: any) {
        try {
            const payload = req?.body;

            const mobileLogin: any = await AppDataSource.getRepository(User).findOne({
                where: { mobile_no: payload?.userName }
            });

            if (!mobileLogin) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }

            const OTP = Math.floor(Math.random() * 9000) + 1000;

            const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
            let params: any = {
                authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                route: 'otp',
                variables_values: String(OTP),
                numbers: payload['mobile_no'],
                flash: '0',
            };

            const response: any = await axios.get(baseURL, { params });

            if (response.status >= 200 && response.status < 300) {
                mobileLogin['otp'] = String(OTP);
                const updateUser = await AppDataSource.getRepository(User).save(mobileLogin);
                return sendResponse(res, StatusCodes.OK, "OTP Send Successfully", updateUser);
            } else {
                return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
            }
        } catch (error) {
            console.log('errorerrorerrorerrorerror', error)
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}