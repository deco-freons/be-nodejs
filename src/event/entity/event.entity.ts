import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import User from '../../auth/entity/user.entity';
import Image from '../../image/entity/image.entity';
import Location from '../../location/entity/location.entity';
import Preference from '../../common/entity/preference.entity';

@Entity()
class Event {
    @PrimaryGeneratedColumn({ name: 'event_id' })
    eventID: number;

    @Column({ name: 'event_name' })
    eventName: string;

    @ManyToMany(() => Preference, { onUpdate: 'CASCADE' })
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

    @ManyToOne(() => Location, (location) => location.locationID, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'location' })
    location: Location;

    @Column({ name: 'location_name', nullable: false, default: 'Location Unknown' })
    locationName: string;

    @Column({ name: 'short_description', nullable: false, default: 'No short description.' })
    shortDescription: string;

    @Column({ name: 'description', default: 'No description.' })
    description: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'event_creator', referencedColumnName: 'userID' })
    eventCreator: User;

    @ManyToMany(() => User, (user) => user.eventJoined, { onDelete: 'CASCADE', onUpdate: 'SET NULL' })
    participants: User[];

    @OneToOne(() => Image, (image) => image.imageID, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'event_image', referencedColumnName: 'imageID' })
    eventImage: Image;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Event;
