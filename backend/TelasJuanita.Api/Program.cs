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

// Inyección de dependencias respetando las 3 capas
builder.Services.AddScoped<ISaludRepository, SaludRepository>();
builder.Services.AddScoped<ISaludService, SaludService>();

// Controladores
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS para el Frontend (React + Vite)
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
