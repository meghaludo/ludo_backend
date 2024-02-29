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
const axios_1 = __importDefault(require("axios"));
const gameTable_entity_1 = require("../entity/gameTable.entity");
const gameStatus_1 = require("../constants/gameStatus");
const socket_1 = require("../socket/socket");
const message_1 = require("../constants/message");
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
            const options = {
                method: 'GET',
                url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/classic/',
                headers: {
                    'X-RapidAPI-Key': 'cdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
                    'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
                }
            };
            // testing data
            // const options = {
            //     method: 'GET',
            //     url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/classic/',
            //     headers: {
            //         'X-RapidAPI-Key': 'asasascdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
            //         'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
            //     }
            // };
            const gameCodeAPIRes = await axios_1.default.request(options);
            if (!gameCodeAPIRes?.data['roomcode']) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Game Code Not Found');
            }
            // const gameCode = "09287844";
            // Calculate winner amount and owner commission amount
            const commissionPer = getCommission[0]?.commission || 0;
            const ownerCommission = ((Number(gameTableDetails?.amount) * 2) * commissionPer) / 100;
            const winnerAmount = (Number(gameTableDetails?.amount) * 2) - ownerCommission;
            const payload = {
                game_code: gameCodeAPIRes?.data['roomcode'],
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
                        await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).delete({
                            id: game?.id
                        });
                        if (data['status'] !== gameStatus_1.GameStatus.Completed) {
                            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).delete({
                                id: game?.game_table_id
                            });
                        }
                    }
                });
            });
            const io = (0, socket_1.getIO)();
            await io.emit('create_battle', { title: 'Create Game' });
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
            const getBattle = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: gameBattleId },
                relations: ['gameOwner', 'gamePlayer']
            });
            if (!getBattle) {
                return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.NOT_FOUND, 'Game Battle not found');
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle SuccessFully", getBattle);
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
                await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
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
            console.log('existingData looser', existingData);
            let savedDetails;
            if (existingData) {
                existingData['p_status'] = gameStatus_1.PlayerStatus.Looser;
                savedDetails = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).save(existingData);
            }
            const playerList = await data_source_1.default.getRepository(gamePlayer_entity_1.GamePlayer).find({
                where: { game_table_id: Number(loosePayload?.game_table_id) }
            });
            if ((playerList[0]?.p_status == gameStatus_1.PlayerStatus.Winner && playerList[1]?.p_status == gameStatus_1.PlayerStatus.Looser) || (playerList[0]?.p_status == gameStatus_1.PlayerStatus.Looser && playerList[1]?.p_status == gameStatus_1.PlayerStatus.Winner)) {
                const gameDetails = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                    where: { id: loosePayload?.game_table_id }
                });
                gameDetails['status'] = gameStatus_1.GameStatus.Completed;
                await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(gameDetails);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Successfully updated", savedDetails);
        }
        catch (error) {
            console.error('loose game result user can upload it : ', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.GameController = GameController;
