# Telas Juanita – Sistema de ventas e inventario

Proyecto final: API en .NET (3 capas) + PostgreSQL + frontend en React/TypeScript.

## 1. Base de datos
Ejecutar en este orden (con el usuario `postgres`):
1. `database/01_crear_base_y_roles.sql`
2. `database/02_esquema.sql`
3. `database/03_datos_demo.sql` (solo desarrollo: crea usuarios, clientes y telas de prueba)

Usuarios de prueba (script 3 y admin del script 2):

| Rol | Correo | Contraseña |
|---|---|---|
| Dueña | admin@telasjuanita.local | CambiarEstaClave#1 |
| Vendedor | vendedor@telasjuanita.local | Vendedor123# |
| Almacen | almacen@telasjuanita.local | Almacen123# |
| Cliente | cliente@telasjuanita.local | Cliente123# |

## 2. Backend
```
cd backend/TelasJuanita.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=telasjuanita;Username=telas_app;Password=TU_CLAVE"
dotnet user-secrets set "Jwt:Clave" "UNA-CLAVE-LARGA-Y-SECRETA-DE-AL-MENOS-32-CARACTERES"
dotnet run --urls http://localhost:5000
```
- El login devuelve un token JWT; el resto de endpoints exigen ese token y el rol correcto.
- Cambiar `Jwt:Clave` antes de publicar el sistema.

Pruebas: `dotnet test backend/TelasJuanita.Tests`

## 3. Frontend
```
cd frontend
npm install
npm run dev      # http://localhost:5173 (Vite redirige /api al backend)
npm test
```
