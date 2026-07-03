# VideoWall
Projecto VideoWall Stack type script
# VideoWall Dashboard System

Panel de administración + página `/display` para rotar dashboards de Power BI en un video wall LG Supersign CMS, sobre red local con HTTPS.

## Stack
Next.js 14 · Prisma · SQLite · Docker · Caddy (HTTPS con `tls internal`).

## Requisitos
- Docker Desktop en el mini PC.
- IP fija del mini PC en la LAN (ej. `192.168.1.50`).

## Puesta en marcha

1. Edita `Caddyfile` y cambia `192.168.1.50` por la IP del mini PC.
2. En la carpeta del proyecto:
   ```bash
   docker compose up -d --build
   ```
3. Abre el panel: `https://<IP>/admin` (acepta el aviso de certificado autofirmado).
4. Login demo:
   - Usuario: `videowall@exel.com`
   - Contraseña: `Entrada01`
5. URL para LG Supersign CMS: `https://<IP>/display`

## Datos
La base SQLite se guarda en `./data/videowall.db` (persistente).

## Certificado en LG Supersign
Caddy usa `tls internal` (autofirmado). Si el CMS no acepta el certificado:
- Opción A: activa "permitir certificados no verificados" en el CMS.
- Opción B: importa el root CA de Caddy (`caddy_data` volumen → `pki/authorities/local/root.crt`) en el SO del video wall.

## Comandos útiles
```bash
docker compose logs -f app     # ver logs
docker compose restart app     # reiniciar
docker compose down            # detener
```

## Estructura
```
prisma/schema.prisma   modelos Dashboard + DisplayConfig
src/app/admin          panel (login + CRUD + drag&drop + config)
src/app/display        vista para el video wall
src/app/api/*          endpoints REST + display-state (polling 5s)
Dockerfile             build standalone Next.js
docker-compose.yml     app + caddy
Caddyfile              HTTPS local (tls internal)
```
