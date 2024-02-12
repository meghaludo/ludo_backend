import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('ludo_game_result')
export class LudoGameResult {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    Table!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    roomcode!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    Status!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    OwnerId!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    Ownername!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    OwnerStatus!: string;

    @Column({ type: 'datetime', nullable: true })
    UpdateAt!: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p1_name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p1_id!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p1_status!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p2_name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p2_id!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    p2_status!: string;

    @Column({ type: 'int', nullable: true })
    game_table_id!: number;

    @Column({ type: 'int', default: 0 })
    is_checked!: number;

    @Column({ type: 'int', default: 1 })
    is_active!: number;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}