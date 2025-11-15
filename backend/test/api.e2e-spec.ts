import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createINestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - should return app info', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  it('/v1/tenants (POST) - should create a tenant', async () => {
    const createTenantDto = {
      name: 'Test Company Ltd',
      pan: 'ABCDE1234F',
      planCode: 'STARTER',
      primaryGstin: '29ABCDE1234F2Z5',
      adminEmail: 'admin@testcompany.com',
    };

    const response = await request(app.getHttpServer())
      .post('/v1/tenants')
      .send(createTenantDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createTenantDto.name);
    expect(response.body.pan).toBe(createTenantDto.pan);
  });

  it('/v1/tenants (POST) - should reject invalid GSTIN format', async () => {
    const createTenantDto = {
      name: 'Test Company Ltd',
      pan: 'ABCDE1234F',
      planCode: 'STARTER',
      primaryGstin: 'INVALID_GSTIN',
      adminEmail: 'admin@testcompany.com',
    };

    await request(app.getHttpServer())
      .post('/v1/tenants')
      .send(createTenantDto)
      .expect(400);
  });
});
