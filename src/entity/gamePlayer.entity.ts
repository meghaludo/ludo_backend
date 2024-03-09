import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { GameTable } from "./gameTable.entity";

@Entity('game_player')
export class GamePlayer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: true })
    game_table_id!: number;

    @Column({ type: 'int', nullable: true })
    p_id!: number | any;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p_name!: string | any;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p_status!: string | any;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image!: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;

    @UpdateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
    modified_on!: Date;

    @ManyToOne(() => GameTable, gameTable => gameTable.gamePlayer)
    @JoinColumn({ name: "game_table_id", referencedColumnName: "id" })
    gameTable!: GameTable;

    @ManyToOne(() => User)
    @JoinColumn({ name: "p_id", referencedColumnName: "id" })
    playerOne!: User;
}