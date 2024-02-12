import { UserCommonController } from '../controllers/UserCommonController';
import { Router } from "express";

const userCommonRoute = Router();
const userCommonController = new UserCommonController();

// get contact-us page links
userCommonRoute.get('/contact-us', userCommonController.getContactUsDetails);

export default userCommonRoute;