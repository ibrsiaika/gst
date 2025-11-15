import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity('gst_registrations')
@Unique(['tenantId', 'gstin'])
export class GstRegistration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'char', length: 15 })
  gstin: string;

  @Column({ type: 'char', length: 2, name: 'state_code' })
  stateCode: string;

  @Column({ type: 'date', name: 'registration_date' })
  registrationDate: Date;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Tenant, (tenant) => tenant.gstRegistrations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;
}
