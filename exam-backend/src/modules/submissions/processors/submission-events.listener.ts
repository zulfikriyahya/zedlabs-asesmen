// // ════════════════════════════════════════════════════════════════════════════
// // src/modules/submissions/processors/submission-events.listener.ts
// // ════════════════════════════════════════════════════════════════════════════
// // Menangani completed/failed events dari BullMQ untuk logging & notifikasi
// import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
// import { Injectable, Logger } from '@nestjs/common';
// import { Job } from 'bullmq';

// @Injectable()
// export class SubmissionEventsListener {
//   private readonly logger = new Logger(SubmissionEventsListener.name);

//   @OnWorkerEvent('completed')
//   onCompleted(job: Job) {
//     this.logger.log(`Job [${job.name}] id=${job.id} selesai.`);
//   }

//   @OnWorkerEvent('failed')
//   onFailed(job: Job | undefined, err: Error) {
//     const id = job?.id ?? 'unknown';
//     const name = job?.name ?? 'unknown';
//     const attempts = job?.attemptsMade ?? 0;
//     this.logger.error(
//       `Job [${name}] id=${id} gagal (attempt ${attempts}): ${err.message}`,
//       err.stack,
//     );
//   }

//   @OnWorkerEvent('stalled')
//   onStalled(jobId: string) {
//     this.logger.warn(`Job id=${jobId} stalled — akan di-retry otomatis.`);
//   }
// }
