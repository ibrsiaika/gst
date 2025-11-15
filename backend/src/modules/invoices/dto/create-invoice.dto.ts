import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  Matches,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  building: string;

  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsOptional()
  locality?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @Length(2, 2)
  stateCode: string;

  @IsString()
  @Length(6, 6)
  pincode: string;
}

export class InvoiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'HSN code must be 4-8 digits' })
  hsnCode: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  taxableValue: number;

  @IsNumber()
  @IsEnum([0, 0.1, 0.25, 3, 5, 12, 18, 28])
  taxRate: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cgstAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sgstAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  igstAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cessAmount?: number;

  @IsNumber()
  @Min(0)
  taxAmount: number;

  @IsNumber()
  @Min(0)
  itemTotal: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @IsDateString()
  invoiceDate: string;

  @IsEnum(['B2B', 'B2C', 'EXPORT', 'DEEMED_EXPORT', 'SEZ_WITH_PAYMENT', 'SEZ_WITHOUT_PAYMENT'])
  invoiceType: string;

  @IsEnum(['INV', 'CRN', 'DBN'])
  @IsOptional()
  documentType?: string;

  @IsString()
  @Length(15, 15)
  @Matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/)
  sellerGstin: string;

  @IsString()
  @IsNotEmpty()
  sellerLegalName: string;

  @IsString()
  @IsOptional()
  sellerTradeName?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  sellerAddress: AddressDto;

  @IsString()
  @Matches(/^(\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}|URP)$/)
  buyerGstin: string;

  @IsString()
  @IsNotEmpty()
  buyerLegalName: string;

  @ValidateNested()
  @Type(() => AddressDto)
  buyerAddress: AddressDto;

  @IsString()
  @Length(2, 2)
  @Matches(/^\d{2}$/)
  placeOfSupply: string;

  @IsEnum(['INTRA_STATE', 'INTER_STATE'])
  supplyType: string;

  @IsBoolean()
  @IsOptional()
  reverseCharge?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNumber()
  @Min(0)
  totalTaxableValue: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCgst?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalSgst?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalIgst?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalCess?: number;

  @IsNumber()
  @Min(0)
  totalTaxAmount: number;

  @IsNumber()
  @Min(0)
  grandTotal: number;

  @IsOptional()
  exportDetails?: any;

  @IsBoolean()
  @IsOptional()
  eWayBillRequired?: boolean;
}
