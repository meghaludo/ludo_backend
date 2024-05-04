import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";

const paymentRoute = Router();
const paymentController = new PaymentController();

// get penalty list
paymentRoute.post('/create-order', paymentController.createOrder);

// get penalty list
paymentRoute.post('/order-status', paymentController.getOrderStatus);

// show pending withdraw count 
paymentRoute.post('/change-payment-method', paymentController.changePaymentMethod);
paymentRoute.get('/get-payment-method', paymentController.getActivePaymentGateway);

export default paymentRoute;