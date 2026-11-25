#!/bin/bash
# Reel 1080x1920 a 30 fps: un fondo PNG (de una plantilla de reel) con una grabación encima, en el hueco del marco.
# Uso: herramientas/reel.sh fondo.png grabacion.(webm|mp4) desde_segundos hasta_segundos salida.mp4
# Por defecto (Tira y afloja, partida de 1280x800): ESCALA=1000:625 POS=40:600, sin recorte y a velocidad normal.
# Otra cosa: RECORTE=ancho:alto:x:y ESCALA=ancho:alto POS=x:y VEL=1.5 herramientas/reel.sh ...
set -e
F="$1"; V="$2"; A="$3"; B="$4"; O="$5"
ESCALA="${ESCALA:-1000:625}"; POS="${POS:-40:600}"; VEL="${VEL:-1}"
R=""; [ -n "$RECORTE" ] && R="crop=$RECORTE,"
D=$(python3 -c "print($B-$A)"); DS=$(python3 -c "print(round(($B-$A)/$VEL,3))")
ffmpeg -v error -y -loop 1 -framerate 30 -i "$F" -ss "$A" -t "$D" -i "$V" \
  -filter_complex "[1:v]${R}setpts=PTS/${VEL},scale=${ESCALA}:flags=lanczos,fps=30[p];[0:v][p]overlay=${POS}:shortest=1,format=yuv420p,fade=t=out:st=$(python3 -c "print($DS-0.4)"):d=0.4[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 19 -profile:v high -movflags +faststart -r 30 -t "$DS" "${O%.mp4}.tmp.mp4"
mv "${O%.mp4}.tmp.mp4" "$O"
