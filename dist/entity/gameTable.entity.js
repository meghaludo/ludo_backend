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
exports.GameTable = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const gamePlayer_entity_1 = require("./gamePlayer.entity");
// import { GameUserResult } from "./gameUserResult.entity";
let GameTable = class GameTable {
    id;
    // @Column({ type: 'int', nullable: true })
    // user_id!: number;
    game_code;
    amount;
    winner_amount;
    admin_commission;
    game_owner_id;
    cancel_user_id;
    cancel_reason;
    // @Column({ type: 'varchar', length: 255, nullable: true })
    // p1_name!: string | any;
    // @Column({ type: 'varchar', length: 255, nullable: true })
    // p1_status!: string | any;
    // @Column({ type: 'int', nullable: true })
    // p1_id!: number | any;
    // @Column({ type: 'varchar', length: 255, nullable: true })
    // p2_name!: string | any;
    // @Column({ type: 'varchar', length: 255, nullable: true })
    // p2_status!: string | any;
    // @Column({ type: 'int', nullable: true })
    // p2_id!: number | any;
    game_result_id;
    // @Column({ type: 'int', default : 0 }) 
    // is_running!: number;   // if 0 then waiting for player if 1 then running
    admin_verify;
    // @Column({ type: 'int', default : 1 })
    // is_active!: number;
    status; // 1 : Created, 2: Requested, 3: Running, 4: Completed, 5: Cancel   
    created_on;
    // @ManyToOne(() => User)
    // @JoinColumn({ name: "p1_id", referencedColumnName: "id" })
    // playerOne!: User;
    // @ManyToOne(() => User)
    // @JoinColumn({ name: "p2_id", referencedColumnName: "id" })
    // playerTwo!: User;
    gameOwner;
    gamePlayer;
};
exports.GameTable = GameTable;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GameTable.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GameTable.prototype, "game_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GameTable.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GameTable.prototype, "winner_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], GameTable.prototype, "admin_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameTable.prototype, "game_owner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameTable.prototype, "cancel_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], GameTable.prototype, "cancel_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], GameTable.prototype, "game_result_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], GameTable.prototype, "admin_verify", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], GameTable.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' }),
    __metadata("design:type", Date)
], GameTable.prototype, "created_on", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: "game_owner_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], GameTable.prototype, "gameOwner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => gamePlayer_entity_1.GamePlayer, gamePlayer => gamePlayer.gameTable),
    __metadata("design:type", Array)
], GameTable.prototype, "gamePlayer", void 0);
exports.GameTable = GameTable = __decorate([
    (0, typeorm_1.Entity)('game_table')
], GameTable);
