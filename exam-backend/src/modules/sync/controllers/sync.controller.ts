// ── controllers/sync.controller.ts ──────────────────────
@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private svc: SyncService) {}

  @Post() add(@Body() dto: AddSyncItemDto) {
    return this.svc.addItem(dto);
  }
  @Get(':attemptId/status') status(@Param('attemptId') id: string) {
    return this.svc.getStatus(id);
  }
  @Post('retry') retry(@Body() dto: RetrySyncDto) {
    return this.svc.retryFailed(dto);
  }
}

@Module({
  imports: [BullModule.registerQueue({ name: 'sync' })],
  providers: [SyncService, SyncProcessorService, ChunkedUploadService, SyncProcessor],
  controllers: [SyncController],
  exports: [SyncService],
})
export class SyncModule {}
