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
exports.GamePlayer = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const gameTable_entity_1 = require("./gameTable.entity");
let GamePlayer = class GamePlayer {
    id;
    game_table_id;
    p_id;
    p_name;
    p_status;
    image;
    created_on;
    modified_on;
    gameTable;
    playerOne;
};
exports.GamePlayer = GamePlayer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GamePlayer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GamePlayer.prototype, "game_table_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Object)
], GamePlayer.prototype, "p_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], GamePlayer.prototype, "p_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], GamePlayer.prototype, "p_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GamePlayer.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], GamePlayer.prototype, "created_on", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], GamePlayer.prototype, "modified_on", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => gameTable_entity_1.GameTable, gameTable => gameTable.gamePlayer),
    (0, typeorm_1.JoinColumn)({ name: "game_table_id", referencedColumnName: "id" }),
    __metadata("design:type", gameTable_entity_1.GameTable)
], GamePlayer.prototype, "gameTable", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "p_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], GamePlayer.prototype, "playerOne", void 0);
exports.GamePlayer = GamePlayer = __decorate([
    (0, typeorm_1.Entity)('game_player')
], GamePlayer);
