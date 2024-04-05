"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const adminCommission_entity_1 = require("./entity/adminCommission.entity");
const contactUs_entity_1 = require("./entity/contactUs.entity");
const gamePlayer_entity_1 = require("./entity/gamePlayer.entity");
const gameCancelReasonMaster_entity_1 = require("./entity/gameCancelReasonMaster.entity");
const gameTable_entity_1 = require("./entity/gameTable.entity");
const user_entity_1 = require("./entity/user.entity");
const wallet_entity_1 = require("./entity/wallet.entity");
const withdraw_entity_1 = require("./entity/withdraw.entity");
const ludoGameResult_entity_1 = require("./entity/ludoGameResult.entity");
const referCommission_entity_1 = require("./entity/referCommission.entity");
const referUser_entiry_1 = require("./entity/referUser.entiry");
const userNotification_entity_1 = require("./entity/userNotification.entity");
const notifucation_entity_1 = require("./entity/notifucation.entity");
const paymentMobile_entity_1 = require("./entity/paymentMobile.entity");
// export const AppDataSource = new DataSource({
//   type: "mysql",
//   host: "localhost",
//   port: 3306,
//   username: "root",
//   // password: "password",
//   password: "",
//   // database: "ludo_game",
//   database: "ludo_game",
//   entities: ["src/entity/{*.ts, *.js}"],
//   // entities: ["dist/entity/*.entity.js"],
//   // entities: ["entity/*.entity.{ts,js}"],
//   logging: true,
//   synchronize: false,
// });
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "password",
    // password: "password",
    // database: "ludo_game",
    database: "ludo_game",
    //  entities: ["src/entity/{*.ts, *.js}"],
    // entities: ["dist/entity/*.entity.js"],
    entities: [
        adminCommission_entity_1.AdminCommission,
        contactUs_entity_1.ContactUs,
        gameCancelReasonMaster_entity_1.ReasonMaster,
        gamePlayer_entity_1.GamePlayer,
        gameTable_entity_1.GameTable,
        ludoGameResult_entity_1.LudoGameResult,
        notifucation_entity_1.Notification,
        referCommission_entity_1.ReferCommission,
        referUser_entiry_1.ReferTable,
        user_entity_1.User,
        userNotification_entity_1.UserNotification,
        wallet_entity_1.UserWallet,
        withdraw_entity_1.Withdraw,
        paymentMobile_entity_1.PaymentMobile
    ],
    // entities: ["entity/*.entity.{ts,js}"],
    logging: true,
    synchronize: true,
});
exports.default = exports.AppDataSource;
