import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('payment_method')
export class PaymentMethod {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    payment_method!: string;

    @Column({ type: 'int', nullable: true, comment: "1 : UPI, 2 : Whatsapp", default: 1 })
    type!: number;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}