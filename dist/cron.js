"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cronService_1 = require("./services/cronService");
// update game result cron
const gameResultCron = () => {
    (0, cronService_1.updateGameResult)();
};
// cron run every second
// cron.schedule('*/4 * * * *', gameResultCron);
// cron run every second
// cron.schedule('* * * * * *', gameResultCron);
