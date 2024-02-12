import { Router } from "express";
import authRoutes from "./authRoute";
import userRoutes from "./userRoute";
import { verifyToken } from "../middleware/tokenMiddleware";
import adminAuthRoutes from "./adminAuthRoute";
import adminRoute from "./adminRoute";
import userCommonRoute from "./userCommonRoute";
import gameRoute from "./gameRoute";

const mainRoutes = Router();

// Usr APIS
mainRoutes.use('/user/auth', authRoutes);
mainRoutes.use('/user', verifyToken, userRoutes);
mainRoutes.use('/user-common', userCommonRoute);

// Admin APIS
mainRoutes.use('/admin/auth', adminAuthRoutes);
mainRoutes.use('/admin', verifyToken, adminRoute);

// Game APIs
mainRoutes.use("/game", verifyToken, gameRoute);

export default mainRoutes;