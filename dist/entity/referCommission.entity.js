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
exports.ReferCommission = void 0;
const typeorm_1 = require("typeorm");
let ReferCommission = class ReferCommission {
    id;
    commission;
    is_active;
    created_on;
};
exports.ReferCommission = ReferCommission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ReferCommission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 2 }),
    __metadata("design:type", Number)
], ReferCommission.prototype, "commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ReferCommission.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], ReferCommission.prototype, "created_on", void 0);
exports.ReferCommission = ReferCommission = __decorate([
    (0, typeorm_1.Entity)('refer_commission')
], ReferCommission);
