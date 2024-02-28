import { Router } from "express";
import { GameController } from "../controllers/GameController";

const gameRoute = Router();
const gameController = new GameController();

// Create game
gameRoute.post('/create-game', gameController.createGame);

// cancel game (Delete game)
gameRoute.delete('/cancel-game/:id', gameController.deleteGame);

// click to play button start the game
gameRoute.post('/play-game', gameController.playGame);

// click to play button start the game
gameRoute.get('/start-game/:id', gameController.startGame);

// click to play button start the game
gameRoute.get('/game-list', gameController.gameList);

gameRoute.get('/get-game-table/:id', gameController.getGameTable);

export default gameRoute;