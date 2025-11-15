import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceItem } from '../../entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
  ) {}

  async create(
    tenantId: string,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    // Create invoice
    const invoice = this.invoiceRepository.create({
      tenantId,
      invoiceNumber: createInvoiceDto.invoiceNumber,
      invoiceDate: new Date(createInvoiceDto.invoiceDate),
      invoiceType: createInvoiceDto.invoiceType as any,
      documentType: (createInvoiceDto.documentType || 'INV') as any,
      sellerGstin: createInvoiceDto.sellerGstin,
      sellerLegalName: createInvoiceDto.sellerLegalName,
      sellerTradeName: createInvoiceDto.sellerTradeName,
      sellerAddress: createInvoiceDto.sellerAddress,
      buyerGstin: createInvoiceDto.buyerGstin,
      buyerLegalName: createInvoiceDto.buyerLegalName,
      buyerAddress: createInvoiceDto.buyerAddress,
      placeOfSupply: createInvoiceDto.placeOfSupply,
      supplyType: createInvoiceDto.supplyType as any,
      reverseCharge: createInvoiceDto.reverseCharge || false,
      taxableValue: createInvoiceDto.totalTaxableValue,
      totalCgst: createInvoiceDto.totalCgst || 0,
      totalSgst: createInvoiceDto.totalSgst || 0,
      totalIgst: createInvoiceDto.totalIgst || 0,
      totalCess: createInvoiceDto.totalCess || 0,
      taxAmount: createInvoiceDto.totalTaxAmount,
      totalValue: createInvoiceDto.grandTotal,
      exportDetails: createInvoiceDto.exportDetails,
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create invoice items
    const items = createInvoiceDto.items.map((item) =>
      this.invoiceItemRepository.create({
        invoiceId: savedInvoice.id,
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        taxableValue: item.taxableValue,
        taxRate: item.taxRate,
        cgstAmount: item.cgstAmount || 0,
        sgstAmount: item.sgstAmount || 0,
        igstAmount: item.igstAmount || 0,
        cessAmount: item.cessAmount || 0,
        taxAmount: item.taxAmount,
        itemTotal: item.itemTotal,
      }),
    );

    await this.invoiceItemRepository.save(items);

    const invoiceWithItems = await this.findOne(savedInvoice.id);
    if (!invoiceWithItems) {
      throw new Error('Failed to create invoice');
    }
    return invoiceWithItems;
  }

  async findOne(id: string): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async findAll(tenantId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { tenantId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async submitToIrp(id: string): Promise<Invoice> {
    const invoice = await this.findOne(id);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    // Update status to queued - the actual IRP submission would be handled by a queue worker
    invoice.irpStatus = 'queued';
    invoice.irpSubmittedAt = new Date();
    
    await this.invoiceRepository.save(invoice);
    
    return invoice;
  }
}
