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
exports.LudoGameResult = void 0;
const typeorm_1 = require("typeorm");
let LudoGameResult = class LudoGameResult {
    id;
    Table;
    roomcode;
    Status;
    OwnerId;
    Ownername;
    OwnerStatus;
    UpdateAt;
    p1_name;
    p1_id;
    p1_status;
    p2_name;
    p2_id;
    p2_status;
    game_table_id;
    is_checked;
    is_active;
    created_on;
};
exports.LudoGameResult = LudoGameResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LudoGameResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "Table", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "roomcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "OwnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "Ownername", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "OwnerStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    __metadata("design:type", Date)
], LudoGameResult.prototype, "UpdateAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p1_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p1_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p1_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p2_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p2_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], LudoGameResult.prototype, "p2_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], LudoGameResult.prototype, "game_table_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], LudoGameResult.prototype, "is_checked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], LudoGameResult.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], LudoGameResult.prototype, "created_on", void 0);
exports.LudoGameResult = LudoGameResult = __decorate([
    (0, typeorm_1.Entity)('ludo_game_result')
], LudoGameResult);
