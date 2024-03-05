import { Router } from "express";
import { NotificationController } from "../controllers/NotificationController";
import { upload } from "../core/multerConfig";

const notificationRoute = Router();
const notificationController = new NotificationController();

notificationRoute.post('/add-edit', upload.array('image', 1), notificationController.create);
notificationRoute.get('/list', notificationController.list);
notificationRoute.delete('/delete/:id', notificationController.delete);

export default notificationRoute;