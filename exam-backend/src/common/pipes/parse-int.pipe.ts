// ── parse-int.pipe.ts ────────────────────────────────────
import {
  PipeTransform,
  Injectable as PI,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@PI()
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(val: string, _meta: ArgumentMetadata): number {
    const n = parseInt(val, 10);
    if (isNaN(n)) throw new BadRequestException(`'${val}' bukan angka valid`);
    return n;
  }
}
