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
const gamePlayer_entity_1 = require("../entity/gamePlayer.entity");
const gameStatus_1 = require("../constants/gameStatus");
const typeorm_1 = require("typeorm");
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
            let whereCondition = {};
            if (req?.query?.search) {
                whereCondition = [
                    {
                        full_name: (0, typeorm_1.ILike)(`%${req?.query?.search}%`),
                        role: 0,
                    },
                    {
                        game_key: (0, typeorm_1.ILike)(`%${req?.query?.search}%`),
                        role: 0
                    }
                ];
            }
            else {
                whereCondition = { role: 0 };
            }
            const userList = await data_source_1.default.getRepository(user_entity_1.User).find({
                where: whereCondition
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
            const referCommission = commissionDetails?.length > 0 ? commissionDetails[0] : {};
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Refer Commission Details Successfully.", referCommission);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // admin upload custom result
    // public async verifyResult(req: any, res: any) {
    //     try {
    //         const resultDetails = req?.body;
    //         const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
    //             where: { id: resultDetails.game_table_id }
    //         });
    //         resultDetails?.playerDetails?.map(async (element: any) => {
    //             const playerDetails: any = await AppDataSource.getRepository(GamePlayer).findOne({
    //                 where: { p_id: element.id, game_table_id: resultDetails.game_table_id }
    //             });
    //             if (playerDetails['p_status'] != '6' && element?.status == '6') {
    //                 playerDetails['p_status'] = element?.status;
    //                 const updatePlayer = await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    //                 if (updatePlayer['p_status'] == '6') {
    //                     const userDetails: any = await AppDataSource.getRepository(User).findOne({
    //                         where: { id: element?.id }
    //                     });
    //                     if (gameDetails['winner_amount'] == '0' || !gameDetails['winner_amount']) {
    //                         gameDetails['winner_amount'] = '0';
    //                     }
    //                     const totalAmount = Number(userDetails['amount']) + Number(gameDetails['winner_amount']);
    //                     userDetails['amount'] = String(totalAmount);
    //                     await AppDataSource.getRepository(User).save(userDetails);
    //                 }
    //             } if (playerDetails['p_status'] == '6' && element?.status == '6') {
    //                 playerDetails['p_status'] = element?.status;
    //                 await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    //             } if (playerDetails['p_status'] == '6' && element?.status == '7') {
    //                 playerDetails['p_status'] = element?.status;
    //                 const updatePlayer = await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    //                 if (updatePlayer['p_status'] == '7') {
    //                     const userDetails: any = await AppDataSource.getRepository(User).findOne({
    //                         where: { id: element?.id }
    //                     });
    //                     if (gameDetails['winner_amount'] == '0' || !gameDetails['winner_amount']) {
    //                         gameDetails['winner_amount'] = '0';
    //                     }
    //                     const totalAmount = Number(userDetails['amount']) - Number(gameDetails['winner_amount']);
    //                     userDetails['amount'] = String(totalAmount);
    //                     await AppDataSource.getRepository(User).save(userDetails);
    //                 }
    //             } else {
    //                 playerDetails['p_status'] = element?.status;
    //                 await AppDataSource.getRepository(GamePlayer).save(playerDetails);
    //             }
    //         });
    //         gameDetails['status'] = GameStatus.Completed;
    //         const updateGameStatus = await AppDataSource.getRepository(GameTable).save(gameDetails);
    //         return sendResponse(res, StatusCodes.OK, "Get Refer Commission Details Successfully.", updateGameStatus);
    //     } catch (error) {
    //         console.log('error', error);
    //         return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
    //     }
    // }
    async verifyResult(req, res) {
        try {
            const resultDetails = req?.body;
            const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: resultDetails.game_table_id }
            });
            const playerList = resultDetails?.playerDetails;
            const playerDetailsLegth = playerList.length;
            for (let i = 0; i < playerDetailsLegth; i++) {
                const playerDetails = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).findOne({
                    where: { p_id: playerList[i].id, game_table_id: resultDetails.game_table_id }
                });
                if (playerDetails['p_status'] != '6' && playerList[i].status == '6') {
                    playerDetails['p_status'] = playerList[i]?.status;
                    await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(playerDetails);
                    const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                        where: { id: playerList[i]?.id }
                    });
                    let winningAmount = !gameDetails['winner_amount'] ? '0' : gameDetails['winner_amount'];
                    const totalAmount = Number(userDetails['amount']) + Number(winningAmount);
                    userDetails['amount'] = String(totalAmount);
                    await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
                }
                else if (playerDetails['p_status'] == '6' && playerList[i]?.status == '7') {
                    playerDetails['p_status'] = playerList[i]?.status;
                    await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(playerDetails);
                    const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                        where: { id: playerList[i]?.id }
                    });
                    let winningAmount = !gameDetails['winner_amount'] ? '0' : gameDetails['winner_amount'];
                    const totalAmount = Number(userDetails['amount']) - Number(winningAmount);
                    userDetails['amount'] = String(totalAmount);
                    await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
                }
                else {
                    playerDetails['p_status'] = playerList[i]?.status;
                    await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(playerDetails);
                }
            }
            gameDetails['status'] = gameStatus_1.GameStatus.Completed;
            const updateGameStatus = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Refer Commission Details Successfully.", updateGameStatus);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // admin add money to user's wallet
    async addMoneyToWallet(req, res) {
        try {
            if (!req.body['game_key']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Game key is required");
            }
            if (!req.body['amount']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Amount is required");
            }
            if (req.body['amount'] < 200) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Minimum Amount should be Rs. 200");
            }
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { game_key: req.body['game_key'] }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Details Not Found');
            }
            const userWallet = data_source_1.default.getRepository(wallet_entity_1.UserWallet).create({
                amount: req.body['amount'],
                status: 1,
                user_id: userDetails['id'],
                payment_type: 'recharge'
            });
            await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(userWallet);
            userDetails.amount = String(+userDetails.amount + req.body['amount']);
            await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Money Added Successfully To User Wallet", null);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    async removeMoneyToWallet(req, res) {
        try {
            if (!req.body['game_key']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Game key is required");
            }
            if (!req.body['amount']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Amount is required");
            }
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { game_key: req.body['game_key'] }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Details Not Found');
            }
            if (userDetails.amount < req.body['amount']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, "Amount should be less than User's wallet Amount");
            }
            const userWallet = data_source_1.default.getRepository(wallet_entity_1.UserWallet).create({
                amount: req.body['amount'],
                status: 1,
                user_id: userDetails['id'],
                payment_type: 'recharge_delete'
            });
            await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(userWallet);
            userDetails.amount = String(+userDetails.amount - req.body['amount']);
            await data_source_1.default.getRepository(user_entity_1.User).save(userDetails);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Money Removed Successfully To User Wallet", null);
        }
        catch (error) {
            console.log('error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.AdminController = AdminController;
