import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import AppDataSource from "../data-source";
import { UserWallet } from "../entity/wallet.entity";
import { UserPenalty } from "../entity/userPenalty.entiry";
import { User } from "../entity/user.entity";

export class PenaltyController {
    // get penalty listing 
    public async getPenaltyList(req: any, res: any) {
        try {
            const userId = req?.userId;

            const penaltyList = await AppDataSource.getRepository(UserPenalty).find({
                where: { user_id: Number(userId) }
            });

            return sendResponse(res, StatusCodes.OK, "Penalty History Successfully.", penaltyList);
        } catch (error) {
            console.error('getPenaltyList : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // create penalty listing 
    public async addPenalty(req: any, res: any) {
        try {
            const addPayload = req?.body;

            if (!addPayload?.amount) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Please Enter amount');
            }

            if (!addPayload?.title) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Please Enter title');
            }

            if (!addPayload?.message) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Please Enter message');
            }

            let userData: any = await AppDataSource.getRepository(User).findOne({
                where: { id: Number(addPayload?.user_id) }
            });

            if (!userData) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            if (Number(userData['amount']) < Number(addPayload?.amount)) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Penalty Amount To High Check User Wallet Amount');
            }

            const amount = Number(userData['amount']) - Number(addPayload?.amount);
            userData['amount'] = String(amount);

            await AppDataSource.getRepository(User).save(userData);

            const walletPayload = {
                user_id: addPayload?.user_id,
                amount: addPayload?.amount,
                status : 1,
                payment_type: 'penalty'
            }
            await AppDataSource.getRepository(UserWallet).save(walletPayload);

            const savedData = await AppDataSource.getRepository(UserPenalty).save(addPayload);
            return sendResponse(res, StatusCodes.OK, "Penalty Added Successfully.", savedData);
        } catch (error) {
            console.error('addPenalty : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}