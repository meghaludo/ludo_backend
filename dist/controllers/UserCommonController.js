"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCommonController = void 0;
const http_status_codes_1 = require("http-status-codes");
const message_1 = require("../constants/message");
const responseUtil_1 = require("../utils/responseUtil");
const data_source_1 = __importDefault(require("../data-source"));
const contactUs_entity_1 = require("../entity/contactUs.entity");
class UserCommonController {
    // get contact-us details
    async getContactUsDetails(req, res) {
        try {
            const contactUsDetails = await data_source_1.default.getRepository(contactUs_entity_1.ContactUs).find();
            return (0, responseUtil_1.sendResponse)(res, http_status_codes_1.StatusCodes.OK, "Update User Successfully", contactUsDetails[0]);
        }
        catch (error) {
            return (0, responseUtil_1.errorResponse)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message_1.INTERNAL_SERVER_ERROR, error);
        }
    }
}
exports.UserCommonController = UserCommonController;
