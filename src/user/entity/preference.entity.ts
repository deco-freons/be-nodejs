import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
class Preference {
    @PrimaryColumn({ name: 'preference_id' })
    preferenceID: string;

    @Column({ name: 'preference_name' })
    preferenceName: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

export default Preference;
