import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { TenantId } from '../../decorators/tenant.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get activity timeline' })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.activitiesService.findAll(tenantId, entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.activitiesService.findOne(tenantId, id);
  }
}
