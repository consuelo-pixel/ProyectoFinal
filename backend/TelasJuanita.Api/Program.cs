using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TelasJuanita.Api;
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
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<ICajaRepository, CajaRepository>();
builder.Services.AddScoped<ICajaService, CajaService>();

builder.Services.AddScoped<ICobranzaRepository, CobranzaRepository>();
builder.Services.AddScoped<ICobranzaService, CobranzaService>();

builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IVentaService, VentaService>();

builder.Services.AddScoped<IReporteService, ReporteService>();

// Autenticación con JWT
var claveJwt = builder.Configuration["Jwt:Clave"];
if (string.IsNullOrWhiteSpace(claveJwt) || claveJwt.Length < 32)
{
    throw new InvalidOperationException("Falta configurar Jwt:Clave (mínimo 32 caracteres). Revisa el README.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Emisor"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audiencia"],
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJwt)),
            ClockSkew = TimeSpan.Zero,
            RoleClaimType = ClaimTypes.Role,
            NameClaimType = ClaimTypes.Name
        };
    });

builder.Services.AddAuthorization();

// Controladores
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS para el Frontend (los orígenes se configuran en appsettings.json)
var origenesPermitidos = builder.Configuration.GetSection("Cors:Origenes").Get<string[]>()
                         ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(origenesPermitidos)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Si algo falla sin controlar, se devuelve un mensaje con detalle en desarrollo para diagnóstico rápido
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
        var ex = exceptionFeature?.Error;

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var detalle = ex != null
            ? $"{ex.Message}{(ex.InnerException != null ? " -> " + ex.InnerException.Message : "")}"
            : "Ocurrió un error en el servidor. Intenta nuevamente.";

        await context.Response.WriteAsJsonAsync(new
        {
            mensaje = app.Environment.IsDevelopment() ? detalle : "Ocurrió un error en el servidor. Intenta nuevamente."
        });
    });
});

app.UseCors("FrontendPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
