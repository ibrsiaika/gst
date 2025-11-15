import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'invoice_id' })
  invoiceId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 8, name: 'hsn_code' })
  hsnCode: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  quantity: number;

  @Column({ type: 'varchar', length: 10, default: 'NOS' })
  unit: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'taxable_value' })
  taxableValue: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'tax_rate' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'cgst_amount', default: 0 })
  cgstAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'sgst_amount', default: 0 })
  sgstAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'igst_amount', default: 0 })
  igstAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'cess_amount', default: 0 })
  cessAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'tax_amount' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'item_total' })
  itemTotal: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
