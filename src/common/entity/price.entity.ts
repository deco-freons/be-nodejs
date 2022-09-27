import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import Currency from './currency.entity';

@Entity()
class Price {
    @PrimaryGeneratedColumn({ name: 'price_id' })
    priceID: string;

    @Column({ name: 'fee' })
    fee: number;

    @ManyToOne(() => Currency, (currency) => currency.currencyShortName, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
    @JoinColumn({ name: 'currency', referencedColumnName: 'currencyShortName' })
    currency: Currency;

    @CreateDateColumn({ name: 'created_at', select: false })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', select: false })
    updatedAt: Date;
}

export default Price;
