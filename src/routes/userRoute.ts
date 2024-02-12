import { UserController } from './../controllers/UserController';
import { Router } from "express";

const userRoutes = Router();
const userController = new UserController();
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

export default userRoutes;