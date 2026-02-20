import { ForbiddenException } from '@nestjs/common';

export class DeviceLockedException extends ForbiddenException {
  constructor(fingerprint: string) {
    super(`Perangkat '${fingerprint}' telah dikunci. Hubungi pengawas.`);
  }
}
