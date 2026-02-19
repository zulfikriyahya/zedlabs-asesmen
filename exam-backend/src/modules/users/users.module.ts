// ── users.module.ts ──────────────────────────────────────
import { Module } from '@nestjs/common';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
