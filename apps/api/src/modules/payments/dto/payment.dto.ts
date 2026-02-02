import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@accordflow/database';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  invoiceId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
