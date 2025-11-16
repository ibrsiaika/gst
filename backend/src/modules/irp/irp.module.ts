import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrpService } from './irp.service';
import { IrpController } from './irp.controller';
import { Invoice } from '../../entities/invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice])],
  controllers: [IrpController],
  providers: [IrpService],
  exports: [IrpService],
})
export class IrpModule {}
