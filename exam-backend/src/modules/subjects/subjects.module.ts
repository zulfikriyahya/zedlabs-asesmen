// ════════════════════════════════════════════════════════════════════════════
// src/modules/subjects/subjects.module.ts
// ════════════════════════════════════════════════════════════════════════════
import { Module } from '@nestjs/common';
import { SubjectsService } from './services/subjects.service';
import { SubjectsController } from './controllers/subjects.controller';

@Module({
  providers: [SubjectsService],
  controllers: [SubjectsController],
  exports: [SubjectsService],
})
export class SubjectsModule {}
