import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

@Entity()
class Event {
    @PrimaryGeneratedColumn({ name: 'event_id' })
    eventID: number;

    @Column({ name: 'event_name' })
    eventName: string;

    @ManyToMany(() => Preference)
    @JoinTable({
        name: 'event_categories',
        joinColumn: {
            name: 'event_id',
            referencedColumnName: 'eventID',
        },
        inverseJoinColumn: {
            name: 'category_id',
            referencedColumnName: 'preferenceID',
        },
    })
    categories: Preference[];

    @Column({ name: 'date' })
    date: string;

    @Column({ name: 'start_time' })
    startTime: string;

    @Column({ name: 'end_time' })
    endTime: string;

    @Column({ name: 'longitude', type: 'float' })
    longitude: number;

    @Column({ name: 'latitude', type: 'float' })
    latitude: number;

    @Column({ name: 'description' })
    description: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'event_creator', referencedColumnName: 'userID' })
    eventCreator: User;

    @ManyToMany(() => User, (user) => user.eventJoined)
    participants: User[];

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Event;
