import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto';
import { TenantId, CurrentUser } from '../../decorators/tenant.decorator';

@ApiTags('proposals')
@ApiBearerAuth()
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new proposal' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createProposalDto: CreateProposalDto,
  ) {
    return this.proposalsService.create(tenantId, user.id, createProposalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all proposals' })
  findAll(@TenantId() tenantId: string) {
    return this.proposalsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a proposal by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.proposalsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a proposal' })
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateProposalDto: UpdateProposalDto,
  ) {
    return this.proposalsService.update(tenantId, user.id, id, updateProposalDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a proposal' })
  remove(@TenantId() tenantId: string, @CurrentUser() user: any, @Param('id') id: string) {
    return this.proposalsService.remove(tenantId, user.id, id);
  }
}
