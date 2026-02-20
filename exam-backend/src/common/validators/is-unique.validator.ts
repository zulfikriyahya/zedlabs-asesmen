import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private prisma: PrismaService) {}

  async validate(val: string, args: ValidationArguments): Promise<boolean> {
    const [model, field, tenantId] = args.constraints as [string, string, string | undefined];
    const where: Record<string, unknown> = { [field]: val };
    if (tenantId) where.tenantId = tenantId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = await (this.prisma as any)[model].findFirst({ where });
    return !record;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} '${args.value}' sudah digunakan`;
  }
}

export function IsUnique(model: string, field: string, opts?: ValidationOptions) {
  return (obj: object, prop: string) =>
    registerDecorator({
      target: obj.constructor,
      propertyName: prop,
      options: opts,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
}
