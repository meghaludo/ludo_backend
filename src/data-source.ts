import { DataSource } from "typeorm";
import { AdminCommission } from "./entity/adminCommission.entity";
import { ContactUs } from "./entity/contactUs.entity";
import { GamePlayer } from "./entity/gamePlayer.entity";
import { ReasonMaster } from "./entity/gameCancelReasonMaster.entity";
import { GameTable } from "./entity/gameTable.entity";
import { User } from "./entity/user.entity";
import { UserWallet } from "./entity/wallet.entity";
import { Withdraw } from "./entity/withdraw.entity";
import { LudoGameResult } from "./entity/ludoGameResult.entity";
import { ReferCommission } from "./entity/referCommission.entity";
import { ReferTable } from "./entity/referUser.entiry";
import { UserNotification } from "./entity/userNotification.entity";
import { Notification } from "./entity/notifucation.entity";
import { PaymentMobile } from "./entity/paymentMobile.entity";
import { UserPenalty } from "./entity/userPenalty.entiry";

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

export const AppDataSource = new DataSource({
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
    AdminCommission,
    ContactUs,
    ReasonMaster,
    GamePlayer,
    GameTable,
    LudoGameResult,
    Notification,
    ReferCommission,
    ReferTable,
    User,
    UserNotification,
    UserWallet,
    Withdraw,
    PaymentMobile,
    UserPenalty
  ],
  // entities: ["entity/*.entity.{ts,js}"],
  logging: true,
  synchronize: true,
});

export default AppDataSource;