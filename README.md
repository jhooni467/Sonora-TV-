# SONORA TV

Reproductor de música web creado exclusivamente para televisores. No necesita APK ni instalación: se abre desde el navegador de la TV.

## Dos vistas que trabajan juntas

### 1. Inicio y biblioteca

Se conserva la pantalla principal de SONORA TV con:
- Navegación de biblioteca y favoritos.
- Tarjeta principal para agregar música.
- Lista de canciones y acciones de favorito/eliminar.
- Reproductor compacto fijo en la parte inferior.
- Botón del reproductor compacto para abrir la vista completa.

### 2. Reproductor completo

Al seleccionar una canción desde la lista se abre una vista independiente a pantalla completa:
- Portada grande a la izquierda.
- Nombre de la canción y artista debajo.
- Controles de anterior, reproducir y siguiente.
- Barra de progreso y volumen.
- Aleatorio, favoritos y repetición.
- Pantalla de letras a la derecha.
- Edición manual de letras por canción.
- Menú de opciones para volver a la biblioteca o solicitar pantalla completa del navegador.

La pantalla completa no reemplaza el inicio: se abre sobre él y se puede cerrar para volver a la biblioteca.

## Reglas visuales

- Interfaz para televisión en formato horizontal.
- Controles e iconos SVG propios; no se usan emojis como iconos de acción.
- Portada gráfica predeterminada para canciones sin carátula.
- Textos de interfaz no seleccionables; los campos de edición conservan selección para poder escribir.
- Escalado para distintas resoluciones de televisor.

## Paleta oficial

- Purplish Blue: #0B2558
- Blue Oasis: #1C618B
- Larkspur: #2D90A7
- Blue Lemonade: #3FBFC0
- Aventurine: #53F2B8
- Spearmint Water: #D0FEFF

## Funciones musicales

- Reproducir archivos de audio compatibles.
- Añadir enlaces directos HTTP/HTTPS a archivos de audio.
- Añadir portada por enlace para canciones agregadas desde URL.
- Biblioteca persistente mediante IndexedDB cuando el navegador lo permite.
- Favoritos, reproducción aleatoria, repetición, volumen y barra de progreso.
- Eliminar canciones de la biblioteca.

## Publicar con GitHub Pages

1. En el repositorio abre **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/(root)**, y guarda.
4. Espera a que GitHub Pages termine el despliegue.
5. Abre la URL publicada en el navegador de tu televisor.

## Compatibilidad

El navegador del televisor debe admitir HTML5 Audio, JavaScript e IndexedDB. La selección de archivos desde USB depende del navegador integrado; cuando no esté disponible se pueden usar enlaces directos a archivos de audio accesibles desde la red. Los enlaces a páginas de YouTube o Spotify no son enlaces directos de audio.

Los formatos reproducibles dependen de los códecs compatibles con el navegador del televisor. Algunos navegadores bloquean la reproducción automática, por lo que puede ser necesario pulsar **Reproducir**.
