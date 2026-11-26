# SONORA TV

Reproductor de música web creado **exclusivamente para televisores**. No necesita APK ni instalación: se abre desde el navegador integrado de la TV.

## Diseño

La interfaz está pensada para pantallas de televisión en formato horizontal, con tarjetas limpias y navegación desde el control remoto. La escala se ajusta a distintos tamaños y resoluciones de TV, desde pantallas HD hasta 4K.

Paleta de color:
- Purplish Blue: #0B2558
- Blue Oasis: #1C618B
- Larkspur: #2D90A7
- Blue Lemonade: #3FBFC0
- Aventurine: #53F2B8
- Spearmint Water: #D0FEFF

## Funciones

- Reproducir canciones desde archivos de audio compatibles.
- Añadir enlaces directos HTTP/HTTPS a archivos de audio.
- Guardar biblioteca y archivos en IndexedDB, cuando el navegador lo permite.
- Favoritos, lista de reproducción, aleatorio y repetición.
- Control de reproducción, volumen y posición de la canción.
- Navegación por flechas, OK y teclas multimedia compatibles con el control remoto.

## Publicar con GitHub Pages

1. En el repositorio abre **Settings → Pages**.
2. En **Build and deployment**, elige **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/(root)**, y guarda.
4. Espera a que GitHub Pages termine el despliegue.
5. Abre la URL publicada en el navegador de tu televisor.

## Compatibilidad

La TV necesita soporte para HTML5 Audio, JavaScript e IndexedDB. La selección de archivos desde USB depende del navegador del televisor; si no está disponible, se pueden usar enlaces directos a archivos de audio accesibles por internet o por la red local. Los enlaces a páginas de YouTube o Spotify no son enlaces directos de audio.

Los formatos reproducibles dependen de los códecs que incluya el navegador del televisor. Algunos navegadores bloquean la reproducción automática, por lo que puede ser necesario pulsar **Reproducir**.
