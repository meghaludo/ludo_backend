"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = require("../controllers/NotificationController");
const multerConfig_1 = require("../core/multerConfig");
const notificationRoute = (0, express_1.Router)();
const notificationController = new NotificationController_1.NotificationController();
notificationRoute.post('/add-edit', multerConfig_1.upload.array('image', 1), notificationController.create);
notificationRoute.get('/list', notificationController.list);
notificationRoute.delete('/delete/:id', notificationController.delete);
exports.default = notificationRoute;
