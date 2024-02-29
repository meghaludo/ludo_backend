"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_source_1 = __importDefault(require("./data-source"));
const cors_1 = __importDefault(require("cors"));
const mainRoute_1 = __importDefault(require("./routes/mainRoute"));
const socket_1 = require("./socket/socket");
// import { rootSocket } from './socket/socket';
const PORT = process.env.PORT || 4100;
// require('dotenv').config();
// establish database connection
data_source_1.default
    .initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
// create and setup express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use('/uploads', express_1.default.static('uploads'));
// app.use(bodyParser.json());
app.use(express_1.default.json());
app.use('', mainRoute_1.default);
const httpServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
(0, socket_1.rootSocket)(httpServer);
