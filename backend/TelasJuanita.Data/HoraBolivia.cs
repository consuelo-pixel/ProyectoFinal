namespace TelasJuanita.Data;

// Bolivia está en UTC-4 todo el año (no tiene horario de verano).
// La base guarda las fechas en UTC, pero el "día" de la tienda es el día de Bolivia.
public static class HoraBolivia
{
    private static readonly TimeSpan Desfase = TimeSpan.FromHours(-4);

    // Fecha de hoy según la hora de Bolivia
    public static DateOnly Hoy()
    {
        return DateOnly.FromDateTime(DateTime.UtcNow + Desfase);
    }

    // Devuelve desde qué hora hasta qué hora (en UTC) dura un día boliviano
    public static (DateTime Inicio, DateTime Fin) RangoUtc(DateOnly fecha)
    {
        var medianoche = DateTime.SpecifyKind(fecha.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
        var inicioUtc = medianoche - Desfase;
        return (inicioUtc, inicioUtc.AddDays(1));
    }
}
