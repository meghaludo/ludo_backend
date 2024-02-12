"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UserCommonController_1 = require("../controllers/UserCommonController");
const express_1 = require("express");
const userCommonRoute = (0, express_1.Router)();
const userCommonController = new UserCommonController_1.UserCommonController();
// get contact-us page links
userCommonRoute.get('/contact-us', userCommonController.getContactUsDetails);
exports.default = userCommonRoute;
