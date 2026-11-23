-- =====================================================================
-- Telas Juanita - Script 2: esquema, seguridad y auditoría (PostgreSQL 14+)
-- Ejecutar conectado a la base "telasjuanita" como "postgres".
-- No se usan migraciones: este script es la única fuente del esquema.
-- Los campos marcados "PROPUESTO" no estaban en el diagrama de clases.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- crypt() para el administrador inicial

CREATE SCHEMA telas AUTHORIZATION telas_admin;
SET search_path = telas, public;

-- ---------------------------------------------------------------------
-- 1. SEGURIDAD: roles y permisos de la aplicación
-- ---------------------------------------------------------------------
CREATE TABLE rol (
    id_rol   SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre   VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE permiso (
    id_permiso  SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo      VARCHAR(40) NOT NULL UNIQUE,
    descripcion VARCHAR(120) NOT NULL
);

CREATE TABLE rol_permiso (
    id_rol     SMALLINT NOT NULL REFERENCES rol(id_rol),
    id_permiso SMALLINT NOT NULL REFERENCES permiso(id_permiso),
    PRIMARY KEY (id_rol, id_permiso)
);

CREATE TABLE usuario (
    id_usuario            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre                VARCHAR(100) NOT NULL,
    correo                VARCHAR(120) NOT NULL UNIQUE,
    password_hash         TEXT NOT NULL,                       -- PROPUESTO (BCrypt, nunca texto plano)
    id_rol                SMALLINT NOT NULL REFERENCES rol(id_rol),
    estado                VARCHAR(10) NOT NULL DEFAULT 'ACTIVO'
                          CHECK (estado IN ('ACTIVO','INACTIVO','BLOQUEADO')),
    intentos_fallidos     INT NOT NULL DEFAULT 0 CHECK (intentos_fallidos >= 0),
    bloqueado_hasta       TIMESTAMPTZ,                         -- PROPUESTO
    ultimo_acceso         TIMESTAMPTZ,                         -- PROPUESTO
    debe_cambiar_password BOOLEAN NOT NULL DEFAULT TRUE        -- PROPUESTO
);

-- ---------------------------------------------------------------------
-- 2. CATÁLOGOS: clientes, telas, proveedores, descuentos
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id_cliente           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               VARCHAR(100) NOT NULL,
    carnet               VARCHAR(20)  NOT NULL UNIQUE,
    nit                  VARCHAR(20),                           -- RF-01
    telefono             VARCHAR(20),
    direccion            VARCHAR(200),
    limite_credito       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (limite_credito >= 0),  -- PROPUESTO
    codigo_consulta_hash TEXT,                                  -- PROPUESTO (RF-24: guardar con hash BCrypt)
    estado               VARCHAR(10) NOT NULL DEFAULT 'ACTIVO'
                         CHECK (estado IN ('ACTIVO','BLOQUEADO','INACTIVO'))            -- PROPUESTO
);

CREATE TABLE tela (
    id_tela       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo        VARCHAR(30) NOT NULL UNIQUE,
    nombre        VARCHAR(100) NOT NULL,
    tipo          VARCHAR(50),
    color         VARCHAR(40),
    ancho         NUMERIC(6,2) CHECK (ancho > 0),               -- RF-02 (metros)
    precio_metro  NUMERIC(12,2) NOT NULL CHECK (precio_metro > 0),
    stock_minimo  NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    url_foto      VARCHAR(300),                                 -- ruta de la foto JPG o PNG
    estado        VARCHAR(12) NOT NULL DEFAULT 'ACTIVA'
                  CHECK (estado IN ('ACTIVA','DESHABILITADA'))
);

CREATE TABLE proveedor (
    id_proveedor INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(100) NOT NULL,
    telefono     VARCHAR(20),
    nit          VARCHAR(20) NOT NULL UNIQUE
);

-- Descuentos por mayor definidos por la dueña (RF-09, RF-31)
CREATE TABLE descuento_mayor (
    id_descuento   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    metros_minimos NUMERIC(10,2) NOT NULL UNIQUE CHECK (metros_minimos > 0),
    porcentaje     NUMERIC(5,2)  NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    estado         VARCHAR(10) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO','INACTIVO'))
);

