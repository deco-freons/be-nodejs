import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
class Preference {
    @PrimaryColumn({ name: 'preference_id' })
    preferenceID: string;

    @Column({ name: 'preference_name', unique: true })
    preferenceName: string;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Preference;
