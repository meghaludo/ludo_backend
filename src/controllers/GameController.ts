import { GamePlayer } from './../entity/gamePlayer.entity';
import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { User } from "../entity/user.entity";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { AdminCommission } from "../entity/adminCommission.entity";
import axios from 'axios';
import { GameTable } from "../entity/gameTable.entity";
import { GameStatus, PlayerStatus } from "../constants/gameStatus";
import { getIO } from "../socket/socket";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { ReasonMaster } from '../entity/gameCancelReasonMaster.entity';
import { ReferCommission } from '../entity/referCommission.entity';
import { UserWallet } from '../entity/wallet.entity';

export class GameController {
    // create game
    public async createGame(req: any, res: any) {
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
                status: GameStatus.Created
            }

            const createGameTable = await AppDataSource.getRepository(GameTable).save(payload);

            const playerPayload = {
                game_table_id: createGameTable?.id,
                p_id: userDetails?.id,
                p_name: gameTableDetails?.name || userDetails?.ludo_name,
                p_status: PlayerStatus.Created
            }

            await AppDataSource.getRepository(GamePlayer).save(playerPayload);

            const io = getIO();
            io.emit('create_battle', { title: 'Create Game' });

            return sendResponse(res, StatusCodes.OK, "Get Table Created.", createGameTable);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // cancel game (Delete game)
    public async deleteGame(req: any, res: any) {
        try {
            const gameBattleId = Number(req.params.id);

            if (!gameBattleId) {
                return errorResponse(res, StatusCodes.NOT_FOUND, INTERNAL_SERVER_ERROR);
            }

            await AppDataSource.getRepository(GamePlayer).delete({
                game_table_id: gameBattleId
            });

            await AppDataSource.getRepository(GameTable).delete({
                id: gameBattleId
            });

            const io = getIO();
            io.emit('create_battle', { title: 'Create Game' });

            return sendResponse(res, StatusCodes.OK, "Get Table Created.", { id: gameBattleId });
        } catch (error) {
            console.log('Error deleting game', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // click to play button
    public async playGame(req: any, res: any) {
        const playerDetails = req?.body;
        try {
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

            battleDetails['status'] = GameStatus.Requested

            const gameDetails = await AppDataSource.getRepository(GameTable).save(battleDetails);

            const playerPayload = {
                game_table_id: gameDetails?.id,
                p_id: userDetails?.id,
                p_name: playerDetails?.name || userDetails?.ludo_name,
                p_status: PlayerStatus.Requested
            }

            await AppDataSource.getRepository(GamePlayer).save(playerPayload);

            const playerList = await AppDataSource.getRepository(GamePlayer).find({
                where: { game_table_id: gameDetails?.id }
            });

            playerList?.map((element) => {
                element['p_status'] = PlayerStatus.Requested
                AppDataSource.getRepository(GamePlayer).save(element);
            });

            const io = getIO();
            io.emit('create_battle', { title: 'Create Game' });


            // await AppDataSource.getRepository(GamePlayer).delete({
            //     p_id: playerDetails?.user_id, p_status: PlayerStatus.Created
            // });

            // await AppDataSource.getRepository(GameTable).delete({
            //     game_owner_id: playerDetails?.user_id, status: GameStatus.Created
            // }); 

            return sendResponse(res, StatusCodes.OK, "Game Played Successfully", gameDetails);
        } catch (error) {
            console.log('Error play game', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // start game
    public async startGame(req: any, res: any) {
        const gameBattleId = Number(req.params.id);
        try {
            const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: gameBattleId }
            });

            if (!gameDetails) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Game Not Found');
            }
            gameDetails['status'] = GameStatus.Running;
            await AppDataSource.getRepository(GameTable).save(gameDetails);

            const playerList = await AppDataSource.getRepository(GamePlayer).find({
                where: { game_table_id: gameBattleId }
            });

            await playerList?.map(async (player) => {
                let userDetailsForAmount: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: Number(player?.p_id) }
                });

                const userAmount = Number(userDetailsForAmount['amount']) - Number(gameDetails['amount']);
                userDetailsForAmount['amount'] = String(userAmount);
                
                await AppDataSource.getRepository(User).save(userDetailsForAmount);
            })

            // remove other games
            await playerList?.map(async (element) => {
                element['p_status'] = PlayerStatus.Running
                await AppDataSource.getRepository(GamePlayer).save(element);

                const gameList = await AppDataSource.getRepository(GamePlayer).find({
                    where: { p_id: element['p_id'] }
                });

                await gameList?.map(async (game: any) => {
                    if (game?.game_table_id != gameBattleId) {

                        const data: any = await AppDataSource.getRepository(GameTable).findOne({
                            where: { id: game?.game_table_id }
                        });

                        if (game['p_status'] != 6 && game['p_status'] != 7) {
                            await AppDataSource.getRepository(GamePlayer).delete({
                                id: game?.id
                            });
                        }
                        if (data['status'] !== GameStatus.Completed) {
                            await AppDataSource.getRepository(GameTable).delete({
                                id: game?.game_table_id
                            });
                        }
                    }
                })
            });

            setTimeout(() => {
                const io = getIO();
                io.emit('create_battle', { title: 'Create Game' });
            }, 1000);

            return sendResponse(res, StatusCodes.OK, "Successfully", gameDetails);
        } catch (error) {
            console.log('Error Start game', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // get game list
    public async gameList(req: any, res: any) {
        try {
            let gameQuery = await AppDataSource.getRepository(GameTable).createQueryBuilder('game_table');

            if (req?.role != 1) {
                gameQuery = gameQuery.andWhere(`game_table.status != :Status`, { Status: GameStatus?.Cancel });
                gameQuery = gameQuery.andWhere(`game_table.status != :Status`, { Status: GameStatus?.Completed });
            }

            gameQuery = gameQuery.leftJoinAndSelect('game_table.gameOwner', 'users');
            gameQuery = gameQuery.leftJoinAndSelect('game_table.gamePlayer', 'game_player');

            gameQuery = gameQuery.orderBy(`game_table.id`, 'DESC');

            const gameList = await gameQuery.getMany();

            return sendResponse(res, StatusCodes.OK, "Game List Found Successfully", gameList);

        } catch (error) {
            console.log('Error Listing game', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // get game table
    public async getGameTable(req: any, res: any) {
        const gameBattleId = Number(req.params.id);
        try {

            let query = await AppDataSource.getRepository(GameTable).createQueryBuilder('game_table');
            query = query.andWhere(`game_table.id = :gameBattleId`, { gameBattleId: gameBattleId })
            query = query.leftJoinAndSelect('game_table.gameOwner', 'users');
            query = query.leftJoinAndSelect('game_table.gamePlayer', 'game_player');
            query = query.leftJoinAndSelect('game_player.playerOne', 'owner')

            const getBattle = await query.getMany();

            return sendResponse(res, StatusCodes.OK, "Get Game Battle SuccessFully", getBattle[0]);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // user add win image photo in the API
    public async winGameResult(req: any, res: any) {
        try {
            const winPayload: any = req?.body;

            const fileDataArray = req?.files;
            if (fileDataArray?.length == 0) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'PLease Upload Image.');
            }

            const existingData = await AppDataSource.getRepository(GamePlayer).findOne({
                where: { game_table_id: Number(winPayload?.game_table_id), p_id: req?.userId }
            });

            console.log('existingData wiiner', existingData);

            let savedDetails: any;

            if (existingData) {
                existingData['p_status'] = PlayerStatus.Winner;
                existingData['image'] = fileDataArray[0]?.filename || existingData['image'];
                savedDetails = await AppDataSource.getRepository(GamePlayer).save(existingData);
            }

            const playerList = await AppDataSource.getRepository(GamePlayer).find({
                where: { game_table_id: Number(winPayload?.game_table_id) }
            });

            if ((playerList[0]?.p_status == PlayerStatus.Winner && playerList[1]?.p_status == PlayerStatus.Looser) || (playerList[0]?.p_status == PlayerStatus.Looser && playerList[1]?.p_status == PlayerStatus.Winner)) {
                const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
                    where: { id: winPayload?.game_table_id }
                });

                gameDetails['status'] = GameStatus.Completed;

                // add money in winner account
                const findWinnerUsr = playerList?.find((element) => element.p_status == PlayerStatus.Winner);
                const winnerUser: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: Number(findWinnerUsr?.p_id) }
                });
                const winnerAmount = Number(winnerUser['amount']) + Number(gameDetails['winner_amount'])
                winnerUser['amount'] = String(winnerAmount);
                await AppDataSource.getRepository(User).save(winnerUser);
                // manage wallet history
                const payload = {
                    user_id: winnerUser?.id,
                    amount: gameDetails['winner_amount'],
                    payment_type: 'Win Game',
                    status: 1
                }
                await AppDataSource.getRepository(UserWallet).save(payload);

                await AppDataSource.getRepository(GameTable).save(gameDetails);
            }

            const user: any = await AppDataSource.getRepository(User).findOne({
                where: { id: req?.userId }
            });

            // refer user logic 
            if (user && (user?.reference_user_id != 0)) {

                const gameDetail: any = await AppDataSource.getRepository(GameTable).findOne({
                    where: { id: Number(winPayload?.game_table_id) }
                });

                const adminCommission: any = await AppDataSource.getRepository(AdminCommission).findOne({
                    where: { is_active: 1 }
                });

                const adminCommissionRs = ((Number(gameDetail?.amount) * 2) * Number(adminCommission?.commission) || 0) / 100;

                const referCommission: any = await AppDataSource.getRepository(ReferCommission).findOne({
                    where: { is_active: 1 }
                });

                const referCommissionRs = (Number(adminCommissionRs) * Number(referCommission?.commission) || 0) / 100;

                console.log('user.reference_user_id', user.reference_user_id);

                const referUser: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: Number(user.reference_user_id) }
                });

