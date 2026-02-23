import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MonitoringService } from './services/monitoring.service';
import { MonitoringGateway } from './gateways/monitoring.gateway';
import { MonitoringController } from './controllers/monitoring.controller';

// PrismaModule sudah global (@Global) — tidak perlu di-import ulang
// MonitoringGateway kini inject PrismaService untuk validasi session per-tenant

@Module({
  imports: [JwtModule.register({})],
  providers: [MonitoringService, MonitoringGateway],
  controllers: [MonitoringController],
  exports: [MonitoringGateway, MonitoringService],
})
export class MonitoringModule {}