-- Historial de precios (RF-31): lo llena un trigger al cambiar tela.precio_metro
CREATE TABLE historial_precio (
    id_historial    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tela         INT NOT NULL REFERENCES tela(id_tela),
    precio_anterior NUMERIC(12,2) NOT NULL,
    precio_nuevo    NUMERIC(12,2) NOT NULL,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
    id_usuario      UUID REFERENCES usuario(id_usuario)
);

-- ---------------------------------------------------------------------
-- 3. COMPRAS E INVENTARIO
-- ---------------------------------------------------------------------
CREATE TABLE compra (
    id_compra    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
    total        NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    id_proveedor INT  NOT NULL REFERENCES proveedor(id_proveedor),
    id_usuario   UUID NOT NULL REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_compra (
    id_detalle_compra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_compra         INT NOT NULL REFERENCES compra(id_compra),
    cantidad_metros   NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    costo_unitario    NUMERIC(12,2) NOT NULL CHECK (costo_unitario >= 0)
);

CREATE TABLE rollo (
    id_rollo           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tela            INT NOT NULL REFERENCES tela(id_tela),
    id_detalle_compra  INT REFERENCES detalle_compra(id_detalle_compra),
    metros_iniciales   NUMERIC(10,2) NOT NULL CHECK (metros_iniciales > 0),
    metros_disponibles NUMERIC(10,2) NOT NULL,
    fecha_ingreso      DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT ck_rollo_metros CHECK (metros_disponibles >= 0
                                      AND metros_disponibles <= metros_iniciales)
);

CREATE TABLE movimiento_inventario (
    id_movimiento   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
    tipo            VARCHAR(15) NOT NULL
                    CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE','DEVOLUCION')),
    cantidad_metros NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    motivo          VARCHAR(200),
    id_tela         INT  NOT NULL REFERENCES tela(id_tela),
    id_rollo        INT  REFERENCES rollo(id_rollo),             -- PROPUESTO (trazabilidad)
    id_usuario      UUID NOT NULL REFERENCES usuario(id_usuario),
    CONSTRAINT ck_mov_ajuste_motivo CHECK (tipo <> 'AJUSTE' OR (motivo IS NOT NULL AND length(trim(motivo)) > 0))  -- RF-06
);

-- ---------------------------------------------------------------------
-- 4. PEDIDOS Y RESERVAS
-- ---------------------------------------------------------------------
CREATE TABLE pedido (
    id_pedido         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente        INT NOT NULL REFERENCES cliente(id_cliente),
    id_usuario        UUID REFERENCES usuario(id_usuario),       -- PROPUESTO (NULL si lo hizo el cliente en línea)
    origen            VARCHAR(10) NOT NULL DEFAULT 'MOSTRADOR'
                      CHECK (origen IN ('MOSTRADOR','EN_LINEA')), -- PROPUESTO (RF-23)
    tipo              VARCHAR(10) NOT NULL CHECK (tipo IN ('PEDIDO','RESERVA')),
    fecha             TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_vencimiento DATE,
    estado            VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                      CHECK (estado IN ('PENDIENTE','CONFIRMADO','VENCIDO','CONVERTIDO','CANCELADO'))
);

CREATE TABLE detalle_pedido (
    id_detalle_pedido INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_pedido         INT NOT NULL REFERENCES pedido(id_pedido),
    id_tela           INT NOT NULL REFERENCES tela(id_tela),
    cantidad_metros   NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    subtotal          NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- ---------------------------------------------------------------------
-- 5. VENTAS Y CRÉDITO
-- ---------------------------------------------------------------------
CREATE TABLE venta (
    id_venta              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    id_cliente            INT REFERENCES cliente(id_cliente),    -- NULL = venta de mostrador sin cliente registrado
    id_usuario            UUID NOT NULL REFERENCES usuario(id_usuario),
    id_pedido             INT  REFERENCES pedido(id_pedido),
    total                 NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    descuento             NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),
    estado                VARCHAR(10) NOT NULL DEFAULT 'REGISTRADA'
                          CHECK (estado IN ('REGISTRADA','ANULADA')),
    es_credito            BOOLEAN NOT NULL DEFAULT FALSE,
    saldo_pendiente       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (saldo_pendiente >= 0),
    fecha_vencimiento     DATE,                                  -- PROPUESTO (plazo del crédito)
    motivo_anulacion      VARCHAR(200),
    fecha_anulacion       TIMESTAMPTZ,                           -- PROPUESTO
    id_usuario_anulacion  UUID REFERENCES usuario(id_usuario),   -- PROPUESTO
    CONSTRAINT ck_venta_descuento    CHECK (descuento <= total),
    CONSTRAINT ck_venta_saldo        CHECK (es_credito OR saldo_pendiente = 0),
    CONSTRAINT ck_venta_saldo_total  CHECK (saldo_pendiente <= total),
    CONSTRAINT ck_venta_credito      CHECK (NOT es_credito OR fecha_vencimiento IS NOT NULL),
    CONSTRAINT ck_venta_credito_cli  CHECK (NOT es_credito OR id_cliente IS NOT NULL),
    CONSTRAINT ck_venta_anulada      CHECK (estado <> 'ANULADA'
                                            OR (motivo_anulacion IS NOT NULL
                                                AND id_usuario_anulacion IS NOT NULL))
);

CREATE TABLE detalle_venta (
    id_detalle_venta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta         INT NOT NULL REFERENCES venta(id_venta),
    id_tela          INT NOT NULL REFERENCES tela(id_tela),
    id_rollo         INT REFERENCES rollo(id_rollo),             -- PROPUESTO (de qué rollo se cortó)
    cantidad_metros  NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE TABLE pago (
    id_pago     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta    INT  NOT NULL REFERENCES venta(id_venta),
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
    monto       NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(20) NOT NULL
                CHECK (metodo_pago IN ('EFECTIVO','TRANSFERENCIA','QR')),   -- RF-10
    id_usuario  UUID NOT NULL REFERENCES usuario(id_usuario)     -- PROPUESTO
);

CREATE TABLE abono (
    id_abono    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta    INT  NOT NULL REFERENCES venta(id_venta),
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now(),
    monto       NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO'
                CHECK (metodo_pago IN ('EFECTIVO','TRANSFERENCIA','QR')),   -- PROPUESTO
    id_usuario  UUID NOT NULL REFERENCES usuario(id_usuario)     -- PROPUESTO
);

CREATE TABLE devolucion (
    id_devolucion    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_detalle_venta INT  NOT NULL REFERENCES detalle_venta(id_detalle_venta),
    fecha            TIMESTAMPTZ NOT NULL DEFAULT now(),
    cantidad_metros  NUMERIC(10,2) NOT NULL CHECK (cantidad_metros > 0),
    monto            NUMERIC(12,2) NOT NULL CHECK (monto >= 0),
    motivo           VARCHAR(200) NOT NULL,
    id_usuario       UUID NOT NULL REFERENCES usuario(id_usuario)  -- PROPUESTO
);

-- ---------------------------------------------------------------------
-- 6. CIERRE DE CAJA DIARIO (RF-28)
-- ---------------------------------------------------------------------
CREATE TABLE cierre_caja (
    id_cierre           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha               DATE NOT NULL UNIQUE,                     -- un cierre por día
    fecha_hora          TIMESTAMPTZ NOT NULL DEFAULT now(),
    id_usuario          UUID NOT NULL REFERENCES usuario(id_usuario),
    total_efectivo      NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_efectivo >= 0),
    total_transferencia NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_transferencia >= 0),
    total_qr            NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_qr >= 0),
    total_general       NUMERIC(12,2) NOT NULL DEFAULT 0,
    observacion         VARCHAR(200),
    CONSTRAINT ck_cierre_total CHECK (total_general = total_efectivo + total_transferencia + total_qr)
);

