-- =====================================================================
-- Telas Juanita - Script 1: base de datos y roles de PostgreSQL
-- =====================================================================

CREATE ROLE telas_admin  LOGIN PASSWORD 'CAMBIAR_admin_2026';
CREATE ROLE telas_app    LOGIN PASSWORD 'CAMBIAR_app_2026';
CREATE ROLE telas_backup LOGIN PASSWORD 'CAMBIAR_backup_2026';

CREATE DATABASE telasjuanita
    OWNER telas_admin
    ENCODING 'UTF8'
    TEMPLATE template0;

REVOKE CONNECT ON DATABASE telasjuanita FROM PUBLIC;
GRANT  CONNECT ON DATABASE telasjuanita TO telas_admin, telas_app, telas_backup;
