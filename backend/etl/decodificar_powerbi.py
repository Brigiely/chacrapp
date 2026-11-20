"""
Decodifica la respuesta 'querydata' de un panel público de Power BI a un CSV.

Cómo usarlo:
  1. En DevTools > Network, abre la solicitud querydata (tipo xhr) > pestaña Response.
  2. Clic derecho > Copy response, y pégalo en un archivo, por ejemplo: respuesta_papa.json
  3. Con el entorno activado:  python decodificar_powerbi.py respuesta_papa.json salida.csv
"""
import json
import sys

import pandas as pd


def decodificar(ruta_json):
    with open(ruta_json, encoding="utf-8") as f:
        datos = json.load(f)

    data = datos["results"][0]["result"]["data"]
    select = data["descriptor"]["Select"]
    # Nombre legible de cada columna (G0, G1, M0, ...) -> "ENTIDAD.PROPIEDAD" -> "PROPIEDAD"
    nombres = {s["Value"]: s["Name"].split(".")[-1] for s in select}

    ds = data["dsr"]["DS"][0]
    diccionarios = ds.get("ValueDicts", {})
    filas = ds["PH"][0]["DM0"]

    esquema = filas[0]["S"]            # solo la primera fila trae el esquema
    n = len(esquema)

    resultado, previa = [], None
    for fila in filas:
        valores = iter(fila["C"])
        repetidas = fila.get("R", 0)   # bit i activo: la columna i repite la fila anterior
        nulas = fila.get("Ø", 0)       # bit i activo: la columna i es nula
        actual = []
        for i in range(n):
            if nulas >> i & 1:
                actual.append(None)
            elif repetidas >> i & 1:
                actual.append(previa[i])
            else:
                actual.append(next(valores))
        if next(valores, "FIN") != "FIN":
            raise ValueError("Sobraron valores en una fila: el formato no coincide con lo esperado.")
        resultado.append(actual)
        previa = actual

    # Se arma columna por columna para que cada una conserve su propio tipo
    columnas = {}
    for i, col in enumerate(esquema):
        nombre = nombres.get(col["N"], col["N"])
        serie = pd.Series([fila[i] for fila in resultado], dtype="object")
        if "DN" in col:   # texto codificado con diccionario: índice -> valor
            lista = diccionarios[col["DN"]]
            serie = serie.map(lambda k: lista[int(k)] if k is not None else None)
        elif col.get("T") in (3, 4):   # números: a veces llegan como texto
            serie = pd.to_numeric(serie, errors="coerce")
        columnas[nombre] = serie
    df = pd.DataFrame(columnas)
    return df


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit("Uso: python decodificar_powerbi.py respuesta.json salida.csv")
    tabla = decodificar(sys.argv[1])
    tabla.to_csv(sys.argv[2], index=False, encoding="utf-8-sig")
    print(f"{len(tabla)} filas y {len(tabla.columns)} columnas guardadas en {sys.argv[2]}")
    print(tabla.head().to_string(index=False))