-- Índices en llaves foráneas y consultas frecuentes (RNF-01: búsquedas < 2 s)
CREATE INDEX ix_usuario_rol          ON usuario(id_rol);
CREATE INDEX ix_cliente_nombre       ON cliente(lower(nombre));
CREATE INDEX ix_cliente_nit          ON cliente(nit);
CREATE INDEX ix_tela_nombre          ON tela(lower(nombre));
CREATE INDEX ix_historial_tela       ON historial_precio(id_tela, fecha);
CREATE INDEX ix_rollo_tela           ON rollo(id_tela);
CREATE INDEX ix_movimiento_tela      ON movimiento_inventario(id_tela, fecha);
CREATE INDEX ix_pedido_cliente       ON pedido(id_cliente, estado);
CREATE INDEX ix_detalle_pedido_tela  ON detalle_pedido(id_tela);
CREATE INDEX ix_venta_cliente        ON venta(id_cliente);
CREATE INDEX ix_venta_fecha_estado   ON venta(fecha, estado);
CREATE INDEX ix_venta_credito        ON venta(es_credito, saldo_pendiente) WHERE es_credito;
CREATE INDEX ix_detalle_venta_venta  ON detalle_venta(id_venta);
CREATE INDEX ix_detalle_venta_tela   ON detalle_venta(id_tela);
CREATE INDEX ix_pago_venta           ON pago(id_venta);
CREATE INDEX ix_abono_venta          ON abono(id_venta);
CREATE INDEX ix_devolucion_detalle   ON devolucion(id_detalle_venta);

