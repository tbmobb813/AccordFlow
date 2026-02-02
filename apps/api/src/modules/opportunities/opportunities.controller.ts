import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto/opportunity.dto';
import { TenantId, CurrentUser } from '../../decorators/tenant.decorator';

@ApiTags('opportunities')
@ApiBearerAuth()
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new opportunity' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createOpportunityDto: CreateOpportunityDto,
  ) {
    return this.opportunitiesService.create(tenantId, user.id, createOpportunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all opportunities' })
  findAll(@TenantId() tenantId: string) {
    return this.opportunitiesService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an opportunity by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.opportunitiesService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an opportunity' })
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateOpportunityDto: UpdateOpportunityDto,
  ) {
    return this.opportunitiesService.update(tenantId, user.id, id, updateOpportunityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an opportunity' })
  remove(@TenantId() tenantId: string, @CurrentUser() user: any, @Param('id') id: string) {
    return this.opportunitiesService.remove(tenantId, user.id, id);
  }
}
