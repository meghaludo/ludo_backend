import { StatusCodes } from "http-status-codes";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import AppDataSource from "../data-source";
import { ContactUs } from "../entity/contactUs.entity";

export class UserCommonController {
    // get contact-us details
    public async getContactUsDetails(req: any, res: any) {
        try {
            const contactUsDetails = await AppDataSource.getRepository(ContactUs).find()

            return sendResponse(res, StatusCodes.OK, "Update User Successfully", contactUsDetails[0]);
        } catch (error) {
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR, error);
        }
    }
}