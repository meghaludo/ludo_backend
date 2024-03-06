"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const authRoutes = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
// Register user
authRoutes.post('/register', authController.register);
// User Login functionality  
authRoutes.post('/login', authController.login);
// User Login functionality  
authRoutes.post('/verify-otp', authController.verifyOTP);
// User Login functionality  
authRoutes.post('/admin-login', authController.adminLogin);
// Verify username
authRoutes.post('/verify', authController.verifyUserName);
// forgot-password
authRoutes.post('/forgot-password', authController.forgotPassword);
exports.default = authRoutes;
