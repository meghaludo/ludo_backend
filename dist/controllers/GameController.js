"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const axios_1 = __importDefault(require("axios"));
const http_status_codes_1 = require("http-status-codes");
const message_1 = require("../constants/message");
const responseUtil_1 = require("../utils/responseUtil");
const data_source_1 = __importDefault(require("../data-source"));
const user_entity_1 = require("../entity/user.entity");
const gameStatus_1 = require("../constants/gameStatus");
const gameTable_entity_1 = require("../entity/gameTable.entity");
const adminCommission_entity_1 = require("../entity/adminCommission.entity");
const socket_1 = require("../socket/socket");
class GameController {
    async getGameCode(req, res) {
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
            // testing data
            // const options = {
            //     method: 'GET',
            //     url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/classic/',
            //     headers: {
            //         'X-RapidAPI-Key': 'asasascdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
            //         'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
            //     }
            // };
            // const gameCodeAPIRes: any = await axios.request(options);
            // if (!gameCodeAPIRes?.data['roomcode']) {
            //     return errorResponse(res, StatusCodes.NOT_FOUND, 'Game Code Not Found');
            // }
            const gameCode = "09287844";
            // Calculate winner amount and owner commission amount
            const commissionPer = getCommission[0]?.commission || 2;
            const ownerCommission = ((Number(gameTableDetails?.amount) * 2) * commissionPer) / 100;
            const winnerAmount = (Number(gameTableDetails?.amount) * 2) - ownerCommission;
            const payload = {
                user_id: userDetails?.id,
                // game_code: gameCodeAPIRes?.data['roomcode'],
                game_code: gameCode,
                amount: gameTableDetails?.amount,
                winner_amount: String(winnerAmount),
                owner_commision: String(ownerCommission),
                game_owner_id: userDetails?.id,
                p1_name: gameTableDetails?.name || userDetails?.ludo_name,
                p1_status: gameStatus_1.LudoGameStatus.Waiting,
                p1_id: userDetails?.id,
            };
            const createGameTable = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(payload);
            const io = (0, socket_1.getIO)();
            io.emit('create_battle', { title: 'Create Game' });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Table Created.", createGameTable);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // get Game result
    async getGameResult(req, res) {
        const { gameCode } = req?.body;
        console.log('get roome code', typeof gameCode);
        // const axios = require('axios');
        const options = {
            method: 'GET',
            url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/result/',
            params: {
                roomcode: String(gameCode) || '06467585',
                type: 'classic'
            },
            headers: {
                'X-RapidAPI-Key': 'cdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
                'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
            }
        };
        try {
            const response = await axios_1.default.request(options);
            console.log(response.data);
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Result", response.data);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get game list
    async getGameBattle(req, res) {
        try {
            const gameHistory = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
                order: { id: 'DESC' }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Game History  List", gameHistory);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // play game with another user
    async playGame(req, res) {
        const playerDetails = req?.body;
        try {
            const gameHistory = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
                order: { id: 'DESC' }
            });
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
            battleDetails['p2_name'] = userDetails['ludo_name'] || playerDetails?.name;
            battleDetails['p2_id'] = playerDetails?.user_id || req?.userId;
            battleDetails['p2_status'] = gameStatus_1.LudoGameStatus.Running;
            battleDetails['p1_status'] = gameStatus_1.LudoGameStatus.Running;
            battleDetails['is_running'] = 1;
            await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(battleDetails);
            const io = (0, socket_1.getIO)();
            io.emit('play_game', { title: 'Create Game' });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Play Game SuccessFully", playerDetails);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    // get game table
    async getGameTable(req, res) {
        const gameBattleId = Number(req.params.id);
        try {
            const getBattle = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).findOne({
                where: { id: gameBattleId }
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
    //  get game history for particular user
    async getGameHistoryUser(req, res) {
        try {
            const gameHistory = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
                where: [{ p1_id: req?.userId }, { p2_id: req?.userId }, { is_running: 1 }, { is_running: 2 }],
                relations: ['playerOne', 'playerTwo']
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
    //  get game history for admin
    async getGameHistoryAdmin(req, res) {
        try {
            const gameHistory = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
                relations: ['playerOne', 'playerTwo'],
                order: { id: 'DESC' }
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        }
        catch (error) {
            console.error(error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.GameController = GameController;
