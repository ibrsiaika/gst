import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(10, 10)
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, {
    message: 'Invalid PAN format. Expected format: ABCDE1234F',
  })
  pan: string;

  @IsString()
  @IsNotEmpty()
  planCode: string;

  @IsString()
  @Length(15, 15)
  @Matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, {
    message: 'Invalid GSTIN format',
  })
  primaryGstin: string;

  @IsString()
  @IsNotEmpty()
  adminEmail: string;
}