-- ---------------------------------------------------------------------
-- 7. EXISTENCIAS (RF-04, RF-05): disponible = metros en rollos - reservas vigentes
-- ---------------------------------------------------------------------
CREATE VIEW v_existencias AS
SELECT t.id_tela, t.codigo, t.nombre, t.estado, t.stock_minimo,
       COALESCE(r.metros, 0)                       AS metros_en_rollos,
       COALESCE(p.metros, 0)                       AS metros_reservados,
       COALESCE(r.metros, 0) - COALESCE(p.metros, 0) AS metros_disponibles,
       (COALESCE(r.metros, 0) - COALESCE(p.metros, 0)) < t.stock_minimo AS bajo_minimo
FROM tela t
LEFT JOIN (SELECT id_tela, SUM(metros_disponibles) AS metros
           FROM rollo GROUP BY id_tela) r ON r.id_tela = t.id_tela
LEFT JOIN (SELECT d.id_tela, SUM(d.cantidad_metros) AS metros
           FROM detalle_pedido d JOIN pedido pe ON pe.id_pedido = d.id_pedido
           WHERE pe.estado IN ('PENDIENTE','CONFIRMADO')
             AND (pe.fecha_vencimiento IS NULL OR pe.fecha_vencimiento >= CURRENT_DATE)
           GROUP BY d.id_tela) p ON p.id_tela = t.id_tela;

-- ---------------------------------------------------------------------
-- 8. AUDITORÍA (solo inserción)
-- ---------------------------------------------------------------------
CREATE TABLE registro_auditoria (
    id_registro     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha_hora      TIMESTAMPTZ NOT NULL DEFAULT now(),
    id_usuario      UUID,                       -- sin FK a propósito: el registro debe sobrevivir
    accion          VARCHAR(30) NOT NULL,       -- INSERT / UPDATE / DELETE / LOGIN_OK / LOGIN_FALLIDO ...
    entidad         VARCHAR(40) NOT NULL,
    id_entidad      TEXT,                       -- PROPUESTO
    valor_anterior  JSONB,                      -- PROPUESTO
    valor_nuevo     JSONB,                      -- PROPUESTO
    resultado       VARCHAR(10) NOT NULL DEFAULT 'OK',
    ip              INET                        -- PROPUESTO
);
CREATE INDEX ix_auditoria_fecha   ON registro_auditoria(fecha_hora);
CREATE INDEX ix_auditoria_entidad ON registro_auditoria(entidad, id_entidad);

-- Nadie puede modificar ni borrar la auditoría
CREATE FUNCTION fn_auditoria_inmutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'registro_auditoria es de solo inserción';
END $$;

