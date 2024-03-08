"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoute_1 = __importDefault(require("./authRoute"));
const userRoute_1 = __importDefault(require("./userRoute"));
const tokenMiddleware_1 = require("../middleware/tokenMiddleware");
const adminAuthRoute_1 = __importDefault(require("./adminAuthRoute"));
const adminRoute_1 = __importDefault(require("./adminRoute"));
const userCommonRoute_1 = __importDefault(require("./userCommonRoute"));
const gameRoute_1 = __importDefault(require("./gameRoute"));
const notificaionRoute_1 = __importDefault(require("./notificaionRoute"));
const userNotificationRoute_1 = __importDefault(require("./userNotificationRoute"));
const mainRoutes = (0, express_1.Router)();
// Usr APIS
mainRoutes.use('/user/auth', authRoute_1.default);
mainRoutes.use('/user', tokenMiddleware_1.verifyToken, userRoute_1.default);
mainRoutes.use('/user-common', userCommonRoute_1.default);
// Admin APIS
mainRoutes.use('/admin/auth', adminAuthRoute_1.default);
mainRoutes.use('/admin', tokenMiddleware_1.verifyToken, adminRoute_1.default);
// Game APIs
mainRoutes.use("/game", tokenMiddleware_1.verifyToken, gameRoute_1.default);
// mainRoutes.use("/game", gameRoute);
mainRoutes.use("/notification", notificaionRoute_1.default);
mainRoutes.use("/page-notification", userNotificationRoute_1.default);
exports.default = mainRoutes;
