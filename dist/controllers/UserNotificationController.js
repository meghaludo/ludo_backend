"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserNotificationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const data_source_1 = __importDefault(require("../data-source"));
const message_1 = require("../constants/message");
const responseUtil_1 = require("../utils/responseUtil");
const userNotification_entity_1 = require("../entity/userNotification.entity");
class UserNotificationController {
    // create page notification
    async create(req, res) {
        try {
            const details = req?.body;
            let notificationDetails;
            if (details['id']) {
                const fetchData = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).findOne({
                    where: { id: Number(details['id']) }
                });
                fetchData['page'] = details['page'] || fetchData['page'];
                fetchData['title'] = details['title'] || fetchData['title'];
                fetchData['message'] = details['message'] || fetchData['message'];
                notificationDetails = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).save(fetchData);
            }
            else {
                const existingNotification = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).findOne({
                    where: { page: details['page'] }
                });
                if (existingNotification) {
                    return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.CONFLICT, 'Page Notification Already Added Please Update');
                }
                notificationDetails = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).save(details);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Page Notification Created Successfully", notificationDetails);
        }
        catch (error) {
            console.log('Create notification', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // list of page notifications
    async list(req, res) {
        try {
            const notificationList = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "User Notification List Successfully", notificationList);
        }
        catch (error) {
            console.log('List notification', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // delete page notification
    async delete(req, res) {
        const notificationId = Number(req.params.id);
        try {
            const notificationList = await data_source_1.default.getRepository(userNotification_entity_1.UserNotification).delete({
                id: notificationId
            });
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Notification List Successfully", { id: notificationId });
        }
        catch (error) {
            console.log('Lsit notification', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
}
exports.UserNotificationController = UserNotificationController;
