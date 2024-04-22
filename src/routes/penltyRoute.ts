import { PenaltyController } from '../controllers/PenaltyController';
import { Router } from "express";

const penaltyRoute = Router();
const penaltyController = new PenaltyController();

// get penalty list
penaltyRoute.get('/list', penaltyController.getPenaltyList);

// get penalty list
penaltyRoute.post('/add', penaltyController.addPenalty);

export default penaltyRoute;