import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('refer_commission')
export class ReferCommission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', default: 2 })
    commission!: number;

    @Column({ type: 'int', default: 1 })
    is_active!: number;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}