-- ============================================
-- EXAM SYSTEM DATABASE SCHEMA
-- MySQL 8.0
-- Multi-Tenant with Row-Level Security
-- ============================================

-- See full schema in the project documentation prompt

-- Key Tables:
-- 1. schools - Multi-tenant root
-- 2. users - All users with roles
-- 3. questions - Question bank
-- 4. exams - Exam definitions
-- 5. exam_attempts - Student exam sessions
-- 6. exam_answers - Student answers
-- 7. sync_queue - Offline sync queue
-- 8. exam_activity_logs - Activity tracking

-- Note: Execute migrations using TypeORM instead of this file
-- This file is for reference only
