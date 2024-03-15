"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const gamePlayer_entity_1 = require("./../entity/gamePlayer.entity");
const http_status_codes_1 = require("http-status-codes");
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entity/user.entity");
const responseUtil_1 = require("../utils/responseUtil");
const adminCommission_entity_1 = require("../entity/adminCommission.entity");
const gameTable_entity_1 = require("../entity/gameTable.entity");
const gameStatus_1 = require("../constants/gameStatus");
const socket_1 = require("../socket/socket");
const message_1 = require("../constants/message");
const gameCancelReasonMaster_entity_1 = require("../entity/gameCancelReasonMaster.entity");
const referCommission_entity_1 = require("../entity/referCommission.entity");
const wallet_entity_1 = require("../entity/wallet.entity");
class GameController {
    // create game
    async createGame(req, res) {
        try {
            const gameTableDetails = req?.body;
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: gameTableDetails?.user_id }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            const getCommission = await data_source_1.default.getRepository(adminCommission_entity_1.AdminCommission).find();
            // origin data
            // const options = {
            //     method: 'GET',
            //     url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/classic/',
            //     headers: {
            //         'X-RapidAPI-Key': 'cdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
            //         'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
            //     }
            // };
            // const gameCodeAPIRes: any = await axios.request(options);
            // if (!gameCodeAPIRes?.data['roomcode']) {
            //     return errorResponse(res, StatusCodes.NOT_FOUND, 'Game Code Not Found');
            // }
            // const gameCode = "09287844";
            // Calculate winner amount and owner commission amount
            const commissionPer = getCommission[0]?.commission || 0;
            // const ownerCommission = ((Number(gameTableDetails?.amount) * 2) * commissionPer) / 100;
            const ownerCommission = (Number(gameTableDetails?.amount) * commissionPer) / 100;
            const winnerAmount = (Number(gameTableDetails?.amount) * 2) - ownerCommission;
            const payload = {
                amount: gameTableDetails?.amount,
                winner_amount: String(winnerAmount),
                admin_commission: String(ownerCommission),
                game_owner_id: userDetails?.id,
                status: gameStatus_1.GameStatus.Created
            };
            const createGameTable = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(payload);
            const playerPayload = {
                game_table_id: createGameTable?.id,
                p_id: userDetails?.id,
                p_name: gameTableDetails?.name || userDetails?.ludo_name,
                p_status: gameStatus_1.PlayerStatus.Created
            };
            await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(playerPayload);
            const io = (0, socket_1.getIO)();
            io.emit('create_battle', { title: 'Create Game' });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Table Created.", createGameTable);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // cancel game (Delete game)
    async deleteGame(req, res) {
        try {
            const gameBattleId = Number(req.params.id);
            if (!gameBattleId) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, message_1.INTERNAL_SERVER_ERROR);
            }
            await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).delete({
                game_table_id: gameBattleId
            });
            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).delete({
                id: gameBattleId
            });
            const io = (0, socket_1.getIO)();
            io.emit('create_battle', { title: 'Create Game' });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Table Created.", { id: gameBattleId });
        }
        catch (error) {
            console.log('Error deleting game', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // click to play button
    async playGame(req, res) {
        const playerDetails = req?.body;
        try {
            const userDetails = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: playerDetails?.user_id || req?.userId }
            });
            if (!userDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'User Not Found');
            }
            const battleDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: playerDetails?.battle_id }
            });
            if (!battleDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Battle Not Found');
            }
            battleDetails['status'] = gameStatus_1.GameStatus.Requested;
            const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(battleDetails);
            const playerPayload = {
                game_table_id: gameDetails?.id,
                p_id: userDetails?.id,
                p_name: playerDetails?.name || userDetails?.ludo_name,
                p_status: gameStatus_1.PlayerStatus.Requested
            };
            await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(playerPayload);
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: gameDetails?.id }
            });
            playerList?.map((element) => {
                element['p_status'] = gameStatus_1.PlayerStatus.Requested;
                data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(element);
            });
            const io = (0, socket_1.getIO)();
            io.emit('create_battle', { title: 'Create Game' });
            // await AppDataSource.getRepository(GamePlayer).delete({
            //     p_id: playerDetails?.user_id, p_status: PlayerStatus.Created
            // });
            // await AppDataSource.getRepository(GameTable).delete({
            //     game_owner_id: playerDetails?.user_id, status: GameStatus.Created
            // }); 
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Game Played Successfully", gameDetails);
        }
        catch (error) {
            console.log('Error play game', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // start game
    async startGame(req, res) {
        const gameBattleId = Number(req.params.id);
        try {
            const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: gameBattleId }
            });
            if (!gameDetails) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Game Not Found');
            }
            gameDetails['status'] = gameStatus_1.GameStatus.Running;
            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: gameBattleId }
            });
            await playerList?.map(async (player) => {
                let userDetailsForAmount = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: Number(player?.p_id) }
                });
                const userAmount = Number(userDetailsForAmount['amount']) - Number(gameDetails['amount']);
                userDetailsForAmount['amount'] = String(userAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(userDetailsForAmount);
            });
            // remove other games
            await playerList?.map(async (element) => {
                element['p_status'] = gameStatus_1.PlayerStatus.Running;
                await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(element);
                const gameList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                    where: { p_id: element['p_id'] }
                });
                await gameList?.map(async (game) => {
                    if (game?.game_table_id != gameBattleId) {
                        const data = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                            where: { id: game?.game_table_id }
                        });
                        if (game['p_status'] != 6 && game['p_status'] != 7) {
                            await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).delete({
                                id: game?.id
                            });
                        }
                        if (data['status'] !== gameStatus_1.GameStatus.Completed) {
                            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).delete({
                                id: game?.game_table_id
                            });
                        }
                    }
                });
            });
            setTimeout(() => {
                const io = (0, socket_1.getIO)();
                io.emit('create_battle', { title: 'Create Game' });
            }, 1000);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully", gameDetails);
        }
        catch (error) {
            console.log('Error Start game', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // get game list
    async gameList(req, res) {
        try {
            let gameQuery = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).createQueryBuilder('game_table');
            if (req?.role != 1) {
                gameQuery = gameQuery.andWhere(`game_table.status != :Status`, { Status: gameStatus_1.GameStatus?.Cancel });
                gameQuery = gameQuery.andWhere(`game_table.status != :Status`, { Status: gameStatus_1.GameStatus?.Completed });
            }
            gameQuery = gameQuery.leftJoinAndSelect('game_table.gameOwner', 'users');
            gameQuery = gameQuery.leftJoinAndSelect('game_table.gamePlayer', 'game_player');
            gameQuery = gameQuery.orderBy(`game_table.id`, 'DESC');
            const gameList = await gameQuery.getMany();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Game List Found Successfully", gameList);
        }
        catch (error) {
            console.log('Error Listing game', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // get game table
    async getGameTable(req, res) {
        const gameBattleId = Number(req.params.id);
        try {
            let query = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).createQueryBuilder('game_table');
            query = query.andWhere(`game_table.id = :gameBattleId`, { gameBattleId: gameBattleId });
            query = query.leftJoinAndSelect('game_table.gameOwner', 'users');
            query = query.leftJoinAndSelect('game_table.gamePlayer', 'game_player');
            query = query.leftJoinAndSelect('game_player.playerOne', 'owner');
            const getBattle = await query.getMany();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle SuccessFully", getBattle[0]);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // user add win image photo in the API
    async winGameResult(req, res) {
        try {
            const winPayload = req?.body;
            const fileDataArray = req?.files;
            if (fileDataArray?.length == 0) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'PLease Upload Image.');
            }
            const existingData = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).findOne({
                where: { game_table_id: Number(winPayload?.game_table_id), p_id: req?.userId }
            });
            console.log('existingData wiiner', existingData);
            let savedDetails;
            if (existingData) {
                existingData['p_status'] = gameStatus_1.PlayerStatus.Winner;
                existingData['image'] = fileDataArray[0]?.filename || existingData['image'];
                savedDetails = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(existingData);
            }
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: Number(winPayload?.game_table_id) }
            });
            if ((playerList[0]?.p_status == gameStatus_1.PlayerStatus.Winner && playerList[1]?.p_status == gameStatus_1.PlayerStatus.Looser) || (playerList[0]?.p_status == gameStatus_1.PlayerStatus.Looser && playerList[1]?.p_status == gameStatus_1.PlayerStatus.Winner)) {
                const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                    where: { id: winPayload?.game_table_id }
                });
                gameDetails['status'] = gameStatus_1.GameStatus.Completed;
                // add money in winner account
                const findWinnerUsr = playerList?.find((element) => element.p_status == gameStatus_1.PlayerStatus.Winner);
                const winnerUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: Number(findWinnerUsr?.p_id) }
                });
                const winnerAmount = Number(winnerUser['amount']) + Number(gameDetails['winner_amount']);
                winnerUser['amount'] = String(winnerAmount);
                await data_source_1.default.getRepository(user_entity_1.User).save(winnerUser);
                // manage wallet history
                const payload = {
                    user_id: winnerUser?.id,
                    amount: gameDetails['winner_amount'],
                    payment_type: 'Win Game',
                    status: 1
                };
                await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(payload);
                await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
            }
            const user = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: req?.userId }
            });
            // refer user logic 
            if (user && (user?.reference_user_id != 0)) {
                const gameDetail = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                    where: { id: Number(winPayload?.game_table_id) }
                });
                const adminCommission = await data_source_1.default.getRepository(adminCommission_entity_1.AdminCommission).findOne({
                    where: { is_active: 1 }
                });
                const adminCommissionRs = ((Number(gameDetail?.amount) * 2) * Number(adminCommission?.commission) || 0) / 100;
                const referCommission = await data_source_1.default.getRepository(referCommission_entity_1.ReferCommission).findOne({
                    where: { is_active: 1 }
                });
                const referCommissionRs = (Number(adminCommissionRs) * Number(referCommission?.commission) || 0) / 100;
                console.log('user.reference_user_id', user.reference_user_id);
                const referUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                    where: { id: Number(user.reference_user_id) }
                });
                console.log('referUserreferUser', referUser);
                referUser.amount = Number(referUser?.amount) + Number(referCommissionRs);
                await data_source_1.default.getRepository(user_entity_1.User).save(referUser);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully update", savedDetails);
        }
        catch (error) {
            console.error('Win game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // user add loose game
    async looseGameResult(req, res) {
        try {
            const loosePayload = req?.body;
            // console.log('loosePayload', loosePayload)
            const existingData = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).findOne({
                where: { game_table_id: Number(loosePayload?.game_table_id), p_id: req?.userId }
            });
            let savedDetails;
            if (existingData) {
                existingData['p_status'] = gameStatus_1.PlayerStatus.Looser;
                savedDetails = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(existingData);
            }
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: Number(loosePayload?.game_table_id) }
            });
            const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: loosePayload?.game_table_id }
            });
            gameDetails['status'] = gameStatus_1.GameStatus.Completed;
            // add money in winner account
            const findWinnerUsr = playerList?.find((element) => element.p_status != gameStatus_1.PlayerStatus.Looser);
            console.log('findWinnerUsr', findWinnerUsr);
            const winnerUser = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                where: { id: Number(findWinnerUsr?.p_id) }
            });
            console.log('winnerUser', winnerUser);
            const winnerAmount = Number(winnerUser['amount']) + Number(gameDetails['winner_amount']);
            winnerUser['amount'] = String(winnerAmount);
            await data_source_1.default.getRepository(user_entity_1.User).save(winnerUser);
            findWinnerUsr['p_status'] = gameStatus_1.PlayerStatus.Winner;
            await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(findWinnerUsr);
            // manage wallet history
            const payload = {
                user_id: winnerUser?.id,
                amount: gameDetails['winner_amount'],
                payment_type: 'Win Game',
                status: 1
            };
            await data_source_1.default.getRepository(wallet_entity_1.UserWallet).save(payload);
            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
            // if ((playerList[0]?.p_status == PlayerStatus.Winner && playerList[1]?.p_status == PlayerStatus.Looser) || (playerList[0]?.p_status == PlayerStatus.Looser && playerList[1]?.p_status == PlayerStatus.Winner)) {
            //     const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
            //         where: { id: loosePayload?.game_table_id }
            //     });
            //     gameDetails['status'] = GameStatus.Completed;
            //     // add money in winner account
            //     const findWinnerUsr = playerList?.find((element) => element.p_status == PlayerStatus.Winner);
            //     const winnerUser: any = await AppDataSource.getRepository(User).findOne({
            //         where: { id: Number(findWinnerUsr?.p_id) }
            //     });
            //     const winnerAmount = Number(winnerUser['amount']) + Number(gameDetails['winner_amount'])
            //     winnerUser['amount'] = String(winnerAmount);
            //     await AppDataSource.getRepository(User).save(winnerUser);
            //     // manage wallet history
            //     const payload = {
            //         user_id: winnerUser?.id,
            //         amount: gameDetails['winner_amount'],
            //         payment_type: 'Win Game',
            //         status: 1
            //     }
            //     await AppDataSource.getRepository(UserWallet).save(payload);
            //     await AppDataSource.getRepository(GameTable).save(gameDetails);
            // }
            setTimeout(() => {
                const io = (0, socket_1.getIO)();
                io.emit('generate_game_code', { title: 'Generate Game', data: { game_table_id: loosePayload?.game_table_id, user_id: winnerUser?.id } });
            }, 1000);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully updated", savedDetails);
        }
        catch (error) {
            console.error('loose game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  get game history for particular user
    async getGameHistoryUser(req, res) {
        try {
            let gameQuery = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).createQueryBuilder('game_player');
            gameQuery = gameQuery.andWhere('game_player.p_id = :playerId', { playerId: req?.userId });
            gameQuery = gameQuery.andWhere(`game_player.p_status != :Status`, { Status: gameStatus_1.PlayerStatus.Created });
            gameQuery = gameQuery.andWhere(`game_player.p_status != :Status`, { Status: gameStatus_1.PlayerStatus.Requested });
            gameQuery = gameQuery.leftJoinAndSelect(`game_player.gameTable`, 'game_table');
            gameQuery = gameQuery.leftJoinAndSelect(`game_player.playerOne`, 'users');
            const gameHistory = await gameQuery.getMany();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // admin game history
    async adminGameHistory(req, res) {
        try {
            const gameList = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
                relations: ['gameOwner', 'gamePlayer']
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle  History Successfully.", gameList);
        }
        catch (error) {
            console.error('Admin Game history error', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  game cancel reason
    async cancelReasonList(req, res) {
        try {
            const reasonList = await data_source_1.default.getRepository(gameCancelReasonMaster_entity_1.ReasonMaster).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully Get Reason List", reasonList);
        }
        catch (error) {
            console.error('Win game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // cancel user list
    async cancelGame(req, res) {
        try {
            const cancelDetails = req?.body;
            let gameTable = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: Number(cancelDetails?.game_table_id) }
            });
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: Number(cancelDetails?.game_table_id) }
            });
            // both player status are running that time only cancel game other wise not cancel game
            if (playerList[0]?.p_status == gameStatus_1.PlayerStatus.Running && playerList[1]?.p_status == gameStatus_1.PlayerStatus.Running) {
                gameTable['status'] = gameStatus_1.GameStatus.Cancel;
                gameTable['cancel_user_id'] = req?.userId;
                gameTable['cancel_reason'] = cancelDetails?.cancel_reasone;
                const savedData = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameTable);
                await playerList?.map(async (player) => {
                    player['p_status'] = gameStatus_1.PlayerStatus.Cancel;
                    await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(player);
                    let userData = await data_source_1.default.getRepository(user_entity_1.User).findOne({
                        where: { id: Number(player?.p_id) }
                    });
                    const amount = Number(userData['amount']) + Number(gameTable['amount']);
                    userData['amount'] = String(amount);
                    console.log('userData', userData);
                    await data_source_1.default.getRepository(user_entity_1.User).save(userData);
                });
                setTimeout(() => {
                    const io = (0, socket_1.getIO)();
                    io.emit('create_battle', { title: 'Create Game' });
                }, 1000);
                return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Game Canceled.", savedData);
            }
            else {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.BAD_REQUEST, 'Please Update Result Do Not Cancel The Game Opponent Player Already Update Game Result.');
            }
        }
        catch (error) {
            console.error('Win game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    async addGameCode(req, res) {
        try {
            const { game_table_id, user_id, game_code } = req?.body;
            let gameTable = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: Number(game_table_id) }
            });
            if (!gameTable) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Game table not found');
            }
            const existingGameCode = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { game_code: game_code }
            });
            if (existingGameCode) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, 'This code already exists.');
            }
            gameTable['game_code'] = game_code;
            const savedData = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameTable);
            setTimeout(() => {
                const io = (0, socket_1.getIO)();
                io.emit('generate_game_code', { title: 'Generate Game', data: { game_table_id: game_table_id, user_id: user_id } });
            }, 1000);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Game Generated Successfully.", savedData);
        }
        catch (error) {
            console.error('Win game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.GameController = GameController;
