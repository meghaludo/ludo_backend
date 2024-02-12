import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('contact_us')
export class ContactUs {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    intagram!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    telegram!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    whatsapp!: string;

    @Column({ type: 'int', default: 1 })
    status!: number;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}