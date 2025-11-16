import { Controller, Post, Get, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IrpService } from './irp.service';
import { Invoice } from '../../entities/invoice.entity';

@ApiTags('IRP (E-Invoice)')
@Controller('irp')
export class IrpController {
  constructor(
    private readonly irpService: IrpService,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  @Post('generate/:invoiceId')
  @ApiOperation({ summary: 'Generate IRN for an invoice' })
  @ApiResponse({ status: 200, description: 'IRN generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  @ApiResponse({ status: 500, description: 'IRP API error' })
  async generateIrn(@Param('invoiceId') invoiceId: string) {
    // Check if IRP is configured
    if (!this.irpService.isConfigured()) {
      throw new HttpException(
        'IRP is not configured. Please set IRP credentials in environment variables.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Find invoice
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['items'],
    });

    if (!invoice) {
      throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
    }

    // Check if IRN already generated
    if (invoice.irn) {
      throw new HttpException(
        `IRN already generated for this invoice: ${invoice.irn}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate invoice data
    if (!invoice.items || invoice.items.length === 0) {
      throw new HttpException('Invoice must have at least one line item', HttpStatus.BAD_REQUEST);
    }

    try {
      // Generate IRN
      const irpResponse = await this.irpService.generateIrn(invoice);

      // Update invoice with IRN details
      invoice.irn = irpResponse.Irn;
      invoice.ackNo = irpResponse.AckNo;
      invoice.ackDate = new Date(irpResponse.AckDt);
      invoice.signedJsonUrl = irpResponse.SignedInvoice;
      invoice.qrCodeUrl = irpResponse.SignedQRCode;
      invoice.irpStatus = 'success';
      invoice.irpSubmittedAt = new Date();
      invoice.irpErrorMessage = '';

      await this.invoiceRepository.save(invoice);

      return {
        success: true,
        message: 'IRN generated successfully',
        data: {
          irn: irpResponse.Irn,
          ackNo: irpResponse.AckNo,
          ackDate: irpResponse.AckDt,
          qrCode: irpResponse.SignedQRCode,
          ewbNo: irpResponse.EwbNo,
        },
      };
    } catch (error: any) {
      // Update invoice with error
      invoice.irpStatus = 'failed';
      invoice.irpErrorMessage = error.message;
      await this.invoiceRepository.save(invoice);

      throw new HttpException(
        `Failed to generate IRN: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('invoice/:irn')
  @ApiOperation({ summary: 'Get invoice details by IRN' })
  @ApiResponse({ status: 200, description: 'Invoice details retrieved' })
  async getByIrn(@Param('irn') irn: string) {
    if (!this.irpService.isConfigured()) {
      throw new HttpException(
        'IRP is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const data = await this.irpService.getByIrn(irn);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to get invoice: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel an IRN' })
  @ApiResponse({ status: 200, description: 'IRN cancelled successfully' })
  async cancelIrn(
    @Body() body: { irn: string; reason: string; remark: string },
  ) {
    if (!this.irpService.isConfigured()) {
      throw new HttpException(
        'IRP is not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const data = await this.irpService.cancelIrn(body.irn, body.reason, body.remark);
      
      // Update invoice status
      const invoice = await this.invoiceRepository.findOne({
        where: { irn: body.irn },
      });

      if (invoice) {
        invoice.irpStatus = 'cancelled';
        await this.invoiceRepository.save(invoice);
      }

      return {
        success: true,
        message: 'IRN cancelled successfully',
        data,
      };
    } catch (error: any) {
      throw new HttpException(
        `Failed to cancel IRN: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'Check IRP configuration status' })
  @ApiResponse({ status: 200, description: 'IRP configuration status' })
  getStatus() {
    return {
      configured: this.irpService.isConfigured(),
      message: this.irpService.isConfigured()
        ? 'IRP is properly configured'
        : 'IRP credentials not configured. Set IRP_CLIENT_ID, IRP_CLIENT_SECRET, IRP_USERNAME, IRP_PASSWORD in environment variables',
    };
  }
}
