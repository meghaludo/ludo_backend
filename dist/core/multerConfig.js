"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads/'); // Set the destination folder for uploaded files
    },
    filename: (req, file, callback) => {
        console.log('file :', file);
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const uniqueSuffix = Date.now();
        callback(null, uniqueSuffix + '-' + file.originalname);
    },
});
exports.upload = (0, multer_1.default)({ storage });
