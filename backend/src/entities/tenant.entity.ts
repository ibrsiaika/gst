import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GstRegistration } from './gst-registration.entity';
import { User } from './user.entity';
import { Invoice } from './invoice.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'char', length: 10 })
  pan: string;

  @Column({ type: 'text', name: 'plan_code' })
  planCode: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GstRegistration, (registration) => registration.tenant)
  gstRegistrations: GstRegistration[];

  @OneToMany(() => User, (user) => user.tenant)
  users: User[];

  @OneToMany(() => Invoice, (invoice) => invoice.tenant)
  invoices: Invoice[];
}
