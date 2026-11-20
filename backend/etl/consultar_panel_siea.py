"""
Consulta el panel público de Power BI del SIEA ("Comportamiento de precios semanales")
y guarda los precios de chacra, mayorista y minorista por departamento.

Qué hace:
  - Envía la misma consulta que el panel (reconstruida a partir del Payload capturado),
    cambiando solo el producto y la fecha.
  - Guarda cada respuesta cruda en disco; si ya existe, NO vuelve a pedirla.
  - Espera unos segundos entre consultas y se detiene si el servidor se queja.
  - Decodifica las respuestas (con decodificar_powerbi.py) y las junta en un CSV.

Antes de usarlo:
  1. pip install requests pandas
  2. Crea el archivo config_local.json (NO lo subas a GitHub) con:
         {"resource_key": "COPIA_AQUI_EL_VALOR_DE_X-Powerbi-Resourcekey"}
     El valor está en DevTools > Network > la solicitud querydata > Headers > Request headers.
  3. Deja este archivo junto a decodificar_powerbi.py.

Ejemplos:
  python consultar_panel_siea.py --productos PAPA --fechas 2026-07-03
  python consultar_panel_siea.py --productos PAPA,CEBOLLA --desde 2026-08-07 --hasta 2026-08-28

Nota: el filtro de fecha del panel usa "mayor o igual" (ComparisonKind 2). Todavía no está
confirmado si los valores corresponden a esa semana exacta o a un acumulado desde esa fecha.
Compara con el panel antes de usar los datos en la app.

Aviso: es una interfaz no documentada de Power BI. Puede cambiar sin aviso. Úsalo con pocas
consultas y cita la fuente (SISAP - SIEA, MIDAGRI).
"""
import argparse
import json
import os
import sys
import time
import uuid
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import requests

from decodificar_powerbi import decodificar

# --- Identificadores del panel público (salen del Payload capturado) ---
URL = "https://wabi-paas-1-scus-api.analysis.windows.net/public/reports/querydata?synchronous=true"
MODEL_ID = 2545856
DATASET_ID = "459daa31-a4d2-45fa-bd6b-6e219a0b2d0b"
REPORT_ID = "e1c06044-8cd9-44f0-b382-567649c90f0c"
VISUAL_ID = "479db73b3deaaba0ca15"

MEDIDAS = [
    "PRECIO_CHACRA", "PRECIO_MAYORISTA", "DIFERENCIA CHACRA MAYORISTA", "% VAR CHACRA MAYORISTA",
    "PRECIO_MAYORISTA2", "PRECIO_MINORISTA", "DIFERENCIA MAYORISTA MINORISTA",
    "% VAR MAYORISTA MINORISTA", "PRECIO_CHACRA 2", "PRECIO_MINORISTA 2", "DIFERENCIA CHACRA MINORISTA",
]


def _col(origen, propiedad):
    return {"Column": {"Expression": {"SourceRef": {"Source": origen}}, "Property": propiedad}}


def _med(propiedad):
    return {"Measure": {"Expression": {"SourceRef": {"Source": "m"}}, "Property": propiedad}}


def construir_payload(producto, fecha_iso):
    """Reconstruye la consulta del panel para un producto y una fecha (AAAA-MM-DD)."""
    select = [
        dict(_col("b", "NOMBDEP"), Name="BD_UBIGEO.NOMBDEP"),
        dict(_col("b1", "GENERO"), Name="BD_GENERO_CULTIVO.GENERO"),
    ] + [dict(_med(p), Name=f"MEDIDAS.{p}") for p in MEDIDAS]

    donde = [
        {"Condition": {"Not": {"Expression": {"Comparison": {
            "ComparisonKind": 0, "Left": _med("PRECIO_MAYORISTA"),
            "Right": {"Literal": {"Value": "null"}}}}}},
         "Target": [_col("b", "NOMBDEP"), _col("b1", "GENERO")]},
        {"Condition": {"In": {"Expressions": [_col("b1", "GENERO")],
                              "Values": [[{"Literal": {"Value": f"'{producto}'"}}]]}}},
        {"Condition": {"Comparison": {
            "ComparisonKind": 2, "Left": _col("f", "FECHA"),
            "Right": {"Literal": {"Value": f"datetime'{fecha_iso}T00:00:00'"}}}}},
        # Tope superior: misma fecha (<=). Con >= y <= juntos el panel devuelve solo esa semana
        {"Condition": {"Comparison": {
            "ComparisonKind": 4, "Left": _col("f", "FECHA"),
            "Right": {"Literal": {"Value": f"datetime'{fecha_iso}T00:00:00'"}}}}},
    ]
    consulta = {
        "Version": 2,
        "From": [
            {"Name": "b", "Entity": "BD_UBIGEO", "Type": 0},
            {"Name": "b1", "Entity": "BD_GENERO_CULTIVO", "Type": 0},
            {"Name": "m", "Entity": "MEDIDAS", "Type": 0},
            {"Name": "f", "Entity": "FECHA PRECIO", "Type": 0},
        ],
        "Select": select,
        "Where": donde,
        "OrderBy": [{"Direction": 2, "Expression": _med("% VAR CHACRA MAYORISTA")}],
    }
    comando = {"SemanticQueryDataShapeCommand": {
        "Query": consulta,
        "Binding": {"Primary": {"Groupings": [{"Projections": list(range(13))}]},
                    "DataReduction": {"DataVolume": 3, "Primary": {"Window": {"Count": 500}}},
                    "Version": 1},
        "ExecutionMetricsKind": 1,
    }}
    return {
        "version": "1.0.0",
        "queries": [{
            "Query": {"Commands": [comando]},
            "CacheKey": json.dumps({"Commands": [comando]}, separators=(",", ":"), ensure_ascii=False),
            "QueryId": "",
            "ApplicationContext": {"DatasetId": DATASET_ID,
                                   "Sources": [{"ReportId": REPORT_ID, "VisualId": VISUAL_ID}]},
        }],
        "cancelQueries": [],
        "modelId": MODEL_ID,
    }


