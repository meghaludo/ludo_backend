"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const cronService_1 = require("./services/cronService");
// update game result cron
const gameResultCron = () => {
    (0, cronService_1.updateGameResult)();
};
// cron run every second
node_cron_1.default.schedule('*/4 * * * *', gameResultCron);
// cron run every second
// cron.schedule('* * * * * *', gameResultCron);