CREATE TRIGGER tg_auditoria_no_modificar
    BEFORE UPDATE OR DELETE ON registro_auditoria
    FOR EACH ROW EXECUTE FUNCTION fn_auditoria_inmutable();
CREATE TRIGGER tg_auditoria_no_truncar
    BEFORE TRUNCATE ON registro_auditoria
    FOR EACH STATEMENT EXECUTE FUNCTION fn_auditoria_inmutable();

-- Auditoría automática de cambios. La aplicación debe ejecutar, al abrir cada
-- transacción:  SET LOCAL app.id_usuario = '<uuid del usuario>';
-- y opcionalmente: SET LOCAL app.ip = '<ip del cliente>';
CREATE FUNCTION fn_auditar() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_pk    TEXT := TG_ARGV[0];
    v_old   JSONB;
    v_new   JSONB;
    v_user  UUID := NULLIF(current_setting('app.id_usuario', true), '')::uuid;
    v_ip    INET := NULLIF(current_setting('app.ip', true), '')::inet;
BEGIN
    IF TG_OP IN ('UPDATE','DELETE') THEN
        v_old := to_jsonb(OLD) - 'password_hash' - 'codigo_consulta_hash';
    END IF;
    IF TG_OP IN ('INSERT','UPDATE') THEN
        v_new := to_jsonb(NEW) - 'password_hash' - 'codigo_consulta_hash';
    END IF;

    INSERT INTO registro_auditoria(id_usuario, accion, entidad, id_entidad,
                                   valor_anterior, valor_nuevo, ip)
    VALUES (v_user, TG_OP, TG_TABLE_NAME,
            COALESCE(v_new ->> v_pk, v_old ->> v_pk), v_old, v_new, v_ip);

    RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER tg_aud_usuario         AFTER INSERT OR UPDATE OR DELETE ON usuario         FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_usuario');
CREATE TRIGGER tg_aud_rol_permiso     AFTER INSERT OR UPDATE OR DELETE ON rol_permiso     FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_rol');
CREATE TRIGGER tg_aud_cliente         AFTER INSERT OR UPDATE OR DELETE ON cliente         FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_cliente');
CREATE TRIGGER tg_aud_tela            AFTER INSERT OR UPDATE OR DELETE ON tela            FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_tela');
CREATE TRIGGER tg_aud_descuento       AFTER INSERT OR UPDATE OR DELETE ON descuento_mayor FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_descuento');
CREATE TRIGGER tg_aud_proveedor       AFTER INSERT OR UPDATE OR DELETE ON proveedor       FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_proveedor');
CREATE TRIGGER tg_aud_compra          AFTER INSERT OR UPDATE OR DELETE ON compra          FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_compra');
CREATE TRIGGER tg_aud_rollo           AFTER INSERT OR UPDATE OR DELETE ON rollo           FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_rollo');
CREATE TRIGGER tg_aud_pedido          AFTER INSERT OR UPDATE OR DELETE ON pedido          FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_pedido');
CREATE TRIGGER tg_aud_venta           AFTER INSERT OR UPDATE OR DELETE ON venta           FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_venta');
CREATE TRIGGER tg_aud_pago            AFTER INSERT OR UPDATE OR DELETE ON pago            FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_pago');
CREATE TRIGGER tg_aud_abono           AFTER INSERT OR UPDATE OR DELETE ON abono           FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_abono');
CREATE TRIGGER tg_aud_devolucion      AFTER INSERT OR UPDATE OR DELETE ON devolucion      FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_devolucion');
CREATE TRIGGER tg_aud_cierre_caja     AFTER INSERT OR UPDATE OR DELETE ON cierre_caja     FOR EACH ROW EXECUTE FUNCTION fn_auditar('id_cierre');

-- ---------------------------------------------------------------------
-- 9. REGLAS DE CRÉDITO Y PRECIOS
-- ---------------------------------------------------------------------
-- Una venta a crédito se crea con saldo_pendiente = total (lo hace la aplicación).
-- Cada pago o abono sobre una venta a crédito descuenta el saldo.
CREATE FUNCTION fn_aplicar_abono() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_credito BOOLEAN;
    v_estado  VARCHAR;
    v_saldo   NUMERIC(12,2);
