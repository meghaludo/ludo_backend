import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { GameTable } from "./gameTable.entity";

@Entity('game_user_result')
export class GameUserResult {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: true })
    game_table_id!: number;

    @Column({ type: 'int', nullable: true })
    winner_user_id!: number;

    @Column({ type: 'int', nullable: true })
    loose_user_id!: number;

    @Column({ type: 'int', nullable: true })
    cancel_user_id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image!: string;

    @Column({ type: 'text', nullable: true })
    cancel_reasone!: string;

    @Column({ type: 'int', default: 0 })
    admin_verify!: number;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;

    @ManyToOne(() => GameTable, gameTable => gameTable.gameUserResults)
    @JoinColumn({ name: "game_table_id", referencedColumnName: "id" })
    gameTable!: GameTable;
}