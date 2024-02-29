"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GameController_1 = require("../controllers/GameController");
const multerConfig_1 = require("../core/multerConfig");
const gameRouteOld = (0, express_1.Router)();
const gameController = new GameController_1.GameController();
// create game table
gameRouteOld.post('/get-game-code', gameController.getGameCode);
// get game table
gameRouteOld.get('/get-game-table/:id', gameController.getGameTable);
// get battle list
gameRouteOld.get('/get-battle-list', gameController.getGameBattle);
// play-game user click to pay button
gameRouteOld.post('/pay-game', gameController.playGame);
// get game history for particular user
gameRouteOld.get('/get-game-history', gameController.getGameHistoryUser);
// get game history for particular user
gameRouteOld.get('/get-admin-game-history', gameController.getGameHistoryAdmin);
// get game result API  for testing
gameRouteOld.post('/get-game-result', gameController.getGameResult);
// after show game code user can add winning and verify game result
gameRouteOld.post('/win-game', multerConfig_1.upload.array('file', 1), gameController.winGameResult); // For the win game
gameRouteOld.post('/loose-game', gameController.looseGameResult); // for the loose the game 
gameRouteOld.post('/cancel-game', gameController.cancelGame); // cancel game
gameRouteOld.get('/cancel-reason-list', gameController.cancelReasonList); // cancel game
exports.default = gameRouteOld;
