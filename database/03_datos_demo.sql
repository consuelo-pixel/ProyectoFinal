-- =====================================================================
-- Telas Juanita - Script 3: DATOS DE PRUEBA (solo para desarrollo / demo)
-- Ejecutar DESPUÉS del script 2, conectado a "telasjuanita" como "postgres".
-- NO ejecutar en producción: crea usuarios con contraseñas conocidas.
-- Se puede ejecutar más de una vez sin duplicar datos.
-- =====================================================================

SET search_path = telas, public;

-- El sistema usa 4 roles; el script 2 solo creó 3, falta el del cliente
INSERT INTO rol(nombre) VALUES ('Cliente') ON CONFLICT (nombre) DO NOTHING;

-- Usuarios de prueba (las contraseñas se guardan con BCrypt, igual que el admin del script 2)
-- admin@telasjuanita.local     /  Admin123#
-- vendedor@telasjuanita.local  /  Vendedor123#
-- almacen@telasjuanita.local   /  Almacen123#
-- cliente@telasjuanita.local   /  Cliente123#
UPDATE usuario
SET password_hash = crypt('Admin123#', gen_salt('bf', 12))
WHERE correo = 'admin@telasjuanita.local';

INSERT INTO usuario(nombre, correo, password_hash, id_rol, debe_cambiar_password)
SELECT 'Mariana Torrez', 'vendedor@telasjuanita.local', crypt('Vendedor123#', gen_salt('bf', 12)), id_rol, FALSE
FROM rol WHERE nombre = 'Vendedor'
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuario(nombre, correo, password_hash, id_rol, debe_cambiar_password)
SELECT 'Gonzalo Choque', 'almacen@telasjuanita.local', crypt('Almacen123#', gen_salt('bf', 12)), id_rol, FALSE
FROM rol WHERE nombre = 'Almacen'
ON CONFLICT (correo) DO NOTHING;

INSERT INTO usuario(nombre, correo, password_hash, id_rol, debe_cambiar_password)
SELECT 'María Elena Morales', 'cliente@telasjuanita.local', crypt('Cliente123#', gen_salt('bf', 12)), id_rol, FALSE
FROM rol WHERE nombre = 'Cliente'
ON CONFLICT (correo) DO NOTHING;

-- Clientes
INSERT INTO cliente(nombre, carnet, nit, telefono, direccion, limite_credito) VALUES
 ('María Elena Morales',   '5849302', '5849302018', '71894022', 'Barrio San Roque #450, Tarija', 1500),
 ('Carlos Andrés Benítez', '4930291', '4930291012', '68710293', 'Av. Las Panosas #120, Tarija',  3000),
 ('Lucía Fernández Ramos', '7291038', NULL,         '73491022', 'Mercado Central Puesto #14',    800)
ON CONFLICT (carnet) DO NOTHING;

-- Telas
INSERT INTO tela(codigo, nombre, tipo, color, ancho, precio_metro, stock_minimo, url_foto) VALUES
 ('TEL-001', 'Lino Italiano',            'Lino',     'Beige',        1.50, 45.00, 20, '/images/telas/tel-001.svg'),
 ('TEL-002', 'Seda Satín Brillante',     'Seda',     'Rojo Carmesí', 1.40, 65.00, 15, '/images/telas/tel-002.svg'),
 ('TEL-003', 'Algodón Pima Suave',       'Algodón',  'Azul Marino',  1.60, 38.00, 30, '/images/telas/tel-003.svg'),
 ('TEL-004', 'Popelina Estampada Flores','Popelina', 'Multicolor',   1.40, 28.50, 25, '/images/telas/tel-004.svg')
ON CONFLICT (codigo) DO UPDATE SET url_foto = EXCLUDED.url_foto;

-- Un rollo por tela (solo si la tela todavía no tiene rollos)
INSERT INTO rollo(id_tela, metros_iniciales, metros_disponibles)
SELECT t.id_tela, v.metros, v.metros
FROM tela t
JOIN (VALUES ('TEL-001', 85.50), ('TEL-002', 40.00), ('TEL-003', 120.00), ('TEL-004', 60.00)) AS v(codigo, metros)
  ON v.codigo = t.codigo
WHERE NOT EXISTS (SELECT 1 FROM rollo r WHERE r.id_tela = t.id_tela);
