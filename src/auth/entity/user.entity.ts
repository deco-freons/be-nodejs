import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
class User {

    @PrimaryGeneratedColumn({name: "user_id"})
    userID: number

    @Column({name: "username", unique: true})
    username: string

    @Column({name: "first_name"})
    firstName: string

    @Column({name: "last_name"})
    lastName: string

    @Column({name: "email", unique: true})
    email: string

    @Column({name: "password", select: false})
    password: string

    @Column({name: "birth_date", type: "date"})
    birthDate: string

    @Column({name: "is_verified", default: false})
    isVerified: boolean

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;
        
    @UpdateDateColumn({name: "updated_at"})
    updatedAt: Date;

}

export default User;