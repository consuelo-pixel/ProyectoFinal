using Microsoft.AspNetCore.Mvc;
using TelasJuanita.Business.Services;

namespace TelasJuanita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SaludController : ControllerBase
{
    private readonly ISaludService _saludService;

    public SaludController(ISaludService saludService)
    {
        _saludService = saludService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var resultado = await _saludService.VerificarSaludAsync();
            if (resultado.Estado != "OK")
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable, resultado);
            }

            return Ok(resultado);
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                estado = "ERROR",
                mensaje = "Error al conectar con la base de datos",
                error = ex.Message
            });
        }
    }
}
