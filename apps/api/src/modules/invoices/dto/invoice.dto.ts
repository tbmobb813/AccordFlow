import { IsString, IsEnum, IsNumber, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  agreementId: string;

  @ApiProperty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(['DRAFT', 'SENT', 'VIEWED', 'PARTIAL_PAYMENT', 'PAID', 'OVERDUE', 'CANCELLED'])
  status?: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;
}

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}
