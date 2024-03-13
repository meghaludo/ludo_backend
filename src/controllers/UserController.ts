import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { UserWallet } from "../entity/wallet.entity";
import { Withdraw } from "../entity/withdraw.entity";
import './../cron';
import axios from "axios";

export class UserController {
    public async updateUser(req: any, res: any) {
        try {
            const userDetails = req?.body;

            const existUser: any = await AppDataSource.getRepository(User).findOne({
                where: { id: userDetails?.id }
            });

            if (!existUser) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            userDetails['full_name'] = userDetails['full_name'] || existUser['full_name'];
            userDetails['mobile_no'] = userDetails['mobile_no'] || existUser['mobile_no'];
            userDetails['email'] = userDetails['email'] || existUser['email'];
            userDetails['password'] = existUser['password'];
            userDetails['refer_code'] = existUser['refer_code'];
            userDetails['amount'] = existUser['amount'];
            userDetails['role'] = existUser['role'];

            const updateUser = await AppDataSource.getRepository(User).save(userDetails);
            return sendResponse(res, StatusCodes.OK, "Update User Successfully", updateUser);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  Add wallet amount
    public async addWalletAmount(req: any, res: any) {
        try {
            const walletDetails = req?.body;

            const addWallet = await AppDataSource.getRepository(UserWallet).save(walletDetails);

            return sendResponse(res, StatusCodes.OK, "Add Amount Successfully", addWallet);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Payment gateway
    public async cashFreeLink(req: any, res: any) {
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

            axios
                .request(options)
                .then(function (response) {
                    console.log('response.data', response.data);
                    return res.status(200).send(response.data.payment_session_id)
                })
                .catch(function (error) {
                    console.error('error', error);
                });

        } catch (error) {
            res.status(500).send({
                message: error,
                success: false
            })
        }
    }

    public async cashFree(req: any, res: any) {
        const { amount, user_id } = req.body;
        try {
            const orderId = 'ORID665456' + Date.now();
            const userDetails: any = await AppDataSource.getRepository(User).findOne({
                where: { id: Number(user_id) }
            });

            if (!userDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, INTERNAL_SERVER_ERROR);
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
                    send_sms: false,
                    send_email: false
                },
                // link_meta: {
                //     "return_url": `http://localhost:3000/#/home/verify-payment/${orderId}`,
                //     "notify_url": `http://localhost:3000/#/home/verify-payment/${orderId}`
                // },
                link_meta: {
                    "return_url": `https://test.megaludo24.com/#/home/verify-payment/${orderId}`,
                    "notify_url": `https://test.megaludo24.com/#/home/verify-payment/${orderId}`
                },
                link_id: orderId,
                link_amount: Number(amount),
                link_currency: 'INR',
                link_purpose: 'Payment for MegaLudo24',
                link_expiry_time: '2024-10-14T15:04:05+05:30',
            };

            const response = await axios.post('https://sandbox.cashfree.com/pg/links', requestData, { headers });
            // const response = await axios.post('https://api.cashfree.com/pg/links', requestData, { headers });

            if (response.status >= 200 && response.status < 300) {
                const addWallet = await AppDataSource.getRepository(UserWallet).save({ amount, user_id, order_id: orderId });
            }
            console.log('Cashfree Link created:', response.data);
            return sendResponse(res, StatusCodes.OK, "Add Amount Successfully", response?.data);
        } catch (error: any) {
            console.error('Error creating Cashfree Link:', error.response ? error.response.data : error.message);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Check payment status
    public async cashFreeStatus(req: any, res: any) {
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

            axios
                .request(options)
                .then(function (response) {
                    console.log('response.data === ', response.data);

                })
                .catch(function (error) {
                    console.log('console.error(error)')
                    return console.error(error);
                });

        } catch (error) {
            res.status(500).send({
                message: error,
                success: false
            })
        }
    }

    // find cash free payment details
    public async getCashFreeLink(req: any, res: any) {
        const linkId = req.params.orderId;
        try {

            const existingData: any = await AppDataSource.getRepository(UserWallet).findOne({
                where: { order_id: linkId }
            });

            if (!existingData) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Payment Details Not Found');
            }

            const headers = {
                accept: 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': 'TEST1014650891db9a9d32504b1fb9af80564101',
                'x-client-secret': 'cfsk_ma_test_e903537bff8bebbcbb92ca35f6788ffd_3177d7f2',
            };


            const response: any = await axios.get(`https://sandbox.cashfree.com/pg/links/${linkId}`, { headers });
            // const response: any = await axios.get(`https://api.cashfree.com/pg/links/${linkId}`, { headers });

            if (response.status >= 200 && response.status < 300) {
                // const getData: any = await AppDataSource.getRepository(UserWallet).findOne({
                //     where: { order_id: linkId }
                // });

                if (response?.data["link_status"] == "PAID") {
                    existingData['status'] = 1;
                    await AppDataSource.getRepository(UserWallet).save(existingData);

                    if (existingData['status'] == 1) {
                        const userDetails: any = await AppDataSource.getRepository(User).findOne({
                            where: { id: existingData?.user_id }
                        });

                        if (existingData['amount'] == '0' || !existingData['amount']) {
                            existingData['amount'] = '0';
                        }
                        const totalAmount = Number(userDetails['amount']) + Number(existingData['amount']);

                        userDetails['amount'] = String(totalAmount);

                        await AppDataSource.getRepository(User).save(userDetails);
                    }

                } else {
                    existingData['status'] = 2;
                    await AppDataSource.getRepository(UserWallet).save(existingData);
                }
            } else {
                existingData['status'] = 2;

                await AppDataSource.getRepository(UserWallet).save(existingData);
                console.error('Error fetching Cashfree Link details:', response.status, response.data);
            }

            return sendResponse(res, StatusCodes.OK, "Add Amount Successfully", response?.data);
        } catch (error: any) {
            console.error('EEEEEEEEEEEEEEEEEEEEEEEEEEE', error.response ? error.response.data : error.message);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }


    // get user wallet history
    public async walletHistory(req: any, res: any) {
        try {
            const walletHistory = await AppDataSource.getRepository(UserWallet).find({
                where: { user_id: req?.userId }
            });

            return sendResponse(res, StatusCodes.OK, "Wallet history", walletHistory);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  Add wallet amount
    public async addWithdrawRequest(req: any, res: any) {
        try {
            const withdrawDetails = req?.body;

            if (Number(withdrawDetails?.amount) < 190) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Withdraw Min Amount Rs. 190');
            }

            const addWithdraw = await AppDataSource.getRepository(Withdraw).save(withdrawDetails);

            return sendResponse(res, StatusCodes.OK, "Withdraw Amount Request Send Successfully", addWithdraw);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get user wallet history
    public async withdrawHistory(req: any, res: any) {
        try {
            const withdrawHistory = await AppDataSource.getRepository(Withdraw).find({
                where: { user_id: req?.userId }
            });

            return sendResponse(res, StatusCodes.OK, "Withdraw history", withdrawHistory);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get withdraw history
    public async getWithdrawDetails(req: any, res: any) {
        try {
            const details = await AppDataSource.getRepository(Withdraw).findOne({
                where: { id: Number(req.params.id) },
                relations: ['userDetail']
            });

            if (!details) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Details Not Found');
            }

            return sendResponse(res, StatusCodes.OK, "Withdraw Details Get Successfully", details);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get user wallet Amount
    public async getWalletAmount(req: any, res: any) {
        try {
            const walletAmount = await AppDataSource.getRepository(User).findOne({
                where: { id: req?.userId }
            });

            return sendResponse(res, StatusCodes.OK, "User Wallet Amount Successfully Get", { walletAmount: walletAmount?.amount });
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get user wallet Amount
    public async getAccountDetails(req: any, res: any) {
        try {
            const walletAmount = await AppDataSource.getRepository(Withdraw).findOne({
                where: { user_id : req?.userId }
            });

            if(!walletAmount) {
                errorResponse(res, StatusCodes.BAD_REQUEST, "Bank Details Not Found");
            }

            return sendResponse(res, StatusCodes.OK, "User Wallet Details Successfully Found", walletAmount);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // update user ludo name
    public async updateLudoName(req: any, res: any) {
        try {
            let { ludo_name, user_id } = req?.body;

            const getUser = await AppDataSource.getRepository(User).findOne({
                where: { id: user_id }
            });

            if (!getUser) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            getUser['ludo_name'] = ludo_name;

            await AppDataSource.getRepository(User).save(getUser);

            return sendResponse(res, StatusCodes.OK, "User Wallet Amount Successfully Get", { ludo_name: ludo_name })
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}