import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { TenantId, CurrentUser } from '../../decorators/tenant.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new contact' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.contactsService.create(tenantId, user.id, createContactDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all contacts' })
  findAll(@TenantId() tenantId: string) {
    return this.contactsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a contact by ID' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.contactsService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.contactsService.update(tenantId, user.id, id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  remove(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.contactsService.remove(tenantId, user.id, id);
  }
}
