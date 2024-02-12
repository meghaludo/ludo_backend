import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { INTERNAL_SERVER_ERROR } from '../constants/message';
import { errorResponse, sendResponse } from '../utils/responseUtil';
import AppDataSource from '../data-source';
import { User } from '../entity/user.entity';
import { LudoGameStatus } from '../constants/gameStatus';
import { GameTable } from '../entity/gameTable.entity';
import { AdminCommission } from '../entity/adminCommission.entity';
import { getIO } from '../socket/socket';

export class GameController {
    public async getGameCode(req: any, res: any) {
        try {
            const gameTableDetails = req?.body

            const userDetails = await AppDataSource.getRepository(User).findOne({
                where: { id: gameTableDetails?.user_id }
            });

            if (!userDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            const getCommission = await AppDataSource.getRepository(AdminCommission).find();

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
                p1_status: LudoGameStatus.Waiting,
                p1_id: userDetails?.id,
            }

            const createGameTable = await AppDataSource.getRepository(GameTable).save(payload);

            const io = getIO();
            io.emit('create_battle', { title: 'Create Game' });

            return sendResponse(res, StatusCodes.OK, "Get Table Created.", createGameTable);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // get Game result
    public async getGameResult(req: any, res: any) {
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
            const response = await axios.request(options);
            console.log(response.data);
            return sendResponse(res, StatusCodes.OK, "Get Game Result", response.data);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get game list
    public async getGameBattle(req: any, res: any) {
        try {
            const gameHistory = await AppDataSource.getRepository(GameTable).find({
                order: { id: 'DESC' }
            });

            return sendResponse(res, StatusCodes.OK, "Game History  List", gameHistory);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // play game with another user
    public async playGame(req: any, res: any) {
        const playerDetails = req?.body;
        try {
            const gameHistory = await AppDataSource.getRepository(GameTable).find({
                order: { id: 'DESC' }
            });

            const userDetails = await AppDataSource.getRepository(User).findOne({
                where: { id: playerDetails?.user_id || req?.userId }
            });

            if (!userDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'User Not Found');
            }

            const battleDetails = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: playerDetails?.battle_id }
            });

            if (!battleDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Battle Not Found');
            }

            battleDetails['p2_name'] = userDetails['ludo_name'] || playerDetails?.name;
            battleDetails['p2_id'] = playerDetails?.user_id || req?.userId;
            battleDetails['p2_status'] = LudoGameStatus.Running;
            battleDetails['p1_status'] = LudoGameStatus.Running;
            battleDetails['is_running'] = 1;

            await AppDataSource.getRepository(GameTable).save(battleDetails);

            const io = getIO();
            io.emit('play_game', { title: 'Create Game' });

            return sendResponse(res, StatusCodes.OK, "Play Game SuccessFully", playerDetails);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // get game table
    public async getGameTable(req: any, res: any) {
        const gameBattleId = Number(req.params.id);
        try {

            const getBattle = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: gameBattleId }
            });

            if (!getBattle) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Game Battle not found');
            }

            return sendResponse(res, StatusCodes.OK, "Get Game Battle SuccessFully", getBattle);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  get game history for particular user
    public async getGameHistoryUser(req: any, res: any) {
        try {
            const gameHistory = await AppDataSource.getRepository(GameTable).find({
                where: [{ p1_id: req?.userId }, { p2_id: req?.userId }, { is_running: 1 }, { is_running: 2 }],
                relations: ['playerOne', 'playerTwo']
            });

            return sendResponse(res, StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  get game history for admin
    public async getGameHistoryAdmin(req: any, res: any) {
        try {
            const gameHistory = await AppDataSource.getRepository(GameTable).find({
                relations: ['playerOne', 'playerTwo'],
                order : { id : 'DESC'}
            });

            return sendResponse(res, StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}