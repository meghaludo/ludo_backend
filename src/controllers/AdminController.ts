import { StatusCodes } from "http-status-codes";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { UserWallet } from "../entity/wallet.entity";
import { Withdraw } from "../entity/withdraw.entity";
import { ContactUs } from "../entity/contactUs.entity";
import { GameTable } from "../entity/gameTable.entity";
import { AdminCommission } from "../entity/adminCommission.entity";
import { ReferCommission } from "../entity/referCommission.entity";
import { ReferTable } from "../entity/referUser.entiry";
import { GamePlayer } from "../entity/gamePlayer.entity";
import { GameStatus } from "../constants/gameStatus";

export class AdminController {
    public async updateAdmin(req: any, res: any) {
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

    // get user list
    public async getUserList(req: any, res: any) {
        try {
            const userList = await AppDataSource.getRepository(User).find({
                where: { role: 0 }
            });
            return sendResponse(res, StatusCodes.OK, "User List Find Successfully", userList);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Change user status to admin
    public async changeUserStatus(req: any, res: any) {
        const userData = req?.body;
        try {
            const existUser: any = await AppDataSource.getRepository(User).findOne({
                where: { id: userData?.id }
            });

            if (!existUser) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            existUser['status'] = userData?.status;

            const updateUser = await AppDataSource.getRepository(User).save(existUser);

            return sendResponse(res, StatusCodes.OK, "User Status Updated Successfully", updateUser);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }


    // get wallet list
    public async getWalletList(req: any, res: any) {
        try {
            const walletList = await AppDataSource.getRepository(UserWallet).find({
                relations: ['userDetail']
            });
            return sendResponse(res, StatusCodes.OK, "User Wallet History Find Successfully", walletList);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  approve money to wallet or decline monet to wallet
    public async actionOnWallet(req: any, res: any) {
        try {
            const { id, status } = req?.body;

            const walletDetails = await AppDataSource.getRepository(UserWallet).findOne({
                where: { id: id }
            });

            if (!walletDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Wallet Details Not Found');
            }

            if (walletDetails['status'] === 1 && status == 2) {
                const userDetails: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: walletDetails?.user_id }
                });

                if (walletDetails['amount'] == '0' || !walletDetails['amount']) {
                    walletDetails['amount'] = '0';
                }

                const totalAmount = Number(userDetails['amount']) - Number(walletDetails['amount']);

                userDetails['amount'] = String(totalAmount);

                await AppDataSource.getRepository(User).save(userDetails);
            }

            walletDetails['status'] = status;

            const walletAction = await AppDataSource.getRepository(UserWallet).save(walletDetails);

            if (walletAction['status'] === 1) {
                const userDetails: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: walletAction?.user_id }
                });

                if (walletAction['amount'] == '0' || !walletAction['amount']) {
                    walletAction['amount'] = '0';
                }

                const totalAmount = Number(userDetails['amount']) + Number(walletAction['amount']);

                userDetails['amount'] = String(totalAmount);

                await AppDataSource.getRepository(User).save(userDetails);
            }

            return sendResponse(res, StatusCodes.OK, "User Wallet Updated Successfully", walletAction);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }


    // get withdraw list
    public async getWithdrawList(req: any, res: any) {
        try {
            const withdrawList = await AppDataSource.getRepository(Withdraw).find({
                relations: ['userDetail']
            });
            return sendResponse(res, StatusCodes.OK, "User Withdraw History Find Successfully", withdrawList);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }


    //  approve money to wallet or decline monet to wallet
    public async actionOnWithdraw(req: any, res: any) {
        try {
            const { id, status } = req?.body;

            const walletDetails = await AppDataSource.getRepository(Withdraw).findOne({
                where: { id: id }
            });

            if (!walletDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Wallet Details Not Found');
            }

            if (walletDetails['status'] === 1 && status == 2) {
                const userDetails: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: walletDetails?.user_id }
                });

                if (walletDetails['amount'] == '0' || !walletDetails['amount']) {
                    walletDetails['amount'] = '0';
                }

                const totalAmount = Number(userDetails['amount']) + Number(walletDetails['amount']);

                userDetails['amount'] = String(totalAmount);

                await AppDataSource.getRepository(User).save(userDetails);
            }

            walletDetails['status'] = status;

            const walletAction = await AppDataSource.getRepository(Withdraw).save(walletDetails);

            if (walletAction['status'] === 1) {
                const userDetails: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: walletAction?.user_id }
                });

                if (walletAction['amount'] == '0' || !walletAction['amount']) {
                    walletAction['amount'] = '0';
                }

                const totalAmount = Number(userDetails['amount']) - Number(walletAction['amount']);

                userDetails['amount'] = String(totalAmount);

                await AppDataSource.getRepository(User).save(userDetails);
            }

            return sendResponse(res, StatusCodes.OK, "User Withdraw Updated Successfully", walletAction);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // add edit contact us
    public async addEditContactUs(req: any, res: any) {
        try {
            const contactUsData = req?.body;

            const addEditContactData = await AppDataSource.getRepository(ContactUs).save(contactUsData);

            return sendResponse(res, StatusCodes.OK, "Add Edit Contact Details Successfully.", addEditContactData);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Get contact details
    public async getContactUs(req: any, res: any) {
        try {
            const contactUsDetails = await AppDataSource.getRepository(ContactUs).find();

            return sendResponse(res, StatusCodes.OK, "Get Contact Details Successfully.", contactUsDetails[0]);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Get dashboard details 
    public async getDashboardDetails(req: any, res: any) {
        try {

            // total user
            const totalUser = await AppDataSource.getRepository(User).count({
                where: { role: 0 },
            });

            // total play game  
            const gameList = await AppDataSource.getRepository(GameTable).find({
                // where: [{ is_running: 1 }, { is_running: 2 }]
            })

            const totalPlayGame = gameList?.length;

            let adminCommissionAmount = 0;

            gameList?.map((element) => {
                adminCommissionAmount = Number(adminCommissionAmount) + Number(element?.admin_commission);
            });

            // admin commission
            const adminCommissionData = await AppDataSource.getRepository(AdminCommission).find();

            // total wallet amount
            const walletData = await AppDataSource.getRepository(UserWallet).find({
                where: { status: 1 }
            });

            let totalWalletAmount = 0;

            walletData?.map((element) => {
                totalWalletAmount = Number(totalWalletAmount) + Number(element?.amount);
            });

            //  total withdrawal amount
            const withdrawData = await AppDataSource.getRepository(Withdraw).find({
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
            }

            return sendResponse(res, StatusCodes.OK, "Successfully get dashboard details", dashBoardDetails);

        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // add edit commission details
    public async addEditAdminCommission(req: any, res: any) {
        try {
            const commissionDetails = req?.body;

            const addEditCommissionDetails = await AppDataSource.getRepository(AdminCommission).save(commissionDetails);

            return sendResponse(res, StatusCodes.OK, "Add Edit Commission Details Successfully.", addEditCommissionDetails);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Get admin commission details
    public async getAdminCommission(req: any, res: any) {
        try {
            const commissionDetails = await AppDataSource.getRepository(AdminCommission).find();

            return sendResponse(res, StatusCodes.OK, "Get Commission Details Successfully.", commissionDetails[0]);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // add edit refer commission details
    public async addEditReferCommission(req: any, res: any) {
        try {
            const commissionDetails = req?.body;
            const addEditCommissionDetails = await AppDataSource.getRepository(ReferCommission).save(commissionDetails);

            return sendResponse(res, StatusCodes.OK, "Add Edit Refer Commission Details Successfully.", addEditCommissionDetails);
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // Get admin refer commission details
    public async getReferAdminCommission(req: any, res: any) {
        try {
            const commissionDetails = await AppDataSource.getRepository(ReferCommission).find();

            const referCommission: any = commissionDetails?.length > 0 ? commissionDetails[0] : {};

            return sendResponse(res, StatusCodes.OK, "Get Refer Commission Details Successfully.", referCommission);
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // admin upload custom result
    public async verifyResult(req: any, res: any) {
        try {
            const resultDetails = req?.body;

            const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: resultDetails.game_table_id }
            });

            resultDetails?.playerDetails?.map(async (element: any) => {
                const playerDetails: any = await AppDataSource.getRepository(GamePlayer).findOne({
                    where: { p_id: element.id, game_table_id: resultDetails.game_table_id }
                });

                if(playerDetails['p_status'] != '6' && element?.status == '6') {
                    playerDetails['p_status'] = element?.status;

                    const updatePlayer = await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    
                    if (updatePlayer['p_status'] == '6') {
                        const userDetails: any = await AppDataSource.getRepository(User).findOne({
                            where: { id: element?.id }
                        });
    
                        if (gameDetails['winner_amount'] == '0' || !gameDetails['winner_amount']) {
                            gameDetails['winner_amount'] = '0';
                        }
                        const totalAmount = Number(userDetails['amount']) + Number(gameDetails['winner_amount']);
    
                        userDetails['amount'] = String(totalAmount);
    
                        await AppDataSource.getRepository(User).save(userDetails);
                    }
                } if (playerDetails['p_status'] == '6' && element?.status == '6') {
                    playerDetails['p_status'] = element?.status;

                    await AppDataSource.getRepository(GamePlayer).save(playerDetails);
                } if (playerDetails['p_status'] == '6' && element?.status == '7') {
                    playerDetails['p_status'] = element?.status;

                    const updatePlayer = await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    
                    if (updatePlayer['p_status'] == '7') {
                        const userDetails: any = await AppDataSource.getRepository(User).findOne({
                            where: { id: element?.id }
                        });
    
                        if (gameDetails['winner_amount'] == '0' || !gameDetails['winner_amount']) {
                            gameDetails['winner_amount'] = '0';
                        }
                        const totalAmount = Number(userDetails['amount']) - Number(gameDetails['winner_amount']);
    
                        userDetails['amount'] = String(totalAmount);
    
                        await AppDataSource.getRepository(User).save(userDetails);
                    }
                } else {
                    playerDetails['p_status'] = element?.status;

                    await AppDataSource.getRepository(GamePlayer).save(playerDetails);
                }
            });

            gameDetails['status'] = GameStatus.Completed;

            const updateGameStatus = await AppDataSource.getRepository(GameTable).save(gameDetails);

            return sendResponse(res, StatusCodes.OK, "Get Refer Commission Details Successfully.", updateGameStatus);
        } catch (error) {
            console.log('error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}