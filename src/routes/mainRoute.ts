import { Router } from "express";
import authRoutes from "./authRoute";
import userRoutes from "./userRoute";
import { verifyToken } from "../middleware/tokenMiddleware";
import adminAuthRoutes from "./adminAuthRoute";
import adminRoute from "./adminRoute";
import userCommonRoute from "./userCommonRoute";
import gameRoute from "./gameRoute";
import notificationRoute from "./notificaionRoute";
import userNotificationRoute from "./userNotificationRoute";

const mainRoutes = Router();

// Usr APIS
mainRoutes.use('/user/auth', authRoutes);
mainRoutes.use('/user', userRoutes);
mainRoutes.use('/user-common', userCommonRoute);

// Admin APIS
mainRoutes.use('/admin/auth', adminAuthRoutes);
mainRoutes.use('/admin', verifyToken, adminRoute);

// Game APIs
mainRoutes.use("/game", verifyToken, gameRoute);
// mainRoutes.use("/game", gameRoute);
mainRoutes.use("/notification", notificationRoute);
mainRoutes.use("/page-notification", userNotificationRoute);

export default mainRoutes;