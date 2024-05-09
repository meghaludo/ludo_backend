"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const responseUtil_1 = require("../utils/responseUtil");
const message_1 = require("../constants/message");
const axios_1 = __importDefault(require("axios"));
const data_source_1 = __importDefault(require("../data-source"));
const payment_method_entity_1 = require("../entity/payment_method.entity");
const uuid_1 = require("uuid");
const user_entity_1 = require("../entity/user.entity");
const wallet_entity_1 = require("../entity/wallet.entity");
class PaymentController {
    // create payment order 
    async createOrder(req, res) {
        console.log('req', req?.body);
        try {
            const walletPayload = req?.body;
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: Number(walletPayload?.user_id) }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found.');
            }
            const uuid = (0, uuid_1.v4)();
            console.log('uuid', uuid);
            // fetch result form the from the ludo API
            const options = {
                method: 'POST',
                url: 'https://api.ekqr.in/api/create_order',
                data: {
                    "key": "b832d35a-159c-42a0-b9e4-e746867be96f",
                    "client_txn_id": uuid,
                    "amount": walletPayload?.amount,
                    "p_info": "Ludo Wallet Payment",
                    "customer_name": userDetails?.full_name,
                    "customer_email": userDetails?.email || "meghaludo@gmail.com",
                    "customer_mobile": userDetails?.mobile_no,
                    // "redirect_url" : `http://localhost:4200/#/home/verify-payment/${uuid}`,
                    "redirect_url": `https://test.megaludo24.com/#/home/verify-payment/${uuid}`,
                    "udf1": userDetails?.game_key,
                    "udf2": "user defined field 2 (max 25 char)",
                    "udf3": "user defined field 3 (max 25 char)"
                }
            };
            const paymentResponse = await axios_1.default.request(options);
            const creteWallet = {
                user_id: userDetails?.id,
                amount: walletPayload?.amount,
                status: 0,
                payment_type: 'recharge',
                client_txn_id: uuid
            };
            await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(creteWallet);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Create Order Successfully.", paymentResponse?.data);
        }
        catch (error) {
            console.error('addPenalty : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // create payment order 
    async getOrderStatus(req, res) {
        try {
            const statusPayload = req?.body;
            // fetch result form the from the ludo API
            const options = {
                method: 'POST',
                url: 'https://api.ekqr.in/api/check_order_status',
                data: {
                    "key": "b832d35a-159c-42a0-b9e4-e746867be96f",
                    "client_txn_id": statusPayload?.client_txn_id,
                    "txn_date": statusPayload?.date
                }
            };
            const paymentResponse = await axios_1.default.request(options);
            if (paymentResponse?.data?.data && paymentResponse?.data?.data?.status) {
                const getWalletData = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).findOne({
                    where: { client_txn_id: statusPayload?.client_txn_id }
                });
                if (paymentResponse?.data?.data?.status == 'created') {
                    getWalletData['status'] = 0;
                }
                if (paymentResponse?.data?.data?.status == 'success') {
                    getWalletData['status'] = 1;
                    const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                        where: { id: Number(statusPayload?.user_id) }
                    });
                    userDetails.amount = String(Number(userDetails.amount) + Number(paymentResponse?.data?.data?.amount));
                    await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
                }
                if (paymentResponse?.data?.data?.status == 'failure') {
                    getWalletData['status'] = 2;
                }
                await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(getWalletData);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Payment Status Verify Successfully.", paymentResponse?.data);
        }
        catch (error) {
            console.error('addPenalty : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get Payment Mobile
    async changePaymentMethod(req, res) {
        try {
            await data_source_1.default.query(`DELETE FROM payment_method`);
            const paymentMethodPayload = req?.body;
            console.log(paymentMethodPayload);
            const paymentMethod = await data_source_1.default.getRepository(payment_method_entity_1.PaymentMethod).save(paymentMethodPayload);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully change payment method.", paymentMethod);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get Payment Mobile
    async getActivePaymentGateway(req, res) {
        try {
            const getPaymentMethod = await data_source_1.default.getRepository(payment_method_entity_1.PaymentMethod).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully get payment method.", getPaymentMethod);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.PaymentController = PaymentController;