def leer_clave():
    clave = os.environ.get("POWERBI_RESOURCE_KEY")
    if not clave and Path("config_local.json").exists():
        clave = json.loads(Path("config_local.json").read_text(encoding="utf-8")).get("resource_key")
    if not clave:
        sys.exit("Falta la clave del panel. Crea config_local.json con {\"resource_key\": \"...\"}")
    return clave


def pedir(producto, fecha_iso, clave):
    cabeceras = {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json;charset=UTF-8",
        "Origin": "https://app.powerbi.com",
        "Referer": "https://app.powerbi.com/",
        "X-PowerBI-ResourceKey": clave,
        "ActivityId": str(uuid.uuid4()),
        "RequestId": str(uuid.uuid4()),
        "User-Agent": "AgroPrecios-proyecto-academico/0.1",
    }
    r = requests.post(URL, headers=cabeceras, json=construir_payload(producto, fecha_iso), timeout=60)
    if r.status_code in (401, 403):
        sys.exit(f"El servidor rechazó la clave (HTTP {r.status_code}). Revisa config_local.json.")
    if r.status_code == 429 or r.status_code >= 500:
        sys.exit(f"El servidor pide parar (HTTP {r.status_code}). Espera un rato y vuelve a intentar.")
    r.raise_for_status()
    return r.text


def viernes(desde, hasta):
    d = date.fromisoformat(desde)
    fin = date.fromisoformat(hasta)
    while d <= fin:
        if d.weekday() == 4:   # 4 = viernes (el panel se actualiza los viernes)
            yield d.isoformat()
        d += timedelta(days=1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--productos", required=True, help="Nombres tal como aparecen en el filtro Género, separados por comas")
    ap.add_argument("--fechas", help="Fechas AAAA-MM-DD separadas por comas")
    ap.add_argument("--desde"); ap.add_argument("--hasta")
    ap.add_argument("--pausa", type=float, default=4.0, help="Segundos entre consultas (por defecto 4)")
    ap.add_argument("--max-consultas", type=int, default=30, help="Tope de consultas nuevas por ejecución")
    ap.add_argument("--crudo", default="data/raw/powerbi", help="Carpeta para las respuestas crudas")
    ap.add_argument("--salida", default="data/processed/precios_panel_siea.csv")
    a = ap.parse_args()

    if a.fechas:
        fechas = [f.strip() for f in a.fechas.split(",")]
    elif a.desde and a.hasta:
        fechas = list(viernes(a.desde, a.hasta))
    else:
        sys.exit("Indica --fechas o --desde y --hasta")
    productos = [p.strip().upper() for p in a.productos.split(",")]

    carpeta = Path(a.crudo); carpeta.mkdir(parents=True, exist_ok=True)
    clave, nuevas, tablas = None, 0, []

    for producto in productos:
        for fecha in fechas:
            archivo = carpeta / f"{producto}_{fecha}.json"
            if not archivo.exists():
                if nuevas >= a.max_consultas:
                    print(f"Se alcanzó el tope de {a.max_consultas} consultas nuevas; el resto queda para otra ejecución.")
                    break
                clave = clave or leer_clave()
                archivo.write_text(pedir(producto, fecha, clave), encoding="utf-8")
                nuevas += 1
                print(f"Consultado: {producto} {fecha}")
                time.sleep(a.pausa)
            try:
                t = decodificar(str(archivo))
            except (KeyError, IndexError, ValueError):
                print(f"Sin datos para {producto} {fecha} (respuesta vacía o con otro formato)")
                continue
            t.insert(0, "fecha_consulta", fecha)
            tablas.append(t)

    if not tablas:
        sys.exit("No se obtuvo ninguna tabla.")
    df = pd.concat(tablas, ignore_index=True)
    df = df.rename(columns={"NOMBDEP": "departamento", "GENERO": "producto",
                            "PRECIO_CHACRA": "precio_chacra", "PRECIO_MAYORISTA": "precio_mayorista",
                            "PRECIO_MINORISTA": "precio_minorista"})
    df["precio_chacra"] = df["precio_chacra"].where(df["precio_chacra"] > 0)   # 0 en el panel = sin dato
    df = df[["fecha_consulta", "departamento", "producto", "precio_chacra", "precio_mayorista", "precio_minorista"]]
    Path(a.salida).parent.mkdir(parents=True, exist_ok=True)
    df.round(4).to_csv(a.salida, index=False, encoding="utf-8-sig")
    print(f"{len(df)} filas guardadas en {a.salida}")


if __name__ == "__main__":
    main()
