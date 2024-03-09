"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const http_status_codes_1 = require("http-status-codes");
const responseUtil_1 = require("../utils/responseUtil");
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entity/user.entity");
const message_1 = require("../constants/message");
const wallet_entity_1 = require("../entity/wallet.entity");
const withdraw_entity_1 = require("../entity/withdraw.entity");
const contactUs_entity_1 = require("../entity/contactUs.entity");
const gameTable_entity_1 = require("../entity/gameTable.entity");
const adminCommission_entity_1 = require("../entity/adminCommission.entity");
const referCommission_entity_1 = require("../entity/referCommission.entity");
const referUser_entiry_1 = require("../entity/referUser.entiry");
class AdminController {
    async updateAdmin(req, res) {
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
    // get user list
    async getUserList(req, res) {
        try {
            const userList = await data_source_1.default.getRepository(user_entity_1.User).find({
                where: { role: 0 }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User List Find Successfully", userList);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Change user status to admin
    async changeUserStatus(req, res) {
        const userData = req?.body;
        try {
            const existUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: userData?.id }
            });
            if (!existUser) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            existUser['status'] = userData?.status;
            const updateUser = await data_source_1.default.getRepository(user_entity_1.User).save(existUser);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Status Updated Successfully", updateUser);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get wallet list
    async getWalletList(req, res) {
        try {
            const walletList = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).find({
                relations: ['userDetail']
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Wallet History Find Successfully", walletList);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  approve money to wallet or decline monet to wallet
    async actionOnWallet(req, res) {
        try {
            const { id, status } = req?.body;
            const walletDetails = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).findOne({
                where: { id: id }
            });
            if (!walletDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Wallet Details Not Found');
            }
            if (walletDetails['status'] === 1 && status == 2) {
                const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: walletDetails?.user_id }
                });
                if (walletDetails['amount'] == '0' || !walletDetails['amount']) {
                    walletDetails['amount'] = '0';
                }
                const totalAmount = Number(userDetails['amount']) - Number(walletDetails['amount']);
                userDetails['amount'] = String(totalAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            }
            walletDetails['status'] = status;
            const walletAction = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(walletDetails);
            if (walletAction['status'] === 1) {
                const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: walletAction?.user_id }
                });
                if (walletAction['amount'] == '0' || !walletAction['amount']) {
                    walletAction['amount'] = '0';
                }
                const totalAmount = Number(userDetails['amount']) + Number(walletAction['amount']);
                userDetails['amount'] = String(totalAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Wallet Updated Successfully", walletAction);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get withdraw list
    async getWithdrawList(req, res) {
        try {
            const withdrawList = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).find({
                relations: ['userDetail']
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Withdraw History Find Successfully", withdrawList);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  approve money to wallet or decline monet to wallet
    async actionOnWithdraw(req, res) {
        try {
            const { id, status } = req?.body;
            const walletDetails = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).findOne({
                where: { id: id }
            });
            if (!walletDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Wallet Details Not Found');
            }
            if (walletDetails['status'] === 1 && status == 2) {
                const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: walletDetails?.user_id }
                });
                if (walletDetails['amount'] == '0' || !walletDetails['amount']) {
                    walletDetails['amount'] = '0';
                }
                const totalAmount = Number(userDetails['amount']) + Number(walletDetails['amount']);
                userDetails['amount'] = String(totalAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            }
            walletDetails['status'] = status;
            const walletAction = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).save(walletDetails);
            if (walletAction['status'] === 1) {
                const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: walletAction?.user_id }
                });
                if (walletAction['amount'] == '0' || !walletAction['amount']) {
                    walletAction['amount'] = '0';
                }
                const totalAmount = Number(userDetails['amount']) - Number(walletAction['amount']);
                userDetails['amount'] = String(totalAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Withdraw Updated Successfully", walletAction);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // add edit contact us
    async addEditContactUs(req, res) {
        try {
            const contactUsData = req?.body;
            const addEditContactData = await data_source_1.default.getRepository(contactUs_entity_1.ContactUs).save(contactUsData);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Edit Contact Details Successfully.", addEditContactData);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Get contact details
    async getContactUs(req, res) {
        try {
            const contactUsDetails = await data_source_1.default.getRepository(contactUs_entity_1.ContactUs).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Contact Details Successfully.", contactUsDetails[0]);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Get dashboard details 
    async getDashboardDetails(req, res) {
        try {
            // total user
            const totalUser = await data_source_1.default.getRepository(user_entity_1.User).count({
                where: { role: 0 },
            });
            // total play game  
            const gameList = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
            // where: [{ is_running: 1 }, { is_running: 2 }]
            });
            const totalPlayGame = gameList?.length;
            let adminCommissionAmount = 0;
            gameList?.map((element) => {
                adminCommissionAmount = Number(adminCommissionAmount) + Number(element?.admin_commission);
            });
            // admin commission
            const adminCommissionData = await data_source_1.default.getRepository(adminCommission_entity_1.AdminCommission).find();
            // total wallet amount
            const walletData = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).find({
                where: { status: 1 }
            });
            let totalWalletAmount = 0;
            walletData?.map((element) => {
                totalWalletAmount = Number(totalWalletAmount) + Number(element?.amount);
            });
            //  total withdrawal amount
            const withdrawData = await data_source_1.default.getRepository(withdraw_entity_1.Withdraw).find({
                where: { status: 1 }
            });
            let totalWithdrawAmount = 0;
            withdrawData?.map((element) => {
                totalWithdrawAmount = Number(totalWithdrawAmount) + Number(element?.amount);
            });
            // all details
            const dashBoardDetails = {
                totalUser: totalUser,
                totalPlayGame: totalPlayGame,
                adminCommission: adminCommissionData[0]?.commission,
                totalWallet: totalWalletAmount,
                totalWithdraw: totalWithdrawAmount,
                totalAdminCommission: adminCommissionAmount
            };
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully get dashboard details", dashBoardDetails);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // add edit commission details
    async addEditAdminCommission(req, res) {
        try {
            const commissionDetails = req?.body;
            const addEditCommissionDetails = await data_source_1.default.getRepository(adminCommission_entity_1.AdminCommission).save(commissionDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Edit Commission Details Successfully.", addEditCommissionDetails);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Get admin commission details
    async getAdminCommission(req, res) {
        try {
            const commissionDetails = await data_source_1.default.getRepository(adminCommission_entity_1.AdminCommission).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Commission Details Successfully.", commissionDetails[0]);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // add edit refer commission details
    async addEditReferCommission(req, res) {
        try {
            const commissionDetails = req?.body;
            console.log('commissionDetails', commissionDetails);
            const addEditCommissionDetails = await data_source_1.default.getRepository(referCommission_entity_1.ReferCommission).save(commissionDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Edit Refer Commission Details Successfully.", addEditCommissionDetails);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Get admin refer commission details
    async getReferAdminCommission(req, res) {
        try {
            const commissionDetails = await data_source_1.default.getRepository(referCommission_entity_1.ReferCommission).find();
            const numberOfReferUser = await data_source_1.default.getRepository(referUser_entiry_1.ReferTable).count({
                where: { refrence_user_id: req?.userId }
            });
            const response = {
                commissionDetails: commissionDetails[0],
                referUserCount: numberOfReferUser
            };
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Refer Commission Details Successfully.", response);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.AdminController = AdminController;
