"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PenaltyController_1 = require("../controllers/PenaltyController");
const express_1 = require("express");
const penaltyRoute = (0, express_1.Router)();
const penaltyController = new PenaltyController_1.PenaltyController();
// get penalty list
penaltyRoute.get('/list', penaltyController.getPenaltyList);
// get penalty list
penaltyRoute.post('/add', penaltyController.addPenalty);
exports.default = penaltyRoute;
