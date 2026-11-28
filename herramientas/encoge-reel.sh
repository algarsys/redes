#!/bin/bash
# Mete todo el reel en la zona segura: en los móviles altos, Instagram y sobre todo Facebook recortan los lados
# del vídeo 9:16 (unos 100 px a cada lado) y lo que llegaba al borde quedaba cortado. Encoge el fotograma al 80 %
# (860 px de ancho, centrado) y rellena alrededor con el color de fondo de cada momento (el de la esquina).
# Uso: bash herramientas/encoge-reel.sh entrada.mp4 salida.mp4
set -e
E="$1"; S="$2"; T="${S%.mp4}.tmp.mp4"
AUD=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$E" | head -1)
ffmpeg -v error -y -i "$E" -filter_complex "[0:v]split[a][b];[a]crop=8:8:6:6,scale=1080:1920,setsar=1[f];[b]scale=860:-2:flags=lanczos[p];[f][p]overlay=(W-w)/2:(H-h)/2,format=yuv420p[v]" \
  -map "[v]" $( [ -n "$AUD" ] && echo "-map 0:a -c:a copy" ) -c:v libx264 -preset slow -crf 19 -profile:v high -pix_fmt yuv420p -r 30 -movflags +faststart "$T"
mv "$T" "$S"
