import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgreementsService } from './agreements.service';
import { CreateAgreementDto, UpdateAgreementDto } from './dto/agreement.dto';
import { TenantId, CurrentUser } from '../../decorators/tenant.decorator';

@ApiTags('agreements')
@ApiBearerAuth()
@Controller('agreements')
export class AgreementsController {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new agreement' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createAgreementDto: CreateAgreementDto,
  ) {
    return this.agreementsService.create(tenantId, user.id, createAgreementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all agreements' })
  findAll(@TenantId() tenantId: string) {
    return this.agreementsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agreement by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.agreementsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an agreement' })
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateAgreementDto: UpdateAgreementDto,
  ) {
    return this.agreementsService.update(tenantId, user.id, id, updateAgreementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an agreement' })
  remove(@TenantId() tenantId: string, @CurrentUser() user: any, @Param('id') id: string) {
    return this.agreementsService.remove(tenantId, user.id, id);
  }
}
