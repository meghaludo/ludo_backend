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
exports.GameUserResult = void 0;
const typeorm_1 = require("typeorm");
const gameTable_entity_1 = require("./gameTable.entity");
let GameUserResult = class GameUserResult {
    id;
    game_table_id;
    winner_user_id;
    loose_user_id;
    cancel_user_id;
    image;
    cancel_reasone;
    admin_verify;
    created_on;
    gameTable;
};
exports.GameUserResult = GameUserResult;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameUserResult.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameUserResult.prototype, "game_table_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameUserResult.prototype, "winner_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameUserResult.prototype, "loose_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameUserResult.prototype, "cancel_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GameUserResult.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], GameUserResult.prototype, "cancel_reasone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GameUserResult.prototype, "admin_verify", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], GameUserResult.prototype, "created_on", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gameTable_entity_1.GameTable, gameTable => gameTable.gameUserResults),
    (0, typeorm_1.JoinColumn)({ name: "game_table_id", referencedColumnName: "id" }),
    __metadata("design:type", gameTable_entity_1.GameTable)
], GameUserResult.prototype, "gameTable", void 0);
exports.GameUserResult = GameUserResult = __decorate([
    (0, typeorm_1.Entity)('game_user_result')
], GameUserResult);
