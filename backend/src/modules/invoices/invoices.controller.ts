import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Query('tenantId') tenantId: string,
  ) {
    return this.invoicesService.create(tenantId, createInvoiceDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get()
  async findAll(@Query('tenantId') tenantId: string) {
    return this.invoicesService.findAll(tenantId);
  }

  @Post(':id/einvoice')
  async submitToIrp(@Param('id') id: string) {
    return this.invoicesService.submitToIrp(id);
  }
}
