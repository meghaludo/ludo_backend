import {Router} from 'express';
import {AuthController} from '../controllers/AuthController';

const adminAuthRoutes = Router();
const authController = new AuthController();

// Register user
adminAuthRoutes.post('/register', authController.register);

// User Login functionality  
adminAuthRoutes.post('/login', authController.adminLogin);

// Verify username
adminAuthRoutes.post('/verify', authController.verifyUserName);

// forgot-password
adminAuthRoutes.post('/forgot-password', authController.forgotPassword);

export default adminAuthRoutes;