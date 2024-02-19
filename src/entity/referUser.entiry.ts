import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('refer_user')
export class ReferTable {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable: true })
    user_id!: number;

    @Column({ type: 'int', nullable: true })
    refrence_user_id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    code!: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}