// ══════════════════════════════════════════════════════════════
// src/modules/exam-rooms/exam-rooms.module.ts  (clean — no bundle)
// ══════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { ExamRoomsController } from './controllers/exam-rooms.controller';
import { ExamRoomsService } from './services/exam-rooms.service';

@Module({
  providers: [ExamRoomsService],
  controllers: [ExamRoomsController],
  exports: [ExamRoomsService],
})
export class ExamRoomsModule {}
