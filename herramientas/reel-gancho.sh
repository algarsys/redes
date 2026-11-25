#!/bin/bash
# Reel corto para enganchar: la partida acelerada hasta justo antes del final y el final a velocidad normal, con el
# último fotograma parado un momento. El fondo cambia al llegar el final (otro texto abajo, para pedir comentarios).
# Uso: herramientas/reel-gancho.sh fondo.png fondo-final.png partida.mp4 desde final hasta VEL salida.mp4
#   desde..final va a VEL; final..hasta, a velocidad normal; después, PARADA segundos (1.2) con el último fotograma.
# Como reel.sh: ESCALA=1000:625 POS=40:600 y RECORTE=ancho:alto:x:y si hace falta.
set -e
F1="$1"; F2="$2"; V="$3"; A="$4"; B="$5"; C="$6"; VEL="$7"; O="$8"
ESCALA="${ESCALA:-1000:625}"; POS="${POS:-40:600}"; PARADA="${PARADA:-1.2}"
R=""; [ -n "$RECORTE" ] && R="crop=$RECORTE,"
D1=$(python3 -c "print(round(($B-$A)/$VEL,3))"); D=$(python3 -c "print(round($D1+$C-$B+$PARADA,3))")
ffmpeg -v error -y -loop 1 -framerate 30 -i "$F1" -i "$V" -loop 1 -framerate 30 -i "$F2" \
  -filter_complex "[1:v]split[x][y];[x]trim=$A:$B,setpts=(PTS-STARTPTS)/${VEL},${R}scale=${ESCALA}:flags=lanczos,fps=30[s1];[y]trim=$B:$C,setpts=PTS-STARTPTS,${R}scale=${ESCALA}:flags=lanczos,fps=30[s2];[s1][s2]concat=n=2:v=1:a=0,tpad=stop_mode=clone:stop_duration=${PARADA}[p];[0:v][2:v]overlay=0:0:enable='gte(t,${D1})'[bg];[bg][p]overlay=${POS}:eof_action=pass,format=yuv420p,fade=t=out:st=$(python3 -c "print($D-0.3)"):d=0.3[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 19 -profile:v high -movflags +faststart -r 30 -t "$D" "${O%.mp4}.tmp.mp4"
mv "${O%.mp4}.tmp.mp4" "$O"
echo "$O: $D s (rápido $D1 s a x$VEL)"
