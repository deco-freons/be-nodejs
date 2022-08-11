import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/**
 * @openapi
 * components:
 *  schemas:
 *    User:
 *      type: object
 *      required:
 *        - userID
 *        - username
 *        - firstName
 *        - lastName
 *        - email
 *        - password
 *        - confirmPassword
 *        - birthDate
 *      properties:
 *        username:
 *          type: string
 *        firstName:
 *          type: string
 *        lastName:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *        confirmPassword:
 *          type: string
 *        birthDate:
 *          type: date string
 *          example: '1990-01-01'
 */
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

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}

export default User;
