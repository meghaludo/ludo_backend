"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const responseUtil_1 = require("../utils/responseUtil");
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entity/user.entity");
const message_1 = require("../constants/message");
const wallet_entity_1 = require("../entity/wallet.entity");
const withdraw_entity_1 = require("../entity/withdraw.entity");
require("./../cron");
class UserController {
    async updateUser(req, res) {
        try {
            const userDetails = req?.body;
            const existUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: userDetails?.id }
            });
            if (!existUser) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            userDetails['full_name'] = userDetails['full_name'] || existUser['full_name'];
            userDetails['mobile_no'] = userDetails['mobile_no'] || existUser['mobile_no'];
            userDetails['email'] = userDetails['email'] || existUser['email'];
            userDetails['password'] = existUser['password'];
            userDetails['refer_code'] = existUser['refer_code'];
            userDetails['amount'] = existUser['amount'];
            userDetails['role'] = existUser['role'];
            const updateUser = await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Update User Successfully", updateUser);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  Add wallet amount
    async addWalletAmount(req, res) {
        try {
            const walletDetails = req?.body;
            const addWallet = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(walletDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Amount Successfully", addWallet);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get user wallet history
    async walletHistory(req, res) {
        try {
            const walletHistory = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).find({
                where: { user_id: req?.userId }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Wallet history", walletHistory);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  Add wallet amount
    async addWithdrawRequest(req, res) {
        try {
            const withdrawDetails = req?.body;
            const addWithdraw = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).save(withdrawDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Withdraw Amount Request Send Successfully", addWithdraw);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get user wallet history
    async withdrawHistory(req, res) {
        try {
            const withdrawHistory = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).find({
                where: { user_id: req?.userId }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Withdraw history", withdrawHistory);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get user wallet Amount
    async getWalletAmount(req, res) {
        try {
            const walletAmount = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: req?.userId }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Wallet Amount Successfully Get", { walletAmount: walletAmount?.amount });
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // update user ludo name
    async updateLudoName(req, res) {
        try {
            let { ludo_name, user_id } = req?.body;
            const getUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: user_id }
            });
            if (!getUser) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            getUser['ludo_name'] = ludo_name;
            await data_source_1.default.getRepository(user_entity_1.User).save(getUser);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Wallet Amount Successfully Get", { ludo_name: ludo_name });
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.UserController = UserController;
