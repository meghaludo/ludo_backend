"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const http_status_codes_1 = require("http-status-codes");
const message_1 = require("../constants/message");
const responseUtil_1 = require("../utils/responseUtil");
const data_source_1 = __importDefault(require("../data-source"));
const notifucation_entity_1 = require("../entity/notifucation.entity");
class NotificationController {
    // create 
    async create(req, res) {
        try {
            const details = req?.body;
            let notificationDetails;
            if (details['id']) {
                const fetchData = await data_source_1.default.getRepository(notifucation_entity_1.Notification).findOne({
                    where: { id: Number(details['id']) }
                });
                fetchData['title'] = details['title'];
                fetchData['message'] = details['message'];
                fetchData['image'] = req?.files[0]?.filename || fetchData['image'];
                notificationDetails = await data_source_1.default.getRepository(notifucation_entity_1.Notification).save(fetchData);
            }
            else {
                details['image'] = req?.files[0]?.filename;
                notificationDetails = await data_source_1.default.getRepository(notifucation_entity_1.Notification).save(details);
            }
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Notification Created Successfully", notificationDetails);
        }
        catch (error) {
            console.log('Create notification', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // list
    async list(req, res) {
        try {
            const notificationList = await data_source_1.default.getRepository(notifucation_entity_1.Notification).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Notification List Successfully", notificationList);
        }
        catch (error) {
            console.log('Lsit notification', error);
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR);
        }
    }
    // delete
    async delete(req, res) {
        const notificationId = Number(req.params.id);
        try {
            const notificationList = await data_source_1.default.getRepository(notifucation_entity_1.Notification).delete({
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
exports.NotificationController = NotificationController;
