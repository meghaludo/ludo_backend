"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymentController_1 = require("../controllers/PaymentController");
const paymentRoute = (0, express_1.Router)();
const paymentController = new PaymentController_1.PaymentController();
// get penalty list
paymentRoute.post('/create-order', paymentController.createOrder);
// get penalty list
paymentRoute.post('/order-status', paymentController.getOrderStatus);
// show pending withdraw count 
paymentRoute.post('/change-payment-method', paymentController.changePaymentMethod);
paymentRoute.get('/get-payment-method', paymentController.getActivePaymentGateway);
exports.default = paymentRoute;