                console.log('referUserreferUser', referUser)
                referUser.amount = Number(referUser?.amount) + Number(referCommissionRs);
                await AppDataSource.getRepository(User).save(referUser);
            }

            return sendResponse(res, StatusCodes.OK, "Successfully update", savedDetails);
        } catch (error) {
            console.error('Win game result user can upload it : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // user add loose game
    public async looseGameResult(req: any, res: any) {
        try {
            const loosePayload: any = req?.body;

            // console.log('loosePayload', loosePayload)
            const existingData = await AppDataSource.getRepository(GamePlayer).findOne({
                where: { game_table_id: Number(loosePayload?.game_table_id), p_id: req?.userId }
            });

            console.log('existingData looser', existingData);

            let savedDetails: any;

            if (existingData) {
                existingData['p_status'] = PlayerStatus.Looser
                savedDetails = await AppDataSource.getRepository(GamePlayer).save(existingData);
            }

            const playerList = await AppDataSource.getRepository(GamePlayer).find({
                where: { game_table_id: Number(loosePayload?.game_table_id) }
            });

            if ((playerList[0]?.p_status == PlayerStatus.Winner && playerList[1]?.p_status == PlayerStatus.Looser) || (playerList[0]?.p_status == PlayerStatus.Looser && playerList[1]?.p_status == PlayerStatus.Winner)) {
                const gameDetails: any = await AppDataSource.getRepository(GameTable).findOne({
                    where: { id: loosePayload?.game_table_id }
                });

                gameDetails['status'] = GameStatus.Completed;

                // add money in winner account
                const findWinnerUsr = playerList?.find((element) => element.p_status == PlayerStatus.Winner);
                const winnerUser: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: Number(findWinnerUsr?.p_id) }
                });
                const winnerAmount = Number(winnerUser['amount']) + Number(gameDetails['winner_amount'])
                winnerUser['amount'] = String(winnerAmount);
                await AppDataSource.getRepository(User).save(winnerUser);
                // manage wallet history
                const payload = {
                    user_id: winnerUser?.id,
                    amount: gameDetails['winner_amount'],
                    payment_type: 'Win Game',
                    status: 1
                }
                await AppDataSource.getRepository(UserWallet).save(payload);

                await AppDataSource.getRepository(GameTable).save(gameDetails);
            }

            return sendResponse(res, StatusCodes.OK, "Successfully updated", savedDetails);
        } catch (error) {
            console.error('loose game result user can upload it : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  get game history for particular user
    public async getGameHistoryUser(req: any, res: any) {
        try {
            let gameQuery = await AppDataSource.getRepository(GamePlayer).createQueryBuilder('game_player');

            gameQuery = gameQuery.andWhere('game_player.p_id = :playerId', { playerId: req?.userId });
            gameQuery = gameQuery.andWhere(`game_player.p_status != :Status`, { Status: PlayerStatus.Created });
            gameQuery = gameQuery.andWhere(`game_player.p_status != :Status`, { Status: PlayerStatus.Requested });
            gameQuery = gameQuery.leftJoinAndSelect(`game_player.gameTable`, 'game_table');
            gameQuery = gameQuery.leftJoinAndSelect(`game_player.playerOne`, 'users')

            const gameHistory = await gameQuery.getMany();

            return sendResponse(res, StatusCodes.OK, "Get Game Battle  History Successfully.", gameHistory);
        } catch (error) {
            console.error(error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // admin game history
    public async adminGameHistory(req: any, res: any) {
        try {
            const gameList = await AppDataSource.getRepository(GameTable).find({
                relations: ['gameOwner', 'gamePlayer']
            });

            return sendResponse(res, StatusCodes.OK, "Get Game Battle  History Successfully.", gameList);
        } catch (error) {
            console.error('Admin Game history error', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    //  game cancel reason
    public async cancelReasonList(req: any, res: any) {
        try {
            const reasonList = await AppDataSource.getRepository(ReasonMaster).find();

            return sendResponse(res, StatusCodes.OK, "Successfully Get Reason List", reasonList);
        } catch (error) {
            console.error('Win game result user can upload it : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    // cancel user list
    public async cancelGame(req: any, res: any) {
        try {
            const cancelDetails = req?.body;

            let gameTable: any = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: Number(cancelDetails?.game_table_id) }
            });

            gameTable['status'] = GameStatus.Cancel;
            gameTable['cancel_user_id'] = req?.userId;
            gameTable['cancel_reason'] = cancelDetails?.cancel_reasone;

            const savedData = await AppDataSource.getRepository(GameTable).save(gameTable);

            const playerList = await AppDataSource.getRepository(GamePlayer).find({
                where: { game_table_id: Number(cancelDetails?.game_table_id) }
            });

            await playerList?.map(async (player) => {
                player['p_status'] = PlayerStatus.Cancel;
                await AppDataSource.getRepository(GamePlayer).save(player);

                let userData: any = await AppDataSource.getRepository(User).findOne({
                    where: { id: Number(player?.p_id) }
                });
                const amount = Number(userData['amount']) + Number(gameTable['amount']);
                userData['amount'] = String(amount);

                console.log('userData', userData);

                await AppDataSource.getRepository(User).save(userData);
            });

            setTimeout(() => {
                const io = getIO();
                io.emit('create_battle', { title: 'Create Game' });
            }, 1000);

            return sendResponse(res, StatusCodes.OK, "Game Canceled.", savedData);
        } catch (error) {
            console.error('Win game result user can upload it : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }

    public async addGameCode(req: any, res: any) {
        try {
            const { game_table_id, user_id, game_code } = req?.body;

            let gameTable: any = await AppDataSource.getRepository(GameTable).findOne({
                where: { id: Number(game_table_id) }
            });

            if (!gameTable) {
                return errorResponse(res, StatusCodes.NOT_FOUND, 'Game table not found');
            }

            gameTable['game_code'] = game_code;

            const savedData = await AppDataSource.getRepository(GameTable).save(gameTable);

            setTimeout(() => {
                const io = getIO();
                io.emit('generate_game_code', { title: 'Generate Game', data: { game_table_id: game_table_id, user_id: user_id } });
            }, 1000);

            return sendResponse(res, StatusCodes.OK, "Game Generated Successfully.", savedData);
        } catch (error) {
            console.error('Win game result user can upload it : ', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}