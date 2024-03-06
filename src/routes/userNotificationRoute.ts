import { Router } from "express";
import { UserNotificationController } from "../controllers/UserNotificationController";

const userNotificationRoute = Router();
const notificationController = new UserNotificationController();

userNotificationRoute.post('/add-edit', notificationController.create);
userNotificationRoute.get('/list', notificationController.list);
userNotificationRoute.delete('/delete/:id', notificationController.delete);

export default userNotificationRoute;