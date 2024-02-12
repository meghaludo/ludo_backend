import { Router } from "express";
import { GameController } from '../controllers/GameController';

const gameRoute = Router();
const gameController = new GameController();

// create game table
gameRoute.post('/get-game-code', gameController.getGameCode);
// get game table
gameRoute.get('/get-game-table/:id', gameController.getGameTable);

// get battle list
gameRoute.get('/get-battle-list', gameController.getGameBattle);

// play-game user click to pay button
gameRoute.post('/pay-game', gameController.playGame);

// get game history for particular user
gameRoute.get('/get-game-history', gameController.getGameHistoryUser);

// get game history for particular user
gameRoute.get('/get-admin-game-history', gameController.getGameHistoryAdmin);

// get game result API  for testing
gameRoute.post('/get-game-result', gameController.getGameResult);

export default gameRoute;