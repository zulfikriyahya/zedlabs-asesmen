import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { DeviceManagementService } from './services/device-management.service';
import { UsersController } from './controllers/users.controller';
import { DeviceManagementController } from './controllers/device-management.controller';

@Module({
  providers: [UsersService, DeviceManagementService],
  controllers: [UsersController, DeviceManagementController],
  exports: [UsersService, DeviceManagementService],
})
export class UsersModule {}
