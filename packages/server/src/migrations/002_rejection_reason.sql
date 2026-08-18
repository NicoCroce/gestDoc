-- Migration 002: Add motivo_rechazo column to certificados
-- Feature: 006-license-rejection-reason
-- Date: 2026-08-18
--
-- Adds nullable column to store the rejection reason entered by admin
-- when changing a license status to 'rechazado'.
-- NULL is the correct default for pre-feature records (FR-008).

ALTER TABLE certificados ADD COLUMN motivo_rechazo VARCHAR(500) NULL AFTER motivo;
