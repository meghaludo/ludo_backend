"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameController_1 = require("../controllers/GameController");
const multerConfig_1 = require("../core/multerConfig");
const gameRoute = (0, express_1.Router)();
const gameController = new GameController_1.GameController();
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
gameRoute.post('/win-game', multerConfig_1.upload.array('file', 1), gameController.winGameResult); // For the win game
gameRoute.post('/loose-game', gameController.looseGameResult); // for the loose the game 
gameRoute.post('/cancel-game', gameController.cancelGame); // cancel game
// get game history for particular user
gameRoute.get('/get-game-history', gameController.getGameHistoryUser);
// get game history for particular user
gameRoute.get('/admin-game-history', gameController.adminGameHistory);
gameRoute.get('/cancel-reason-list', gameController.cancelReasonList); // cancel game
gameRoute.post('/add-game-code', gameController.addGameCode); // add game code and show this game code to both user
exports.default = gameRoute;
