"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameController_1 = require("../controllers/GameController");
const gameRoute = (0, express_1.Router)();
const gameController = new GameController_1.GameController();
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
exports.default = gameRoute;
