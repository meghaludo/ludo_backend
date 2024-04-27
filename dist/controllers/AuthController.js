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
        }
        catch (error) {
            console.log('errror', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // verify OTP
    async verifyOTP(req, res) {
        const { userName, otp, type } = req?.body;
        try {
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'User Not Found');
            }
            if (type == 'registerOTP') {
                if (mobileLogin['otp'] == String(otp)) {
                    mobileLogin['otp'] = null;
                    mobileLogin['status'] = 1;
                    const userData = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                    return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Verify Successfully", userData);
                }
                else {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Invalid OTP');
                }
            }
            if (type == 'forgotPassword') {
                if (mobileLogin && mobileLogin?.status != 1) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
                }
                if (mobileLogin['otp'] == String(otp)) {
                    mobileLogin['otp'] = null;
                    const userData = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                    return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Verify Successfully", userData);
                }
                else {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Invalid OTP');
                }
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
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Please Enter Mobile Number.");
            }
            const existingUserWithMobile = await data_source_1.default.getRepository(user_entity_1.User).findOne({ where: { mobile_no: String(req?.body?.mobile_no) } });
            if (existingUserWithMobile && existingUserWithMobile['status'] == 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, "Mobile Number Already Exist");
            }
            // if user not active and verify OTP 
            if (existingUserWithMobile && existingUserWithMobile['status'] == 0) {
                // opt send functionality
                const OTP = Math.floor(Math.random() * 9000) + 1000;
                const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
                let params = {
                    authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                    route: 'otp',
                    variables_values: String(OTP),
                    numbers: existingUserWithMobile['mobile_no'],
                    flash: '0',
                };
                const response = await axios_1.default.get(baseURL, { params });
                if (response.status >= 200 && response.status < 300) {
                    existingUserWithMobile['full_name'] = userData?.full_name || null;
                    existingUserWithMobile['otp'] = String(OTP);
                    existingUserWithMobile['email'] = userData?.email || null;
                    existingUserWithMobile['status'] = 0;
                    const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(userData['password']);
                    existingUserWithMobile['password'] = cryptoPassword;
                    let userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(existingUserWithMobile);
                    if (!!userData?.code && existingUserWithMobile?.reference_user_id == 0) {
                        const userWithCode = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                            where: { refer_code: userData['code'] }
                        });
                        if (userWithCode) {
                            userWithCode['reference_user_id'] = userWithCode?.id;
                            const referTableData = {
                                user_id: userCreate?.id,
                                refrence_user_id: userWithCode?.id,
                                code: userData['code']
                            };
                            await data_source_1.default.getRepository(referUser_entiry_1.ReferTable).save(referTableData);
                            userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(userWithCode);
                        }
                    }
                    return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, 'Login Successfully', userCreate);
                }
                else {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
                }
            }
            if (!existingUserWithMobile) {
                // opt send functionality
                const OTP = Math.floor(Math.random() * 9000) + 1000;
                const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
                let params = {
                    authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                    route: 'otp',
                    variables_values: String(OTP),
                    numbers: userData['mobile_no'],
                    flash: '0',
                };
                const response = await axios_1.default.get(baseURL, { params });
                if (response?.status >= 200 && response?.status < 300) {
                    const enterUserData = {
                        full_name: userData?.full_name || null,
                        ludo_name: userData?.full_name || 'test',
                        mobile_no: userData?.mobile_no || null,
                        email: userData?.email || null,
                        otp: String(OTP),
                        password: userData?.password || null,
                        game_key: `megaludo24${(0, generateString_1.generateRandomNumberString)(15)}`,
                        status: 0
                    };
                    const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(userData['password']);
                    enterUserData['password'] = cryptoPassword;
                    enterUserData['refer_code'] = (0, generateString_1.generateRandomString)(7);
                    let userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(enterUserData);
                    if (!!userData?.code) {
                        const userWithCode = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                            where: { refer_code: userData['code'] }
                        });
                        if (userWithCode) {
                            userWithCode['reference_user_id'] = userWithCode?.id;
                            const referTableData = {
                                user_id: userCreate?.id,
                                refrence_user_id: userWithCode?.id,
                                code: userData['code']
                            };
                            await data_source_1.default.getRepository(referUser_entiry_1.ReferTable).save(referTableData);
                            userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(userWithCode);
                        }
                    }
                    return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, 'Login Successfully', userCreate);
                }
                else {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
                }
            }
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // verify user name
    async verifyUserName(req, res) {
        const { userName } = req?.body;
        try {
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin && mobileLogin?.status != 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }
            const OTP = Math.floor(Math.random() * 9000) + 1000;
            const baseURL = 'https://www.fast2sms.com/dev/bulkV2';
            let params = {
                authorization: 'CwYEiWkHmg7a3PyTB1xGvzI2JMn0Zsf59eqSXuNOFDbdcAhrpjcuzXOTbvmgIG6kLn2D7SdVwAtJohZU',
                route: 'otp',
                variables_values: String(OTP),
                numbers: mobileLogin['mobile_no'],
                flash: '0',
            };
            const response = await axios_1.default.get(baseURL, { params });
            if (response.status >= 200 && response.status < 300) {
                mobileLogin['otp'] = String(OTP);
                let userData = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Send Successfully", userData);
            }
            else {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Please Retry After Sometime');
            }
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // forgot Password
    async forgotPassword(req, res) {
        const { userName, password } = req?.body;
        try {
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
    async resendOTP(req, res) {
        try {
            const payload = req?.body;
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: payload?.userName }
            });
            if (!mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
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
                mobileLogin['otp'] = String(OTP);
                const updateUser = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "OTP Send Successfully", updateUser);
            }
            else {
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
