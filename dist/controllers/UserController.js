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
const axios_1 = __importDefault(require("axios"));
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
    // Payment gateway
    async cashFreeLink(req, res) {
        try {
            const orderId = 'ORID665456' + Date.now();
            const options = {
                method: 'POST',
                url: 'https://sandbox.cashfree.com/pg/orders',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    'x-api-version': '2023-08-01',
                    'x-client-id': 'TEST1014650891db9a9d32504b1fb9af80564101',
                    'x-client-secret': 'cfsk_ma_test_e903537bff8bebbcbb92ca35f6788ffd_3177d7f2'
                },
                data: {
                    customer_details: {
                        customer_id: 'CID89898' + Date.now(),
                        customer_email: 'test@gmail.com',
                        customer_phone: '8000912849',
                        customer_name: 'Rahim Shekh'
                    },
                    order_meta: {
                        return_url: "http://localhost:4100/",
                    },
                    order_amount: 1,
                    order_id: orderId,
                    order_currency: 'INR',
                    order_note: 'This is my first Order',
                }
            };
            axios_1.default
                .request(options)
                .then(function (response) {
                console.log('response.data', response.data);
                return res.status(200).send(response.data.payment_session_id);
            })
                .catch(function (error) {
                console.error('error', error);
            });
        }
        catch (error) {
            res.status(500).send({
                message: error,
                success: false
            });
        }
    }
    async cashFree(req, res) {
        const { amount, user_id } = req.body;
        try {
            const orderId = 'ORID665456' + Date.now();
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: Number(user_id) }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, message_1.INTERNAL_SERVER_ERROR);
            }
            const headers = {
                accept: 'application/json',
                'content-type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': 'TEST1014650891db9a9d32504b1fb9af80564101',
                'x-client-secret': 'cfsk_ma_test_e903537bff8bebbcbb92ca35f6788ffd_3177d7f2',
            };
            const requestData = {
                customer_details: {
                    customer_phone: userDetails.mobile_no,
                    customer_email: userDetails.email,
                    customer_name: userDetails.full_name
                },
                link_notify: {
                    send_sms: true,
                    send_email: false
                },
                // link_meta: {
                //     "return_url": "http://localhost:4200/#/login",
                //     "notify_url": "http://localhost:4200/#/login"
                // },
                link_meta: {
                    "return_url": `https://test.megaludo24.com/#/home/verify-payment/${orderId}`,
                    "notify_url": `https://test.megaludo24.com/#/home/verify-payment/${orderId}`
                },
                link_id: orderId,
                link_amount: Number(amount),
                link_currency: 'INR',
                link_purpose: 'Payment for PlayStation 11',
                link_expiry_time: '2024-10-14T15:04:05+05:30',
            };
            const response = await axios_1.default.post('https://sandbox.cashfree.com/pg/links', requestData, { headers });
            if (response.status >= 200 && response.status < 300) {
                const addWallet = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save({ amount, user_id, order_id: orderId });
            }
            console.log('Cashfree Link created:', response.data);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Amount Successfully", response?.data);
        }
        catch (error) {
            console.error('Error creating Cashfree Link:', error.response ? error.response.data : error.message);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // Check payment status
    async cashFreeStatus(req, res) {
        const orderId = req.params.orderId;
        try {
            const options = {
                method: 'GET',
                url: `https://sandbox.cashfree.com/pg/orders/${orderId}`,
                headers: {
                    accept: 'application/json',
                    'x-api-version': '2023-08-01',
                    'x-client-id': 'TEST1014650891db9a9d32504b1fb9af80564101',
                    'x-client-secret': 'cfsk_ma_test_e903537bff8bebbcbb92ca35f6788ffd_3177d7f2'
                }
            };
            axios_1.default
                .request(options)
                .then(function (response) {
                console.log('response.data === ', response.data);
            })
                .catch(function (error) {
                console.log('console.error(error)');
                return console.error(error);
            });
        }
        catch (error) {
            res.status(500).send({
                message: error,
                success: false
            });
        }
    }
    async getCashFreeLink(req, res) {
        const linkId = req.params.orderId;
        try {
            const headers = {
                accept: 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': 'TEST1014650891db9a9d32504b1fb9af80564101',
                'x-client-secret': 'cfsk_ma_test_e903537bff8bebbcbb92ca35f6788ffd_3177d7f2',
            };
            const response = await axios_1.default.get(`https://sandbox.cashfree.com/pg/links/${linkId}`, { headers });
            if (response.status >= 200 && response.status < 300) {
                const getData = await data_source_1.default.getRepository(wallet_entity_1.UserWallet).findOne({
                    where: { order_id: linkId }
                });
                if (response?.data["link_status"] == "PAID") {
                    getData['status'] = 1;
                    await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(getData);
                    if (getData['status'] == 1) {
                        const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                            where: { id: getData?.user_id }
                        });
                        if (getData['amount'] == '0' || !getData['amount']) {
                            getData['amount'] = '0';
                        }
                        const totalAmount = Number(userDetails['amount']) + Number(getData['amount']);
                        userDetails['amount'] = String(totalAmount);
                        await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
                    }
                }
                else {
                    getData['status'] = 2;
                    await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(getData);
                }
            }
            else {
                console.error('Error fetching Cashfree Link details:', response.status, response.data);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Add Amount Successfully", response?.data);
        }
        catch (error) {
            console.error('Error fetching Cashfree Link details:', error.response ? error.response.data : error.message);
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
