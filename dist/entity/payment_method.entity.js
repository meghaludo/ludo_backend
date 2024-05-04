"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = void 0;
const typeorm_1 = require("typeorm");
let PaymentMethod = class PaymentMethod {
    id;
    payment_method;
    type;
    created_on;
};
exports.PaymentMethod = PaymentMethod;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentMethod.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentMethod.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, comment: "1 : UPI, 2 : Whatsapp", default: 1 }),
    __metadata("design:type", Number)
], PaymentMethod.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], PaymentMethod.prototype, "created_on", void 0);
exports.PaymentMethod = PaymentMethod = __decorate([
    (0, typeorm_1.Entity)('payment_method')
], PaymentMethod);
