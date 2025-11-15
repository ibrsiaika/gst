import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GST Compliance SaaS API')
    .setDescription(
      'OpenAPI specification for the GST compliance MVP covering invoices, IRP submission, e-way bills, GSTIN verification, reporting, subscriptions, and admin management.',
    )
    .setVersion('0.1.0')
    .addBearerAuth()
    .addServer('http://localhost:3000/v1', 'Development')
    .addServer('https://sandbox.api.gst-saas.local/v1', 'Sandbox')
    .addServer('https://api.gst-saas.local/v1', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Set global prefix
  app.setGlobalPrefix('v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/v1`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();

