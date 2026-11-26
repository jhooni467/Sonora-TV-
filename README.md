# SONORA TV

Reproductor musical web para televisores, diseñado como receptor de la aplicación Android SONORA.

## Arquitectura
- SONORA (Android): control remoto, selecciona audio del teléfono y envía metadatos, carátulas y letras.
- SONORA TV (web): interfaz para televisor; recibe audio y comandos, muestra metadatos, portada y letras.
- SONORA Bridge: servicio Node.js independiente para emparejar y retransmitir mensajes y audio. GitHub Pages no ejecuta servidores.

## Pantallas
- index.html: biblioteca local de SONORA TV.
- receiver.html: receptor remoto; crea código de seis dígitos y QR, conecta al bridge, reproduce audio recibido y muestra metadatos y letras.

## Funciones del protocolo v1
- Emparejamiento por QR y código de seis dígitos.
- WebSocket autenticado para controles y metadatos.
- Transferencia del archivo completo mediante HTTP.
- Audio en directo mediante respuesta HTTP chunked.
- Mensajes de metadatos, carátula, letras, cola, progreso y volumen.

Consulta PROTOCOL.md para el contrato compartido y server/ para el servicio.

## Despliegue
El archivo render.yaml prepara el servicio para Render:
1. Crea un servicio web desde este repositorio.
2. Selecciona el blueprint render.yaml.
3. Configura PUBLIC_ORIGIN con la URL HTTPS de GitHub Pages de SONORA TV.
4. Copia la URL HTTPS del servicio para configurarla en SONORA Android y en la página receiver.html.

El bridge requiere Node.js 20 o superior. GitHub Pages seguirá publicando index.html y receiver.html como archivos estáticos.
