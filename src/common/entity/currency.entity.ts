import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
class Currency {
    @PrimaryColumn({ name: 'currency_short_name' })
    currencyShortName: string;

    @Column({ name: 'currency_long_name', unique: true })
    currencyLongName: string;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Currency;
