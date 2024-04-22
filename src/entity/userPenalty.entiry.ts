import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_penalty')
export class UserPenalty {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: true })
    user_id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    amount!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title!: string;

    @Column({ type: 'text', nullable: true })
    message!: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_at!: Date;
}