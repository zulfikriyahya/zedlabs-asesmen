-- AddForeignKey
ALTER TABLE "session_students" ADD CONSTRAINT "session_students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
