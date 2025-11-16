import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Invoice } from '../../entities/invoice.entity';

interface IrpAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface IrpInvoicePayload {
  Version: string;
  TranDtls: {
    TaxSch: string;
    SupTyp: string;
    RegRev: string;
    IgstOnIntra: string;
  };
  DocDtls: {
    Typ: string;
    No: string;
    Dt: string;
  };
  SellerDtls: {
    Gstin: string;
    LglNm: string;
    TrdNm?: string;
    Addr1: string;
    Loc: string;
    Pin: number;
    Stcd: string;
  };
  BuyerDtls: {
    Gstin: string;
    LglNm: string;
    Pos: string;
    Addr1: string;
    Loc: string;
    Pin: number;
    Stcd: string;
  };
  ItemList: {
    SlNo: string;
    IsServc: string;
    HsnCd: string;
    Qty: number;
    Unit: string;
    UnitPrice: number;
    TotAmt: number;
    Discount: number;
    AssAmt: number;
    GstRt: number;
    IgstAmt: number;
    CgstAmt: number;
    SgstAmt: number;
    CesRt: number;
    CesAmt: number;
    TotItemVal: number;
  }[];
  ValDtls: {
    AssVal: number;
    CgstVal: number;
    SgstVal: number;
    IgstVal: number;
    CesVal: number;
    StCesVal: number;
    Discount: number;
    RndOffAmt: number;
    TotInvVal: number;
  };
}

interface IrpGenerateResponse {
  Irn: string;
  AckNo: string;
  AckDt: string;
  SignedInvoice: string;
  SignedQRCode: string;
  Status: string;
  EwbNo?: string;
  EwbDt?: string;
  EwbValidTill?: string;
  InfoDtls?: {
    Message: string;
  }[];
}

interface IrpErrorResponse {
  message: string;
  error_cd?: string;
  error_source?: string;
}

