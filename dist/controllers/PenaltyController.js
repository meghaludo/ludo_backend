"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PenaltyController = void 0;
const http_status_codes_1 = require("http-status-codes");
const responseUtil_1 = require("../utils/responseUtil");
const message_1 = require("../constants/message");
const data_source_1 = __importDefault(require("../data-source"));
const wallet_entity_1 = require("../entity/wallet.entity");
const userPenalty_entiry_1 = require("../entity/userPenalty.entiry");
const user_entity_1 = require("../entity/user.entity");
class PenaltyController {
    // get penalty listing 
    async getPenaltyList(req, res) {
        try {
            const userId = req?.userId;
            const penaltyList = await data_source_1.default.getRepository(userPenalty_entiry_1.UserPenalty).find({
                where: { user_id: Number(userId) }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Penalty History Successfully.", penaltyList);
        }
        catch (error) {
            console.error('getPenaltyList : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // create penalty listing 
    async addPenalty(req, res) {
        try {
            const addPayload = req?.body;
            if (!addPayload?.amount) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Please Enter amount');
            }
            if (!addPayload?.title) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Please Enter title');
            }
            if (!addPayload?.message) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Please Enter message');
            }
            let userData = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: Number(addPayload?.user_id) }
            });
            if (!userData) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            if (Number(userData['amount']) < Number(addPayload?.amount)) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Penalty Amount To High Check User Wallet Amount');
            }
            const amount = Number(userData['amount']) - Number(addPayload?.amount);
            userData['amount'] = String(amount);
            await data_source_1.default.getRepository(user_entity_1.User).save(userData);
            const walletPayload = {
                user_id: addPayload?.user_id,
                amount: addPayload?.amount,
                status: 1,
                payment_type: 'penalty'
            };
            await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(walletPayload);
            const savedData = await data_source_1.default.getRepository(userPenalty_entiry_1.UserPenalty).save(addPayload);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Penalty Added Successfully.", savedData);
        }
        catch (error) {
            console.error('addPenalty : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.PenaltyController = PenaltyController;
