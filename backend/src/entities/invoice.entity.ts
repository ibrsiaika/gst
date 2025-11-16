import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from './user.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
@Unique(['tenantId', 'invoiceNumber'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'text', name: 'invoice_number' })
  invoiceNumber: string;

  @Column({ type: 'date', name: 'invoice_date' })
  invoiceDate: Date;

  @Column({ type: 'text', name: 'invoice_type' })
  invoiceType: 'B2B' | 'B2C' | 'EXPORT' | 'DEEMED_EXPORT' | 'SEZ_WITH_PAYMENT' | 'SEZ_WITHOUT_PAYMENT';

  @Column({ type: 'text', name: 'document_type', default: 'INV' })
  documentType: 'INV' | 'CRN' | 'DBN';

  @Column({ type: 'char', length: 15, name: 'seller_gstin' })
  sellerGstin: string;

  @Column({ type: 'text', name: 'seller_legal_name' })
  sellerLegalName: string;

  @Column({ type: 'text', name: 'seller_trade_name', nullable: true })
  sellerTradeName: string;

  @Column({ type: 'jsonb', name: 'seller_address' })
  sellerAddress: object;

  @Column({ type: 'text', name: 'buyer_gstin' })
  buyerGstin: string;

  @Column({ type: 'text', name: 'buyer_legal_name' })
  buyerLegalName: string;

  @Column({ type: 'jsonb', name: 'buyer_address' })
  buyerAddress: object;

  @Column({ type: 'char', length: 2, name: 'place_of_supply' })
  placeOfSupply: string;

  @Column({ type: 'text', name: 'supply_type' })
  supplyType: 'INTRA_STATE' | 'INTER_STATE';

  @Column({ type: 'boolean', name: 'reverse_charge', default: false })
  reverseCharge: boolean;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'taxable_value' })
  taxableValue: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_cgst', default: 0 })
  totalCgst: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_sgst', default: 0 })
  totalSgst: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_igst', default: 0 })
  totalIgst: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_cess', default: 0 })
  totalCess: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'tax_amount' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 14, scale: 2, name: 'total_value' })
  totalValue: number;

  @Column({ type: 'text', name: 'irp_status', default: 'pending' })
  irpStatus: 'pending' | 'queued' | 'submitted' | 'success' | 'failed' | 'cancelled';

  @Column({ type: 'text', unique: true, nullable: true })
  irn: string;

  @Column({ type: 'text', name: 'ack_no', nullable: true })
  ackNo: string;

  @Column({ type: 'timestamptz', name: 'ack_date', nullable: true })
  ackDate: Date;

  @Column({ type: 'text', name: 'signed_json_url', nullable: true })
  signedJsonUrl: string;

  @Column({ type: 'text', name: 'qr_code_url', nullable: true })
  qrCodeUrl: string;

  @Column({ type: 'timestamptz', name: 'irp_submitted_at', nullable: true })
  irpSubmittedAt: Date;

  @Column({ type: 'text', name: 'irp_error_message', nullable: true })
  irpErrorMessage: string;

  @Column({ type: 'jsonb', name: 'export_details', nullable: true })
  exportDetails: object;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}
