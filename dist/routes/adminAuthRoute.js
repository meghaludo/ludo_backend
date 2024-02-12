"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const adminAuthRoutes = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Register user
adminAuthRoutes.post('/register', authController.register);
// User Login functionality  
adminAuthRoutes.post('/login', authController.adminLogin);
// Verify username
adminAuthRoutes.post('/verify', authController.verifyUserName);
// forgot-password
adminAuthRoutes.post('/forgot-password', authController.forgotPassword);
exports.default = adminAuthRoutes;
