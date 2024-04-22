"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const responseUtil_1 = require("../utils/responseUtil");
const message_1 = require("../constants/message");
const generateHashPassword_1 = require("../core/generateHashPassword");
const generateString_1 = require("../core/generateString");
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entity/user.entity");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const referUser_entiry_1 = require("../entity/referUser.entiry");
const axios_1 = __importDefault(require("axios"));
class AuthController {
    // Login user
    async login(req, res) {
        const { userName, password } = req?.body;
        try {
            // const emailLogin: any = await AppDataSource.getRepository(User).findOne({
            //     where: { email: userName }
            // });
            // if (emailLogin && emailLogin?.status != 1) {
            //     return errorResponse(res, StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            // }
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin && mobileLogin?.status != 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }
            const passwordMatch = await (0, generateHashPassword_1.matchPassword)(mobileLogin?.password, password);
            if (!passwordMatch) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid Password');
            }
            const token = jsonwebtoken_1.default.sign({ userId: mobileLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
            // const OTP = Math.floor(Math.random() * 9000) + 1000;
            // const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
            // let params: any = {
            //     authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
            //     route: 'otp',
            //     variables_values: String(OTP),
            //     numbers: mobileLogin['mobile_no'],
            //     flash: '0',
            // };
            // const response: any = await axios.get(baseURL, { params });
            // if (response.status >= 200 && response.status < 300) {
            //     console.log('SMS sent successfully:', response.data);
            //     mobileLogin['otp'] = String(OTP);
            //     await AppDataSource.getRepository(User).save(mobileLogin);
            //     params = {};
            //     return sendResponse(res, StatusCodes.OK, "OTP Send Successfully", response.data);
            //     // Handle success response
            // } else {
            //     console.error('Error sending SMS:', response.status, response.data);
            //     errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
            //     // Handle error response
            // }
            // }
            // if (emailLogin) {
            //     const passwordMatch = await matchPassword(emailLogin?.password, password);
            //     if (!passwordMatch) {
            //         return errorResponse(res, StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
            //     }
            //     const token = jwt.sign({ userId: emailLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
            //     return sendResponse(res, StatusCodes.OK, "User Login Successfully", emailLogin, null, token);
            // }
            // return sendResponse(res, StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
        }
        catch (error) {
            console.log('errror', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // verify OTP
    async verifyOTP(req, res) {
        const { userName, otp } = req?.body;
        try {
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (mobileLogin && mobileLogin?.status != 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }
            if (mobileLogin['otp'] == String(otp)) {
                mobileLogin['otp'] = null;
                const userData = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                const token = jsonwebtoken_1.default.sign({ userId: mobileLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '48h' });
                userData['amount'] = Number(userData['amount'])?.toFixed(2);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Verify Successfully", userData, null, token);
                // return sendResponse(res, StatusCodes.OK, "OTP Verify Successfully", userData);
            }
            else {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Invalid OTP');
            }
        }
        catch (error) {
            console.log('errror', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Register User
    async register(req, res) {
        try {
            const userData = req?.body;
            if (!userData['mobile_no']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Please Enter Mobile Number / Email.");
            }
            // if (userData['email']) {
            //     const existingUserWithEmail: any = await AppDataSource.getRepository(User).findOne(
            //         { where: { email: String(req?.body?.email) } }
            //     );
            //     if (existingUserWithEmail) {
            //         return errorResponse(res, StatusCodes.CONFLICT, "Email Already Exist");
            //     }
            // }
            // if (userData['mobile_no']) {
            const existingUserWithMobile = await data_source_1.default.getRepository(user_entity_1.User).findOne({ where: { mobile_no: String(req?.body?.mobile_no) } });
            if (existingUserWithMobile) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, "Mobile Number Already Exist");
            }
            // }
            const enterUserData = {
                full_name: userData?.full_name || null,
                ludo_name: userData?.full_name || 'test',
                mobile_no: userData?.mobile_no || null,
                email: userData?.email || null,
                password: userData?.password || null,
                game_key: `megaludo24${(0, generateString_1.generateRandomNumberString)(15)}`
            };
            // const cryptoPassword = generateHashPassword(userData['password']);
            // enterUserData['password'] = cryptoPassword;
            enterUserData['refer_code'] = (0, generateString_1.generateRandomString)(7);
            const userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(enterUserData);
            if (!!userData?.code) {
                const userWithCode = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { refer_code: userData['code'] }
                });
                if (userWithCode) {
                    enterUserData['reference_user_id'] = userWithCode?.id;
                    const referTableData = {
                        user_id: userCreate?.id,
                        refrence_user_id: userWithCode?.id,
                        code: userData['code']
                    };
                    await data_source_1.default.getRepository(referUser_entiry_1.ReferTable).save(referTableData);
                }
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, 'Login Successfully', userCreate);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // verify user name
    async verifyUserName(req, res) {
        const { userName } = req?.body;
        try {
            // const emailLogin: any = await AppDataSource.getRepository(User).findOne({
            //     where: { email: userName }
            // });
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "UserName Verify Successfully", mobileLogin);
            // if (emailLogin) {
            //     return sendResponse(res, StatusCodes.OK, "UserName Verify Successfully", emailLogin);
            // }
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // forgot Password
    async forgotPassword(req, res) {
        const { userName, password } = req?.body;
        try {
            // const emailLogin: any = await AppDataSource.getRepository(User).findOne({
            //     where: { email: userName }
            // });
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(password);
            mobileLogin['password'] = cryptoPassword;
            const updateUserWithMobileNumber = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Password Updated", updateUserWithMobileNumber);
            // if (emailLogin) {
            //     const cryptoPassword = generateHashPassword(password);
            //     emailLogin['password'] = cryptoPassword;
            //     const updateUserWithEmail = await AppDataSource.getRepository(User).save(emailLogin);
            //     return sendResponse(res, StatusCodes.OK, "Password Updated", updateUserWithEmail);
            // }
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // admin login 
    async adminLogin(req, res) {
        const { userName, password } = req?.body;
        try {
            const emailLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { email: userName, role: 1 }
            });
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName, role: 1 }
            });
            if (!emailLogin && !mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin) {
                const passwordMatch = await (0, generateHashPassword_1.matchPassword)(mobileLogin?.password, password);
                if (!passwordMatch) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }
                const token = jsonwebtoken_1.default.sign({ userId: mobileLogin?.id, role: mobileLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '48h' });
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
            }
            if (emailLogin) {
                const passwordMatch = await (0, generateHashPassword_1.matchPassword)(emailLogin?.password, password);
                if (!passwordMatch) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }
                const token = jsonwebtoken_1.default.sign({ userId: emailLogin?.id, role: emailLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Login Successfully", emailLogin, null, token);
            }
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // send otp for verify mobileNumber
    async sendVerifyMobileNumber(req, res) {
        try {
            const payload = req?.body;
            if (payload?.type == 'resendOtp') {
            }
            if (payload?.type == 'registerOtp') {
                const OTP = Math.floor(Math.random() * 9000) + 1000;
                const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
                let params = {
                    authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                    route: 'otp',
                    variables_values: String(OTP),
                    numbers: payload['mobile_no'],
                    flash: '0',
                };
                const response = await axios_1.default.get(baseURL, { params });
                if (response.status >= 200 && response.status < 300) {
                    return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Send Successfully", { ...response.data, otp: OTP });
                }
                else {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
                }
            }
            if (payload?.type !== 'resendOtp' && payload?.type !== 'registerOtp') {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
            }
        }
        catch (error) {
            console.log('errorerrorerrorerrorerror', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.AuthController = AuthController;
