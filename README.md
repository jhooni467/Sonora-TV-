# SONORA TV

Reproductor de música web creado para televisores. Puede utilizarse de dos maneras: desde el navegador integrado de la TV o dentro de la aplicación Android TV de Sonora.

## Dos vistas que trabajan juntas

### 1. Inicio y biblioteca

- Navegación de biblioteca y favoritos.
- Añadir archivos de audio o enlaces directos.
- Lista de canciones con acciones para marcar favoritos o eliminar.
- Reproductor compacto fijo en la parte inferior.
- Portadas para las canciones.

### 2. Reproductor completo

Al seleccionar una canción se abre una vista independiente a pantalla completa:

- Portada grande, nombre de canción y artista.
- Controles de anterior, reproducir y siguiente.
- Barra de progreso y volumen.
- Aleatorio, favoritos y repetición.
- Panel de letras y edición manual por canción.
- Menú para volver a la biblioteca o solicitar pantalla completa.

La pantalla completa no reemplaza la biblioteca: se abre sobre ella y se puede cerrar para volver.

## Funciones musicales

- Reproducir archivos de audio compatibles con el navegador.
- Añadir enlaces directos HTTP/HTTPS a archivos de audio.
- Añadir portada por URL a canciones añadidas mediante enlace.
- Biblioteca persistente mediante IndexedDB cuando el navegador lo permite.
- Favoritos, cola, reproducción aleatoria, repetición, volumen y barra de progreso.
- Eliminar canciones de la biblioteca.
- Navegación con flechas y teclas multimedia cuando el dispositivo las admite.

Los enlaces a páginas de YouTube o Spotify no son enlaces directos de audio. Los formatos reproducibles dependen de los códecs compatibles con el navegador de la TV.

## Conectar Sonora Remote

El reproductor web se integra con [Sonora Remote](https://github.com/jhooni467/Sonora).

1. Abre Sonora Remote en el teléfono.
2. Conecta el teléfono y la TV a la misma red Wi‑Fi.
3. En Sonora Remote pulsa **Conectar**. Aparecen la dirección local del teléfono, un QR y un PIN de seis cifras.
4. Abre en el navegador de la TV la dirección HTTP local que muestra el teléfono. El QR incluye el PIN y puede completar el emparejamiento automáticamente.
5. Si no puedes usar el QR, abre la dirección sin el código y pulsa **CONECTAR CONTROL** en la página; introduce manualmente el PIN.

La versión Android TV nativa permite escribir la dirección IPv4 y el PIN en su pantalla de conexión. Después abre este mismo reproductor dentro de un WebView.

### Comunicación local

- HTTP del teléfono: puerto **8765**. Sirve esta página y el audio elegido desde el teléfono.
- WebSocket: puerto **8766**. Valida el PIN, recibe órdenes de reproducción y navegación y envía el estado de la canción al móvil.
- Los dos dispositivos deben poder comunicarse dentro de la misma red local.

La página pública de GitHub Pages sigue siendo un reproductor independiente. Para emparejar Sonora Remote, utiliza la dirección HTTP local servida por el teléfono. Los navegadores bloquean el intento de una página HTTPS pública de abrir un WebSocket local no cifrado.

La conexión local no está cifrada. Úsala solo en una red privada de confianza y no expongas los puertos locales a Internet. Mantén Sonora Remote activo mientras quieras recibir órdenes o reproducir un archivo que esté siendo servido desde el teléfono.

## Publicar con GitHub Pages

1. En el repositorio abre **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/(root)**, y guarda.
4. Abre la URL publicada en el navegador de tu televisor.

URL pública: https://jhooni467.github.io/Sonora-TV-/

## Paleta visual

- Fondo: #090B10
- Panel: #171C26
- Texto: #F3F4F6
- Texto secundario: #B9C0CC
- Acento: #FFB86B

## Compatibilidad

El navegador del televisor debe admitir HTML5 Audio, JavaScript, WebSocket e IndexedDB. La selección de archivos desde USB depende del navegador integrado; cuando no esté disponible se pueden usar enlaces directos a archivos de audio accesibles desde la red.

La versión web se distribuye desde `index.html`. El repositorio Android incluye una copia sincronizada en `remote/src/main/assets/sonora-tv/index.html`, que el servidor local del teléfono sirve a la aplicación TV. Cuando se modifica el reproductor, ambas copias deben mantenerse sincronizadas.

Dentro de la aplicación Android TV, el WebView abre el selector de documentos de Android cuando se elige **Agregar música**. Los archivos de memorias USB aparecen si el sistema Android TV los expone mediante su proveedor de documentos.