BEGIN
    SELECT es_credito, estado, saldo_pendiente
      INTO v_credito, v_estado, v_saldo
      FROM venta WHERE id_venta = NEW.id_venta FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La venta % no existe', NEW.id_venta;
    END IF;
    IF NOT v_credito THEN
        RAISE EXCEPTION 'La venta % no es a crédito', NEW.id_venta;
    END IF;
    IF v_estado = 'ANULADA' THEN
        RAISE EXCEPTION 'La venta % está anulada', NEW.id_venta;
    END IF;
    IF NEW.monto > v_saldo THEN
        RAISE EXCEPTION 'El abono (%) supera el saldo pendiente (%)', NEW.monto, v_saldo;
    END IF;

    UPDATE venta SET saldo_pendiente = saldo_pendiente - NEW.monto
     WHERE id_venta = NEW.id_venta;
    RETURN NEW;
END $$;

CREATE TRIGGER tg_abono_aplicar BEFORE INSERT ON abono
    FOR EACH ROW EXECUTE FUNCTION fn_aplicar_abono();

CREATE FUNCTION fn_aplicar_pago() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_credito BOOLEAN;
    v_estado  VARCHAR;
    v_saldo   NUMERIC(12,2);
BEGIN
    SELECT es_credito, estado, saldo_pendiente
      INTO v_credito, v_estado, v_saldo
      FROM venta WHERE id_venta = NEW.id_venta FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La venta % no existe', NEW.id_venta;
    END IF;
    IF v_estado = 'ANULADA' THEN
        RAISE EXCEPTION 'La venta % está anulada', NEW.id_venta;
    END IF;
    IF v_credito THEN
        IF NEW.monto > v_saldo THEN
            RAISE EXCEPTION 'El pago (%) supera el saldo pendiente (%)', NEW.monto, v_saldo;
        END IF;
        UPDATE venta SET saldo_pendiente = saldo_pendiente - NEW.monto
         WHERE id_venta = NEW.id_venta;
    END IF;
    RETURN NEW;
END $$;

CREATE TRIGGER tg_pago_aplicar BEFORE INSERT ON pago
    FOR EACH ROW EXECUTE FUNCTION fn_aplicar_pago();

-- Historial de precios: se guarda solo cuando cambia el precio (RF-31)
CREATE FUNCTION fn_historial_precio() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.precio_metro IS DISTINCT FROM OLD.precio_metro THEN
        INSERT INTO historial_precio(id_tela, precio_anterior, precio_nuevo, id_usuario)
        VALUES (NEW.id_tela, OLD.precio_metro, NEW.precio_metro,
                NULLIF(current_setting('app.id_usuario', true), '')::uuid);
    END IF;
    RETURN NEW;
END $$;

CREATE TRIGGER tg_tela_historial_precio AFTER UPDATE OF precio_metro ON tela
    FOR EACH ROW EXECUTE FUNCTION fn_historial_precio();

-- ---------------------------------------------------------------------
-- 10. DATOS INICIALES: roles, permisos y administradora
-- ---------------------------------------------------------------------
INSERT INTO rol(nombre) VALUES ('Dueña'), ('Vendedor'), ('Almacen');

INSERT INTO permiso(codigo, descripcion) VALUES
 ('venta.registrar',      'Registrar ventas'),
 ('venta.descuento',      'Aplicar descuentos'),
 ('venta.anular',         'Anular ventas (autoriza la dueña, RN-04)'),
 ('abono.registrar',      'Registrar pagos y abonos'),
 ('devolucion.registrar', 'Registrar devoluciones'),
 ('caja.cerrar',          'Realizar el cierre de caja diario'),
 ('cliente.gestionar',    'Gestionar clientes'),
 ('pedido.gestionar',     'Gestionar pedidos y reservas'),
 ('tela.gestionar',       'Gestionar telas y rollos'),
 ('inventario.gestionar', 'Registrar movimientos de inventario'),
 ('compra.gestionar',     'Gestionar compras y proveedores'),
 ('precio.definir',       'Definir precios y descuentos por mayor'),
 ('reporte.ver',          'Consultar y exportar reportes'),
 ('usuario.gestionar',    'Gestionar usuarios y roles'),
 ('auditoria.ver',        'Consultar la auditoría');

