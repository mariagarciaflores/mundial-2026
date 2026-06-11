# ⚽ Mundial 2026 — Calendario, Resultados y Plantillas

Aplicación web para seguir la Copa Mundial de la FIFA 2026 (Canadá · México · Estados Unidos).

## Funcionalidades

- **Partidos por día** con navegación por todo el calendario (11 de junio – 19 de julio de 2026).
- **Horarios internacionales**: España y Bolivia siempre visibles, más un selector con 35+ países. La zona activa controla la agrupación por día.
- **Resultados en vivo**: marcadores actualizados automáticamente cada 60 segundos, con indicador de partidos en directo y ganadores/perdedores resaltados al finalizar.
- **Clasificaciones**: tablas de los 12 grupos (PJ, G, E, P, GF, GC, DG, Pts) calculadas en tiempo real, más la tabla de mejores terceros.
- **Eliminatorias**: los cruces aparecen automáticamente cuando termina la fase de grupos.
- **Plantillas completas**: los 26 jugadores de las 48 selecciones, con foto, edad, dorsal, posición, club, partidos internacionales y goles.
- **Biografías**: ficha de cada jugador con su biografía de Wikipedia (en español si está disponible).
- **Interfaz en español e inglés**.

## Tecnología

HTML + CSS + JavaScript sin dependencias ni proceso de build — ideal para GitHub Pages.

| Datos | Fuente |
|---|---|
| Calendario y resultados en vivo | [TheSportsDB](https://www.thesportsdb.com) (API gratuita) |
| Plantillas (48 equipos × 26 jugadores) | Wikipedia — *2026 FIFA World Cup squads* |
| Fotos y biografías de jugadores | API REST de Wikipedia (es/en) |

Si la API de resultados no responde, la app usa una copia local del calendario (`data/schedule-fallback.json`).

## Desarrollo local

```bash
python3 -m http.server 8642
# abrir http://localhost:8642
```

---

Hecho con ❤️ para el Mundial 2026.
