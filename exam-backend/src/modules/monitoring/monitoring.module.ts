// monitoring.module.ts — tambah JwtModule
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringGateway } from './gateways/monitoring.gateway';
import { MonitoringController } from './controllers/monitoring.controller';

@Module({
  imports: [JwtModule.register({})], // secret di-inject via ConfigService dalam gateway
  providers: [MonitoringService, MonitoringGateway],
  controllers: [MonitoringController],
  exports: [MonitoringGateway, MonitoringService],
})
export class MonitoringModule {}
