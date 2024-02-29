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
// gameRouteOld.post('/cancel-game', gameController.cancelGame); // cancel game
exports.default = gameRoute;
