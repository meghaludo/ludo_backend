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
class AuthController {
    // Login user
    async login(req, res) {
        const { userName, password } = req?.body;
        try {
            const emailLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { email: userName }
            });
            if (emailLogin && emailLogin?.status != 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (mobileLogin && mobileLogin?.status != 1) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User is Block Please contact To Administrator');
            }
            if (!emailLogin && !mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin) {
                const passwordMatch = await (0, generateHashPassword_1.matchPassword)(mobileLogin?.password, password);
                if (!passwordMatch) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }
                const token = jsonwebtoken_1.default.sign({ userId: mobileLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Login Successfully", mobileLogin, null, token);
            }
            if (emailLogin) {
                const passwordMatch = await (0, generateHashPassword_1.matchPassword)(emailLogin?.password, password);
                if (!passwordMatch) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid Credentials');
                }
                const token = jsonwebtoken_1.default.sign({ userId: emailLogin?.id }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Login Successfully", emailLogin, null, token);
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
            if (!userData['email'] && !userData['mobile_no']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, "Please Enter Mobile Number / Email.");
            }
            if (userData['email']) {
                const existingUserWithEmail = await data_source_1.default.getRepository(user_entity_1.User).findOne({ where: { email: String(req?.body?.email) } });
                if (existingUserWithEmail) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, "Email Already Exist");
                }
            }
            if (userData['mobile_no']) {
                const existingUserWithMobile = await data_source_1.default.getRepository(user_entity_1.User).findOne({ where: { mobile_no: String(req?.body?.mobile_no) } });
                if (existingUserWithMobile) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, "Mobile Number Already Exist");
                }
            }
            const enterUserData = {
                full_name: userData?.full_name || null,
                mobile_no: userData?.mobile_no || null,
                email: userData?.email || null,
                password: userData?.password || null,
            };
            const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(userData['password']);
            enterUserData['password'] = cryptoPassword;
            enterUserData['refer_code'] = (0, generateString_1.generateRandomString)(7);
            const userCreate = await data_source_1.default.getRepository(user_entity_1.User).save(enterUserData);
            if (!!userData?.code) {
                const userWithCode = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { refer_code: userData['code'] }
                });
                if (userWithCode) {
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
            const emailLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { email: userName }
            });
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!emailLogin && !mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin) {
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "UserName Verify Successfully", mobileLogin);
            }
            if (emailLogin) {
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "UserName Verify Successfully", emailLogin);
            }
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // forgot Password
    async forgotPassword(req, res) {
        const { userName, password } = req?.body;
        try {
            const emailLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { email: userName }
            });
            const mobileLogin = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { mobile_no: userName }
            });
            if (!emailLogin && !mobileLogin) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found Enter Valid UserName');
            }
            if (mobileLogin) {
                const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(password);
                mobileLogin['password'] = cryptoPassword;
                const updateUserWithMobileNumber = await data_source_1.default.getRepository(user_entity_1.User).save(mobileLogin);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Password Updated", updateUserWithMobileNumber);
            }
            if (emailLogin) {
                const cryptoPassword = (0, generateHashPassword_1.generateHashPassword)(password);
                emailLogin['password'] = cryptoPassword;
                const updateUserWithEmail = await data_source_1.default.getRepository(user_entity_1.User).save(emailLogin);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Password Updated", updateUserWithEmail);
            }
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
                const token = jsonwebtoken_1.default.sign({ userId: mobileLogin?.id, role: mobileLogin?.role }, "dHPaQEEL]Y]5X;HOAC[kF1DNF(9eC4vs", { expiresIn: '8h' });
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
}
exports.AuthController = AuthController;
