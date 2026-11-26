# SONORA TV

Reproductor de música web para televisores. La biblioteca y el reproductor completo funcionan en el navegador; la conexión con Sonora Remote se inicia desde la TV.

## Enlaces

- Web pública: https://jhooni467.github.io/Sonora-TV-/
- Pantalla de conexión para la TV: https://jhooni467.github.io/Sonora-TV-/receiver.html
- Aplicación Android: https://github.com/jhooni467/Sonora
- Configuración compartida: [bridge-config.json](bridge-config.json)

## Cómo se emparejan los dispositivos

**La TV genera el código. El teléfono lo introduce.**

1. Abre SONORA TV en el navegador de la televisión.
2. Pulsa **CONECTAR SONORA**.
3. La TV solicita una sesión al servidor, muestra un código de seis dígitos y genera un QR con ese código.
4. Abre Sonora Remote en Android y escribe el código que aparece en la TV. También puedes escanear el QR.
5. Android y la TV consultan la misma dirección del servidor desde `bridge-config.json` y se conectan al Bridge por HTTPS/WSS.
6. El estado cambia a conectado cuando se establece el canal WebSocket y la TV confirma su presencia.

No hay que introducir una URL de servidor en el teléfono. La URL se configura una sola vez en `bridge-config.json`.

## Desplegar SONORA Bridge (requisito para emparejar)

GitHub Pages solo aloja los archivos web; no ejecuta el servidor Node.js ni WebSocket. El Bridge está preparado en `server/` y el despliegue se define en `render.yaml`.

1. Abre el [Blueprint de SONORA TV en Render](https://dashboard.render.com/blueprint/new?repo=https://github.com/jhooni467/Sonora-TV-).
2. Inicia sesión en Render y conecta la cuenta de GitHub si lo solicita.
3. Revisa el servicio `sonora-tv-bridge` y pulsa **Apply** para crear el servicio.
4. Cuando el servicio esté desplegado, copia su URL HTTPS (por ejemplo, la URL que Render asigna a `sonora-tv-bridge`).
5. Edita `bridge-config.json` en este repositorio y coloca esa URL en `bridgeUrl`, sin una barra final.
6. Guarda el cambio. GitHub Pages publicará la nueva configuración; Android y la TV leerán el mismo archivo.

Ejemplo de configuración:

```json
{
  "version": 1,
  "bridgeUrl": "https://TU-SERVICIO.onrender.com"
}
```

**Estado actual:** `bridgeUrl` está vacío hasta que se cree el servicio de Render. Por tanto, la pantalla de conexión ya tiene el flujo correcto, pero no podrá generar un código real ni emparejar teléfonos hasta completar el despliegue y configurar esa URL.

## Qué hace el Bridge

- Crea sesiones de TV y códigos de seis cifras con caducidad de 15 minutos.
- Valida el código que envía el teléfono y emite credenciales de sesión.
- Mantiene un WebSocket autenticado para controles, estado y metadatos.
- Notifica presencia y desconexiones de ambos dispositivos.
- Permite recuperar la conexión usando el mismo token.
- Recibe archivos completos y transmite audio por un flujo HTTP.
- Incluye una prueba automatizada de emparejamiento, mensajes y reconexión.

Consulta [PROTOCOL.md](PROTOCOL.md) para el contrato de comunicación.

## Reproductor web

- Biblioteca local y favoritos.
- Archivos de audio y enlaces directos.
- Portadas y una portada predeterminada.
- Reproductor completo independiente de la biblioteca.
- Controles grandes para pantalla de TV y navegación con mando.
- Portada destacada, barra de progreso gruesa y panel de letras.

Los formatos que se pueden reproducir dependen de los códecs del navegador del televisor. Los enlaces a páginas de YouTube o Spotify no son archivos de audio directos.

## GitHub Actions

El workflow **SONORA Bridge validation** comprueba la sintaxis del servidor y las páginas web, y ejecuta una prueba automática del código de TV, el emparejamiento Android simulado, el intercambio de mensajes y la reconexión.

## Paleta

- Purplish Blue: #0B2558
- Blue Oasis: #1C618B
- Larkspur: #2D90A7
- Blue Lemonade: #3FBFC0
- Aventurine: #53F2B8
- Spearmint Water: #D0FEFF
