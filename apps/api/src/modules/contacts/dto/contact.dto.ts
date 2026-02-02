import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ContactLifecycleStage } from '@prisma/client';

export class CreateContactDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ required: false, enum: ContactLifecycleStage })
  @IsOptional()
  @IsEnum(ContactLifecycleStage)
  lifecycleStage?: ContactLifecycleStage;

  // source/notes removed to match DB schema
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}
