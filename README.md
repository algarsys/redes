# Redes

Imágenes y vídeos que se publican en Instagram y Facebook de las marcas de Algarsys (Tira y afloja, ReservaDeportes y PadelMagic), programados con Metricool. Este repositorio solo existe para que cada archivo tenga un enlace público: todo lo que hay aquí es contenido que se publica.

## Carpetas

- `publicaciones/AAAA-MM-DD-marca-tema/`: lo que sale ese día. Lleva las imágenes o el vídeo y `texto.txt` con el texto de la publicación.
- `marcas/<marca>/`: plantillas HTML de cada marca, sus fuentes y, en Tira y afloja, `juegos.json` (los juegos de la portada) y `capturas/` (una captura de cada juego).
- `marcas/tirayafloja/partidas/<id>.mp4`: partidas grabadas (1280x800, sin sonido) para montar Reels con `plantilla-reel-juego.html` y `herramientas/reel.sh`.
- `herramientas/`: scripts para sacar las imágenes de las plantillas (`foto.js`), la lista de juegos (`catalogo.js`) y las capturas (`capturas.js`).
- `publicado.md`: lo que ya está programado o publicado, para no repetir.

## Sacar una imagen de una plantilla

    node herramientas/foto.js marcas/tirayafloja/plantilla-juego.html salida.png 1080 1350 '{"id":"camellos","nombre":"Carrera de camellos","desc":"...","cursos":"1º a 6º de Primaria"}'

Formatos: feed 1080x1350 (4:5) o 1080x1080; carrusel de hasta 10 imágenes; Reel 1080x1920 en MP4 con portada JPG.

## Enlace público de un archivo

    https://raw.githubusercontent.com/algarsys/redes/main/<ruta del archivo>

## Reel con una partida

    node herramientas/foto.js marcas/tirayafloja/plantilla-reel-juego.html fondo.png 1080 1920 '{"gancho":"¿Qué equipo gana?","nombre":"Tira y afloja","linea":"...","cta":"5 partidas gratis en tirayafloja.com"}'
    herramientas/reel.sh fondo.png marcas/tirayafloja/partidas/tira-y-afloja.mp4 0 26 reel.mp4

La portada del Reel: la misma plantilla con "foto" (un fotograma de la partida) y guardada en JPG.

## Reel corto con gancho

Pregunta grande arriba ("Elige un camello. ¿Cuál gana?"), la partida acelerada y el final a velocidad normal, y abajo una
frase que cambia al final para pedir comentarios. Unos 15 segundos. La música se pone al programarlo, con la de Instagram.

    node herramientas/foto.js marcas/tirayafloja/plantilla-reel-gancho.html a.png 1080 1920 '{"gancho":"...","nombre":"...","linea":"Mira hasta el final."}'
    node herramientas/foto.js marcas/tirayafloja/plantilla-reel-gancho.html b.png 1080 1920 '{"gancho":"...","nombre":"...","linea":"¿Ha ganado el tuyo? Dinos tu color en comentarios."}'
    ESCALA=1016:635 POS=32:700 herramientas/reel-gancho.sh a.png b.png marcas/tirayafloja/partidas/camellos.mp4 0.4 34.6 36.4 2.6 reel.mp4
