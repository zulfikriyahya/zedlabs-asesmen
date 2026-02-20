import { BadRequestException } from '@nestjs/common';

export class ExamNotAvailableException extends BadRequestException {
  constructor(reason?: string) {
    super(reason ?? 'Ujian tidak tersedia saat ini');
  }
}
