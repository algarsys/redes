# Redes

Imágenes y vídeos que se publican en Instagram y Facebook de las marcas de Algarsys (Tira y afloja, ReservaDeportes y PadelMagic), programados con Metricool. Este repositorio solo existe para que cada archivo tenga un enlace público: todo lo que hay aquí es contenido que se publica.

## Carpetas

- `publicaciones/AAAA-MM-DD-marca-tema/`: lo que sale ese día. Lleva las imágenes o el vídeo y `texto.txt` con el texto de la publicación.
- `marcas/<marca>/`: plantillas HTML de cada marca, sus fuentes y, en Tira y afloja, `juegos.json` (los juegos de la portada) y `capturas/` (una captura de cada juego).
- `herramientas/`: scripts para sacar las imágenes de las plantillas (`foto.js`), la lista de juegos (`catalogo.js`) y las capturas (`capturas.js`).
- `publicado.md`: lo que ya está programado o publicado, para no repetir.

## Sacar una imagen de una plantilla

    node herramientas/foto.js marcas/tirayafloja/plantilla-juego.html salida.png 1080 1350 '{"id":"camellos","nombre":"Carrera de camellos","desc":"...","cursos":"1º a 6º de Primaria"}'

Formatos: feed 1080x1350 (4:5) o 1080x1080; carrusel de hasta 10 imágenes; Reel 1080x1920 en MP4 con portada JPG.

## Enlace público de un archivo

    https://raw.githubusercontent.com/algarsys/redes/main/<ruta del archivo>
