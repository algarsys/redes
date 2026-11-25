#!/bin/bash
# Reel 1080x1920 a 30 fps: fondo (PNG de plantilla-reel-juego.html) con la partida grabada (1280x800) encima, en el hueco del marco.
# Uso: herramientas/reel.sh fondo.png partida.webm desde_segundos hasta_segundos salida.mp4
set -e
F="$1"; V="$2"; A="$3"; B="$4"; O="$5"
D=$(python3 -c "print($B-$A)")
ffmpeg -v error -y -loop 1 -framerate 30 -i "$F" -ss "$A" -t "$D" -i "$V" \
  -filter_complex "[1:v]scale=1000:625:flags=lanczos,fps=30[p];[0:v][p]overlay=40:600:shortest=1,format=yuv420p,fade=t=out:st=$(python3 -c "print($D-0.4)"):d=0.4[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 19 -profile:v high -movflags +faststart -r 30 "${O%.mp4}.tmp.mp4"
mv "${O%.mp4}.tmp.mp4" "$O"
