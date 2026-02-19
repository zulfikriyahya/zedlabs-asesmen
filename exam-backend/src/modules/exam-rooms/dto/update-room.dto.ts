// ════════════════════════════════════════════════════════════════════════════
// src/modules/exam-rooms/dto/update-room.dto.ts
// ════════════════════════════════════════════════════════════════════════════
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
