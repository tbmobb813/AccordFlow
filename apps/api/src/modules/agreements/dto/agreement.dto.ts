import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { AgreementSignatureStatus } from '@prisma/client';

export class CreateAgreementDto {
  @ApiProperty()
  @IsString()
  proposalId: string;

  @ApiProperty()
  @IsString()
  opportunityId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ required: false, enum: AgreementSignatureStatus })
  @IsOptional()
  @IsEnum(AgreementSignatureStatus)
  signatureStatus?: AgreementSignatureStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class UpdateAgreementDto extends PartialType(CreateAgreementDto) {}
