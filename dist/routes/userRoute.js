"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserController_1 = require("./../controllers/UserController");
const express_1 = require("express");
const userRoutes = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// update user
userRoutes.post('/user-update', userController.updateUser);
// add wallet
userRoutes.post('/add-wallet', userController.addWalletAmount);
userRoutes.get('/wallet-history', userController.walletHistory);
userRoutes.get('/wallet-amount', userController.getWalletAmount);
// withdraw amount
userRoutes.post('/withdraw-request', userController.addWithdrawRequest);
userRoutes.get('/withdraw-history', userController.withdrawHistory);
// update user ludo name
userRoutes.post('/update-ludo-name', userController.updateLudoName);
exports.default = userRoutes;
