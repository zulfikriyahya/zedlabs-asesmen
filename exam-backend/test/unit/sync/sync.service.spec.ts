// ── test/unit/sync/sync.service.spec.ts ──────────────────────────────────────
import { SyncService } from '../../../src/modules/sync/services/sync.service';
import { SyncType } from '../../../src/common/enums/sync-status.enum';

describe('SyncService', () => {
  let svc: SyncService;
  const mockPrisma = {
    syncQueue: {
      upsert: jest.fn().mockResolvedValue({ id: 'sync-1' }),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const mockQueue = { add: jest.fn() };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'BullQueue_sync', useValue: mockQueue },
      ],
    }).compile();
    svc = mod.get(SyncService);
  });

  it('adds sync item and enqueues job', async () => {
    mockQueue.add.mockResolvedValue({ id: 'job-1' });
    await svc.addItem({
      attemptId: 'att-1',
      idempotencyKey: 'idem-1',
      type: SyncType.SUBMIT_ANSWER,
      payload: { questionId: 'q-1' },
    });
    expect(mockPrisma.syncQueue.upsert).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith(
      'process',
      { syncItemId: 'sync-1' },
      expect.any(Object),
    );
  });
});
