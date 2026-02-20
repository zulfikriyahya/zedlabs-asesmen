import { NotFoundException } from '@nestjs/common';

export class TenantNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`Tenant '${identifier}' tidak ditemukan atau tidak aktif`);
  }
}
