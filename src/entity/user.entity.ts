import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    full_name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    ludo_name!: string;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    mobile_no!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    password!: string;

    @Column({ type: 'varchar', length: 500, default : '0' })
    amount!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    otp!: string;

    @Column({ type: 'int', default : 0 })
    role!: number;

    @Column({ type: 'int', default : 1 })
    status!: number;
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    refer_code!: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}