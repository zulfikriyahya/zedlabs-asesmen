/**
 * scripts/rotate-keys.ts
 * Re-enkripsi semua correctAnswer di DB dengan key baru.
 *
 * Jalankan:
 *   OLD_KEY=<64hex> NEW_KEY=<64hex> ts-node scripts/rotate-keys.ts
 *
 * ⚠️ BACKUP DATABASE SEBELUM MENJALANKAN SCRIPT INI
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function encrypt(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decrypt(ciphertext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const buf = Buffer.from(ciphertext, 'base64');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const enc = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString('utf8') + decipher.final('utf8');
}

async function main() {
  const oldKey = process.env.OLD_KEY;
  const newKey = process.env.NEW_KEY;

  if (!oldKey || oldKey.length !== 64) {
    console.error('❌ OLD_KEY harus berupa 64 hex chars (32 bytes)');
    process.exit(1);
  }
  if (!newKey || newKey.length !== 64) {
    console.error('❌ NEW_KEY harus berupa 64 hex chars (32 bytes)');
    process.exit(1);
  }
  if (oldKey === newKey) {
    console.error('❌ OLD_KEY dan NEW_KEY tidak boleh sama');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  let success = 0;
  let failed = 0;
  const errors: { id: string; error: string }[] = [];

  console.log('🔄 Memulai rotasi key enkripsi...');
  console.log('⚠️  Pastikan database sudah di-backup!');
  console.log('');

  try {
    // Ambil semua soal
    const questions = await prisma.question.findMany({
      select: { id: true, correctAnswer: true },
    });

    console.log(`📊 Total soal: ${questions.length}`);

    // Proses dalam batch untuk menghindari timeout
    const BATCH = 100;
    for (let i = 0; i < questions.length; i += BATCH) {
      const batch = questions.slice(i, i + BATCH);
      console.log(`  Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(questions.length / BATCH)}...`);

      await Promise.allSettled(
        batch.map(async (q) => {
          try {
            const plaintext = decrypt(q.correctAnswer as unknown as string, oldKey);
            const reEncrypted = encrypt(plaintext, newKey);
            await prisma.question.update({
              where: { id: q.id },
              data: { correctAnswer: reEncrypted },
            });
            success++;
          } catch (err) {
            failed++;
            errors.push({ id: q.id, error: (err as Error).message });
          }
        }),
      );
    }

    console.log('');
    console.log(`✅ Berhasil: ${success} soal`);

    if (failed > 0) {
      console.error(`❌ Gagal: ${failed} soal`);
      console.error('Detail kegagalan:');
      errors.slice(0, 10).forEach((e) => console.error(`  - ${e.id}: ${e.error}`));
      if (errors.length > 10) console.error(`  ... dan ${errors.length - 10} lainnya`);
      console.error('');
      console.error('⚠️  Update ENCRYPTION_KEY di .env HANYA jika 0 kegagalan!');
      process.exit(1);
    }

    console.log('');
    console.log('✅ Rotasi selesai. Langkah selanjutnya:');
    console.log(`   1. Update ENCRYPTION_KEY=${newKey} di .env`);
    console.log('   2. Restart semua instance API');
    console.log('   3. Verifikasi aplikasi berjalan normal');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
