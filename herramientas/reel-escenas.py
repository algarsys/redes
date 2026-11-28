#!/usr/bin/env python3
"""Reel por escenas (1080x1920, 30 fps): cada escena es un fondo con la partida encima, en tramos con su velocidad,
y se puede terminar con una escena fija (por ejemplo, la de "Síguenos" con el logo). Todas las escenas salen con los
mismos ajustes y se unen sin volver a codificar.

Uso: python3 herramientas/reel-escenas.py receta.json salida.mp4
Receta:
{"escenas": [
   {"fondo": "a.png", "fondo_final": "b.png", "video": "marcas/tirayafloja/partidas/camellos.mp4",
    "tramos": [[3.0, 20.5, 2.5], [20.5, 23.5, 1]], "parada": 1.0, "escala": "1016:635", "pos": "32:700"},
   {"imagen": "final.png", "dura": 2.5}
]}
"fondo_final" (opcional) sustituye al fondo al empezar el último tramo. "parada": segundos con el último fotograma.
"""
import json, os, subprocess, sys, tempfile

COD = ["-c:v", "libx264", "-preset", "slow", "-crf", "19", "-profile:v", "high", "-pix_fmt", "yuv420p", "-r", "30", "-an"]

def escena_video(e, sal):
    tramos = e["tramos"]; parada = float(e.get("parada", 1.0))
    esc = e.get("escala", "1016:635"); pos = e.get("pos", "32:700")
    rec = ("crop=%s," % e["recorte"]) if e.get("recorte") else ""
    durs = [(b - a) / v for a, b, v in tramos]
    d = round(sum(durs) + parada, 3)
    t_ult = round(sum(durs[:-1]), 3)
    ent = ["-loop", "1", "-framerate", "30", "-i", e["fondo"], "-i", e["video"]]
    if e.get("fondo_final"):
        ent += ["-loop", "1", "-framerate", "30", "-i", e["fondo_final"]]
    n = len(tramos)
    f = "[1:v]split=%d%s;" % (n, "".join("[x%d]" % i for i in range(n)))
    for i, (a, b, v) in enumerate(tramos):
        f += "[x%d]trim=%s:%s,setpts=(PTS-STARTPTS)/%s,%sscale=%s:flags=lanczos,fps=30[s%d];" % (i, a, b, v, rec, esc, i)
    f += "".join("[s%d]" % i for i in range(n)) + "concat=n=%d:v=1:a=0,tpad=stop_mode=clone:stop_duration=%s[p];" % (n, parada)
    if e.get("fondo_final"):
        f += "[0:v][2:v]overlay=0:0:enable='gte(t,%s)'[bg];[bg][p]overlay=%s:eof_action=pass,format=yuv420p[v]" % (t_ult, pos)
    else:
        f += "[0:v][p]overlay=%s:eof_action=pass,format=yuv420p[v]" % pos
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + ent + ["-filter_complex", f, "-map", "[v]", "-t", str(d)] + COD + [sal], check=True)
    return d

def escena_imagen(e, sal):
    d = float(e.get("dura", 2.5))
    f = "format=yuv420p"
    if e.get("ultima", True):
        f += ",fade=t=out:st=%s:d=0.3" % (d - 0.3)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", "30", "-i", e["imagen"], "-vf", f, "-t", str(d)] + COD + [sal], check=True)
    return d

def main(receta, salida):
    r = json.load(open(receta))
    tmp = tempfile.mkdtemp()
    partes, total = [], 0
    for i, e in enumerate(r["escenas"]):
        p = os.path.join(tmp, "e%02d.mp4" % i)
        total += escena_video(e, p) if "video" in e else escena_imagen(e, p)
        partes.append(p)
    lista = os.path.join(tmp, "lista.txt")
    open(lista, "w").write("".join("file '%s'\n" % p for p in partes))
    t = salida[:-4] + ".tmp.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", "-movflags", "+faststart", t], check=True)
    os.replace(t, salida)
    # todo dentro de la zona segura (los móviles altos recortan los lados): ver encoge-reel.sh
    subprocess.run(["bash", os.path.join(os.path.dirname(os.path.abspath(__file__)), "encoge-reel.sh"), salida, salida], check=True)
    print("%s: %.2f s" % (salida, total))

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
