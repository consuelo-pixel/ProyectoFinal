using Microsoft.EntityFrameworkCore;
using TelasJuanita.Business.Services;
using TelasJuanita.Data;
using TelasJuanita.Data.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Configuración de PostgreSQL y DbContext (esquema telas)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<TelasJuanitaDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// Inyección de dependencias (3 capas)
builder.Services.AddScoped<ISaludRepository, SaludRepository>();
builder.Services.AddScoped<ISaludService, SaludService>();

builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteService, ClienteService>();

builder.Services.AddScoped<ITelaRepository, TelaRepository>();
builder.Services.AddScoped<ITelaService, TelaService>();

builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<ICajaRepository, CajaRepository>();
builder.Services.AddScoped<ICajaService, CajaService>();

builder.Services.AddScoped<ICobranzaRepository, CobranzaRepository>();
builder.Services.AddScoped<ICobranzaService, CobranzaService>();

builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IVentaService, VentaService>();

// Controladores
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS para el Frontend (React + Vite en localhost:5173)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("FrontendPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
