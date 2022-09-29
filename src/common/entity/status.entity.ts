import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
class Status {
    @PrimaryColumn({ name: 'status_id' })
    statusID: string;

    @Column({ name: 'status_name', unique: true })
    statusName: string;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Status;
