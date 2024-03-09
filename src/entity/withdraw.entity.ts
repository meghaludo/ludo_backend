import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('withdraws')
export class Withdraw {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'int', nullable : false })
    user_id!: number;

    @Column({ type: 'varchar', length: 500, nullable: false })
    amount!: string;
    
    @Column({ type: 'int', default : 3,  nullable : false })
    status!: number; // 0: pending, 1: verify, 2: decline , 3 : processing

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id", referencedColumnName: "id" })
    userDetail!: User;

    @Column({ type: 'varchar', length: 255, nullable: false })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    mobile_no!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    account_no!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    ifsc!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    branch!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    bank_name!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    upi!: string;
}