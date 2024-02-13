import {Router} from 'express';
import {AuthController} from '../controllers/AuthController';

const authRoutes = Router();
const authController = new AuthController();

// Register user
authRoutes.post('/register', authController.register);

// User Login functionality  
authRoutes.post('/login', authController.login);

// User Login functionality  
authRoutes.post('/admin-login', authController.adminLogin);

// Verify username
authRoutes.post('/verify', authController.verifyUserName);

// Verify username
authRoutes.post('/hello', authController.hello);

// forgot-password
authRoutes.post('/forgot-password', authController.forgotPassword);

export default authRoutes;