-- Dueña: todos los permisos
INSERT INTO rol_permiso
SELECT r.id_rol, p.id_permiso FROM rol r CROSS JOIN permiso p WHERE r.nombre = 'Dueña';

-- Vendedor
INSERT INTO rol_permiso
SELECT r.id_rol, p.id_permiso FROM rol r JOIN permiso p
  ON p.codigo IN ('venta.registrar','abono.registrar','devolucion.registrar',
                  'caja.cerrar','cliente.gestionar','pedido.gestionar')
WHERE r.nombre = 'Vendedor';

-- Almacén
INSERT INTO rol_permiso
SELECT r.id_rol, p.id_permiso FROM rol r JOIN permiso p
  ON p.codigo IN ('tela.gestionar','inventario.gestionar','compra.gestionar')
WHERE r.nombre = 'Almacen';

-- Usuario inicial: CAMBIAR la contraseña temporal; el sistema obliga a cambiarla al ingresar
INSERT INTO usuario(nombre, correo, password_hash, id_rol)
SELECT 'Administradora', 'admin@telasjuanita.local',
       crypt('CambiarEstaClave#1', gen_salt('bf', 12)), id_rol
FROM rol WHERE nombre = 'Dueña';

-- ---------------------------------------------------------------------
-- 11. PERMISOS DE LOS ROLES DE BASE DE DATOS
-- ---------------------------------------------------------------------
REVOKE ALL ON SCHEMA telas FROM PUBLIC;
GRANT USAGE ON SCHEMA telas TO telas_app, telas_backup;

-- La aplicación: leer, insertar y actualizar; nunca alterar la estructura
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA telas TO telas_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA telas TO telas_app;
-- Solo puede borrar líneas de un pedido en edición; ventas, pagos y auditoría no se borran (RN-10)
GRANT DELETE ON detalle_pedido TO telas_app;
-- Auditoría: la app solo agrega y consulta
REVOKE UPDATE ON registro_auditoria FROM telas_app;
-- La app no puede cambiar el catálogo de roles ni permisos (solo leerlo)
REVOKE INSERT, UPDATE ON rol, permiso, rol_permiso FROM telas_app;
-- El historial de precios solo se llena por trigger
REVOKE UPDATE ON historial_precio FROM telas_app;

-- Respaldos (pg_dump): solo lectura de tablas y secuencias
GRANT SELECT ON ALL TABLES IN SCHEMA telas TO telas_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA telas TO telas_backup;

-- Todo lo que se cree después hereda los mismos permisos
ALTER DEFAULT PRIVILEGES FOR ROLE telas_admin IN SCHEMA telas
    GRANT SELECT, INSERT, UPDATE ON TABLES TO telas_app;
ALTER DEFAULT PRIVILEGES FOR ROLE telas_admin IN SCHEMA telas
    GRANT SELECT ON TABLES TO telas_backup;

-- Dejar a telas_admin como dueño de tablas, vistas y funciones
DO $$
DECLARE t RECORD;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'telas' LOOP
        EXECUTE format('ALTER TABLE telas.%I OWNER TO telas_admin', t.tablename);
    END LOOP;
    FOR t IN SELECT viewname FROM pg_views WHERE schemaname = 'telas' LOOP
        EXECUTE format('ALTER VIEW telas.%I OWNER TO telas_admin', t.viewname);
    END LOOP;
    FOR t IN SELECT p.oid::regprocedure AS f
             FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'telas' LOOP
        EXECUTE format('ALTER FUNCTION %s OWNER TO telas_admin', t.f);
    END LOOP;
END $$;

ALTER ROLE telas_app SET search_path = telas;
ALTER ROLE telas_backup SET search_path = telas;
