import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import axios from "axios";
import AppDataSource from "../data-source";
import { PaymentMethod } from "../entity/payment_method.entity";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../entity/user.entity";
import { UserWallet } from "../entity/wallet.entity";

export class PaymentController {
    // create payment order 
    public async createOrder(req: any, res: any) {
        console.log('req', req?.body)
        try {
            const walletPayload = req?.body;

            const userDetails: any = await AppDataSource.getRepository(User).findOne({
                where: { id: Number(walletPayload?.user_id) }
            });

            if (!userDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found.');
            }
            const uuid = uuidv4();

            console.log('uuid', uuid)

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

            const paymentResponse: any = await axios.request(options);

            const creteWallet: any = {
                user_id: userDetails?.id,
                amount: walletPayload?.amount,
                status: 0,
                payment_type: 'recharge',
                client_txn_id: uuid
            }

            await AppDataSource.getRepository(UserWallet).save(creteWallet);

            return sendResponse(res, StatusCodes.OK, "Create Order Successfully.", paymentResponse?.data);
        } catch (error) {
            console.error('addPenalty : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // create payment order 
    public async getOrderStatus(req: any, res: any) {
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

            const paymentResponse: any = await axios.request(options);

            if (paymentResponse?.data?.data && paymentResponse?.data?.data?.status) {
                const getWalletData: any = await AppDataSource.getRepository(UserWallet).findOne({
                    where: { client_txn_id: statusPayload?.client_txn_id }
                });

                if (paymentResponse?.data?.data?.status == 'created') {
                    getWalletData['status'] = 0
                }

                if (paymentResponse?.data?.data?.status == 'success') {
                    getWalletData['status'] = 1

                    const userDetails: any = await AppDataSource.getRepository(User).findOne({
                        where: { id: Number(statusPayload?.user_id) }
                    })
                    userDetails.amount = String(Number(userDetails.amount) + Number(paymentResponse?.data?.data?.amount));
                    await AppDataSource.getRepository(User).save(userDetails);
                }

                if (paymentResponse?.data?.data?.status == 'failure') {
                    getWalletData['status'] = 2
                }

                await AppDataSource.getRepository(UserWallet).save(getWalletData);
            }

            return sendResponse(res, StatusCodes.OK, "Payment Status Verify Successfully.", paymentResponse?.data);
        } catch (error) {
            console.error('addPenalty : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }


    // get Payment Mobile
    public async changePaymentMethod(req: any, res: any) {
        try {
            await AppDataSource.query(`DELETE FROM payment_method`);

            const paymentMethodPayload = req?.body;
            console.log(paymentMethodPayload);

            const paymentMethod = await AppDataSource.getRepository(PaymentMethod).save(paymentMethodPayload);

            return sendResponse(res, StatusCodes.OK, "Successfully change payment method.", paymentMethod);
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get Payment Mobile
    public async getActivePaymentGateway(req: any, res: any) {
        try {
            const getPaymentMethod = await AppDataSource.getRepository(PaymentMethod).find();

            return sendResponse(res, StatusCodes.OK, "Successfully get payment method.", getPaymentMethod);
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}