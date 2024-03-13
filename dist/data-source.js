"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
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
    entities: ["dist/entity/*.entity.js"],
    // entities: ["entity/*.entity.{ts,js}"],
    logging: true,
    synchronize: true,
});
exports.default = exports.AppDataSource;
