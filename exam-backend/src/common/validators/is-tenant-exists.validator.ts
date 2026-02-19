// ── is-tenant-exists.validator.ts ────────────────────────
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // will be created

@ValidatorConstraint({ name: 'isTenantExists', async: true })
@Injectable()
export class IsTenantExistsConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(val: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id: val, isActive: true },
    });
    return !!tenant;
  }

  defaultMessage(args: ValidationArguments): string {
    return `Tenant '${args.value}' tidak ditemukan`;
  }
}

export function IsTenantExists(opts?: ValidationOptions) {
  return (obj: object, prop: string) =>
    registerDecorator({
      target: obj.constructor,
      propertyName: prop,
      options: opts,
      constraints: [],
      validator: IsTenantExistsConstraint,
    });
}
