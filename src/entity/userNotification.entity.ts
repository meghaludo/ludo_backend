import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_notification')
export class UserNotification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    page!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title!: string;

    @Column({ type: 'text', nullable: true })
    message!: string;

    @CreateDateColumn({ type: 'timestamp', precision: 6, default: () => 'CURRENT_TIMESTAMP(6)' })
    created_on!: Date;
}