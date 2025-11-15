import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../entities/tenant.entity';
import { GstRegistration } from '../../entities/gst-registration.entity';
import { User } from '../../entities/user.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(GstRegistration)
    private gstRegistrationRepository: Repository<GstRegistration>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Create tenant
    const tenant = this.tenantRepository.create({
      name: createTenantDto.name,
      pan: createTenantDto.pan,
      planCode: createTenantDto.planCode,
    });
    await this.tenantRepository.save(tenant);

    // Extract state code from GSTIN (first 2 digits)
    const stateCode = createTenantDto.primaryGstin.substring(0, 2);

    // Create GST registration
    const gstRegistration = this.gstRegistrationRepository.create({
      tenantId: tenant.id,
      gstin: createTenantDto.primaryGstin,
      stateCode,
      registrationDate: new Date(),
      status: 'ACTIVE',
      isPrimary: true,
    });
    await this.gstRegistrationRepository.save(gstRegistration);

    // Create admin user
    const user = this.userRepository.create({
      tenantId: tenant.id,
      email: createTenantDto.adminEmail,
      role: 'admin',
      twoFactorEnabled: true,
    });
    await this.userRepository.save(user);

    return tenant;
  }

  async findOne(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id },
      relations: ['gstRegistrations', 'users'],
    });
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      relations: ['gstRegistrations'],
    });
  }
}
