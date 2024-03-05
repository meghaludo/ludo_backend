import { StatusCodes } from "http-status-codes";
import { INTERNAL_SERVER_ERROR } from "../constants/message";
import { errorResponse, sendResponse } from "../utils/responseUtil";
import AppDataSource from "../data-source";
import { Notification } from "../entity/notifucation.entity";

export class NotificationController {
    // create 
    public async create(req: any, res: any) {
        try {
            const details = req?.body;
            let notificationDetails : any;

            if (details['id']) {
                const fetchData : any = await AppDataSource.getRepository(Notification).findOne({
                    where: { id: Number(details['id']) }
                });

                fetchData['title'] = details['title'];
                fetchData['message'] = details['message'];
                fetchData['image'] = req?.files[0]?.filename || fetchData['image'];

                notificationDetails = await AppDataSource.getRepository(Notification).save(fetchData);

            } else {
                details['image'] = req?.files[0]?.filename;

                notificationDetails = await AppDataSource.getRepository(Notification).save(details);
            }

            return sendResponse(res, StatusCodes.OK, "Notification Created Successfully", notificationDetails);
        } catch (error) {
            console.log('Create notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // list
    public async list(req: any, res: any) {
        try {
            const notificationList = await AppDataSource.getRepository(Notification).find();

            return sendResponse(res, StatusCodes.OK, "Notification List Successfully", notificationList);
        } catch (error) {
            console.log('Lsit notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }

    // delete
    public async delete(req: any, res: any) {
        const notificationId = Number(req.params.id);
        try {
            const notificationList = await AppDataSource.getRepository(Notification).delete({
                id: notificationId
            });

            return sendResponse(res, StatusCodes.OK, "Notification List Successfully", { id: notificationId });
        } catch (error) {
            console.log('Lsit notification', error);
            return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, INTERNAL_SERVER_ERROR);
        }
    }
}