@Injectable()
export class IrpService {
  private readonly logger = new Logger(IrpService.name);
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly username: string;
  private readonly password: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'IRP_BASE_URL',
      'https://einv-apisandbox.nic.in',
    );
    this.clientId = this.configService.get<string>('IRP_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('IRP_CLIENT_SECRET', '');
    this.username = this.configService.get<string>('IRP_USERNAME', '');
    this.password = this.configService.get<string>('IRP_PASSWORD', '');

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log('IRP Service initialized');
  }

  /**
   * Authenticate with IRP and get access token
   */
  private async authenticate(): Promise<string> {
    // Check if existing token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      this.logger.log('Authenticating with IRP...');

      // TODO: Replace with actual IRP authentication endpoint
      // This is a placeholder - actual IRP auth may differ
      const response = await this.httpClient.post<IrpAuthResponse>(
        '/auth/token',
        {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
          grant_type: 'password',
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60000; // Expire 1 min early

      this.logger.log('IRP authentication successful');
      return this.accessToken;
    } catch (error) {
      this.logger.error('IRP authentication failed', error);
      throw new Error('Failed to authenticate with IRP');
    }
  }

  /**
   * Transform Invoice entity to IRP payload format
   */
  private transformToIrpPayload(invoice: Invoice): IrpInvoicePayload {
    const sellerAddress = invoice.sellerAddress as any;
    const buyerAddress = invoice.buyerAddress as any;

    const payload: IrpInvoicePayload = {
      Version: '1.1',
      TranDtls: {
        TaxSch: 'GST',
        SupTyp: invoice.invoiceType,
        RegRev: invoice.reverseCharge ? 'Y' : 'N',
        IgstOnIntra: invoice.supplyType === 'INTER_STATE' ? 'Y' : 'N',
      },
      DocDtls: {
        Typ: invoice.documentType,
        No: invoice.invoiceNumber,
        Dt: new Date(invoice.invoiceDate).toLocaleDateString('en-GB').split('/').reverse().join('/'),
      },
      SellerDtls: {
        Gstin: invoice.sellerGstin,
        LglNm: invoice.sellerLegalName,
        TrdNm: invoice.sellerTradeName || undefined,
        Addr1: `${sellerAddress.building}, ${sellerAddress.street}`,
        Loc: sellerAddress.city,
        Pin: parseInt(sellerAddress.pincode),
        Stcd: sellerAddress.stateCode,
      },
      BuyerDtls: {
        Gstin: invoice.buyerGstin,
        LglNm: invoice.buyerLegalName,
        Pos: invoice.placeOfSupply,
        Addr1: `${buyerAddress.building}, ${buyerAddress.street}`,
        Loc: buyerAddress.city,
        Pin: parseInt(buyerAddress.pincode),
        Stcd: buyerAddress.stateCode,
      },
      ItemList: (invoice.items || []).map((item, index) => ({
        SlNo: (index + 1).toString(),
        IsServc: item.hsnCode.startsWith('99') ? 'Y' : 'N',
        HsnCd: item.hsnCode,
        Qty: Number(item.quantity),
        Unit: item.unit,
        UnitPrice: Number(item.unitPrice),
        TotAmt: Number(item.quantity) * Number(item.unitPrice),
        Discount: Number(item.discount || 0),
        AssAmt: Number(item.taxableValue),
        GstRt: Number(item.taxRate),
        IgstAmt: Number(item.igstAmount || 0),
        CgstAmt: Number(item.cgstAmount || 0),
        SgstAmt: Number(item.sgstAmount || 0),
        CesRt: 0,
        CesAmt: Number(item.cessAmount || 0),
        TotItemVal: Number(item.itemTotal),
      })),
      ValDtls: {
        AssVal: Number(invoice.taxableValue),
        CgstVal: Number(invoice.totalCgst),
        SgstVal: Number(invoice.totalSgst),
        IgstVal: Number(invoice.totalIgst),
        CesVal: Number(invoice.totalCess),
        StCesVal: 0,
        Discount: 0,
        RndOffAmt: 0,
        TotInvVal: Number(invoice.totalValue),
      },
    };

    return payload;
  }

  /**
   * Generate IRN for an invoice
   */
  async generateIrn(invoice: Invoice): Promise<IrpGenerateResponse> {
    try {
      this.logger.log(`Generating IRN for invoice ${invoice.invoiceNumber}`);

      // Get access token
      const token = await this.authenticate();

      // Transform invoice to IRP payload
      const payload = this.transformToIrpPayload(invoice);

      this.logger.debug('IRP Payload:', JSON.stringify(payload, null, 2));

      // Call IRP API
      const response = await this.httpClient.post<IrpGenerateResponse>(
        '/einv/v1.03/Invoice/Generate',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.log(`IRN generated successfully: ${response.data.Irn}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to generate IRN for invoice ${invoice.invoiceNumber}`, error);

      if (error.response) {
        const irpError: IrpErrorResponse = error.response.data;
        throw new Error(`IRP Error: ${irpError.message} (${irpError.error_cd || 'UNKNOWN'})`);
      }

      throw error;
    }
  }

  /**
   * Get invoice by IRN
   */
  async getByIrn(irn: string): Promise<any> {
    try {
      const token = await this.authenticate();

      const response = await this.httpClient.get(`/einv/v1.03/Invoice/IRN/${irn}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get invoice by IRN: ${irn}`, error);
      throw error;
    }
  }

  /**
   * Cancel IRN
   */
  async cancelIrn(irn: string, cancelReason: string, cancelRemark: string): Promise<any> {
    try {
      const token = await this.authenticate();

      const response = await this.httpClient.post(
        '/einv/v1.03/Invoice/Cancel',
        {
          Irn: irn,
          CnlRsn: cancelReason,
          CnlRem: cancelRemark,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.log(`IRN cancelled successfully: ${irn}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to cancel IRN: ${irn}`, error);
      throw error;
    }
  }

  /**
   * Check if IRP credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret && this.username && this.password);
  }
}
