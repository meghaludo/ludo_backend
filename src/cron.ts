import cron from 'node-cron';
import { updateGameResult } from './services/cronService';

// update game result cron
const gameResultCron = () => {
    updateGameResult();
};

// cron run every second
// cron.schedule('*/4 * * * *', gameResultCron);

// cron run every second
// cron.schedule('* * * * * *', gameResultCron);