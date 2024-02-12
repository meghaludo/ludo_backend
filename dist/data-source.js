"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "ludo_game",
    entities: ["src/entity/{*.ts, *.js}"],
    //   entities: ["dist/entity/*.entity.js"],
    // entities: ["entity/*.entity.{ts,js}"],
    logging: true,
    synchronize: false,
});
exports.default = exports.AppDataSource;
