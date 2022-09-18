import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Preference from '../../user/entity/preference.entity';
import Event from '../../event/entity/event.entity';
import Location from '../../location/entity/location.entity';

@Entity()
class User {
    @PrimaryGeneratedColumn({ name: 'user_id' })
    userID: number;

    @Column({ name: 'username', unique: true })
    username: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column({ name: 'email', unique: true })
    email: string;

    @Column({ name: 'password', select: false })
    password: string;

    @Column({ name: 'birth_date', type: 'date' })
    birthDate: string;

    @ManyToOne(() => Location, (location) => location.locationID, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'location' })
    location: Location;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'is_first_login', default: true })
    isFirstLogin: boolean;

    @Column({ name: 'is_share_location', default: false })
    isShareLocation: boolean;

    @ManyToMany(() => Preference, { onUpdate: 'CASCADE' })
    @JoinTable({
        name: 'user_preferences',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'userID',
        },
        inverseJoinColumn: {
            name: 'preference_id',
            referencedColumnName: 'preferenceID',
        },
    })
    preferences: Preference[];

    @OneToMany(() => Event, (event) => event.eventCreator, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    eventCreated: Event[];

    @ManyToMany(() => Event, (event) => event.participants, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinTable({
        name: 'user_joined_event',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'userID',
        },
        inverseJoinColumn: {
            name: 'event_id',
            referencedColumnName: 'eventID',
        },
    })
    eventJoined: Event[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

export default User;
