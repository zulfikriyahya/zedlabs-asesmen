// ── tenants.module.ts ──────────────────────────────────
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUrl,
  PartialType,
} from 'class-validator';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Module,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseQueryDto } from '../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateTenantDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() subdomain: string;
}
export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @IsOptional() @IsBoolean() isActive?: boolean;
}

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: BaseQueryDto) {
    const where = q.search
      ? { OR: [{ name: { contains: q.search } }, { code: { contains: q.search } }] }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({ where, skip: q.skip, take: q.limit }),
      this.prisma.tenant.count({ where }),
    ]);
    return new PaginatedResponseDto(data, total, q.page, q.limit);
  }

  async findOne(id: string) {
    const t = await this.prisma.tenant.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Tenant tidak ditemukan');
    return t;
  }

  async findBySubdomain(subdomain: string) {
    const t = await this.prisma.tenant.findFirst({ where: { subdomain, isActive: true } });
    if (!t) throw new NotFoundException(`Subdomain '${subdomain}' tidak ditemukan`);
    return t;
  }

  async create(dto: CreateTenantDto) {
    const exists = await this.prisma.tenant.findFirst({
      where: { OR: [{ code: dto.code }, { subdomain: dto.subdomain }] },
    });
    if (exists) throw new ConflictException('Kode atau subdomain sudah digunakan');
    return this.prisma.tenant.create({ data: dto });
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }
}

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN)
export class TenantsController {
  constructor(private svc: TenantsService) {}
  @Get() findAll(@Query() q: BaseQueryDto) {
    return this.svc.findAll(q);
  }
  @Get(':id') findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }
  @Post() create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }
}

@Module({
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [TenantsService],
})
export class TenantsModule {}
