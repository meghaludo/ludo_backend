import { StatusCodes } from "http-status-codes";
import AppDataSource from "../data-source";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import { UserNotification } from "../entity/userNotification.entity";

export class UserNotificationController {
    // create page notification
    public async create(req: any, res: any) {
        try {
            const details = req?.body;
            let notificationDetails : any;

            if (details['id']) {
                const fetchData : any = await AppDataSource.getRepository(UserNotification).findOne({
                    where: { id: Number(details['id']) }
                });

                fetchData['page'] = details['page'] || fetchData['page'];
                fetchData['title'] = details['title'] || fetchData['title'];
                fetchData['message'] = details['message'] || fetchData['message'];

                notificationDetails = await AppDataSource.getRepository(UserNotification).save(fetchData);

            } else {
                const existingNotification = await AppDataSource.getRepository(UserNotification).findOne({
                    where : { page : details['page'] }
                });

                if(existingNotification) {
                    return errorResponse(res, StatusCodes.CONFLICT, 'Page Notification Already Added Please Update');
                }

                notificationDetails = await AppDataSource.getRepository(UserNotification).save(details);
            }

            return sendResponse(res, StatusCodes.OK, "User Page Notification Created Successfully", notificationDetails);
        } catch (error) {
            console.log('Create notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // list of page notifications
    public async list(req: any, res: any) {
        try {
            const notificationList = await AppDataSource.getRepository(UserNotification).find();

            return sendResponse(res, StatusCodes.OK, "User Notification List Successfully", notificationList);
        } catch (error) {
            console.log('List notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // delete page notification
    public async delete(req: any, res: any) {
        const notificationId = Number(req.params.id);
        try {
            const notificationList = await AppDataSource.getRepository(UserNotification).delete({
                id: notificationId
            });

            return sendResponse(res, StatusCodes.OK, "Notification List Successfully", { id: notificationId });
        } catch (error) {
            console.log('Lsit notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }
}