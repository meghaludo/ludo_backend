import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { UserWallet } from "../entity/wallet.entity";
import { Withdraw } from "../entity/withdraw.entity";
import './../cron';

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

    // get user wallet Amount
    public async getWalletAmount(req:any, res:any) {
        try {
            const walletAmount = await AppDataSource.getRepository(User).findOne({
                where : { id : req?.userId }
            }); 

            return sendResponse(res, StatusCodes.OK, "User Wallet Amount Successfully Get", { walletAmount : walletAmount?.amount });
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // update user ludo name
    public async updateLudoName(req: any, res:any) {
        try {
            let { ludo_name , user_id } = req?.body;

            const getUser = await AppDataSource.getRepository(User).findOne({
                where : { id : user_id }
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