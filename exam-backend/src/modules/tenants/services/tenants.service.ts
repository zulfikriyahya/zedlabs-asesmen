// ════════════════════════════════════════════════════════════════════════════
// src/modules/tenants/services/tenants.service.ts
// ════════════════════════════════════════════════════════════════════════════
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseQueryDto } from '../../../common/dto/base-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/base-response.dto';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

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
