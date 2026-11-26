# SONORA TV

Reproductor de música web creado exclusivamente para televisores. No necesita APK ni instalación: se abre desde el navegador de la TV.

## Pantalla del reproductor

- Interfaz de pantalla completa en formato horizontal.
- Portada grande a la izquierda, nombre de canción y artista debajo.
- Controles de reproducción con iconografía SVG propia, sin emojis ni caracteres usados como iconos.
- Diseño de portada predeterminado para canciones que no tengan imagen.
- Zona de letras a la derecha; se puede escribir o pegar manualmente la letra de cada canción.
- Texto de la interfaz no seleccionable.
- Menú superior para biblioteca, favoritos, añadir archivos, añadir enlaces y activar pantalla completa.
- Navegación con flechas, OK y teclas multimedia cuando el navegador/televisor las admite.

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
- Añadir una portada opcional a canciones por enlace.
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
