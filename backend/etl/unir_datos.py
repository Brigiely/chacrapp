import json
import unicodedata
import pandas as pd

RAW = "../data/raw"
PROC = "../data/processed"

def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.strip().upper()

CORRECCIONES = {"ANDAHUAYLAS": "APURIMAC"}

PRODUCTOS = {"ARROZ CASCARA": "ARROZ", "CEBOLLA": "CEBOLLA",
             "MAIZ CHCLO": "CHOCLO", "MAIZ CHOCLO": "CHOCLO", "PAPA BLANCA": "PAPA"}
MESES = {"ENERO": 1, "FEBRERO": 2, "MARZO": 3, "ABRIL": 4, "MAYO": 5, "JUNIO": 6,
         "JULIO": 7, "AGOSTO": 8, "SETIEMBRE": 9, "SEPTIEMBRE": 9,
         "OCTUBRE": 10, "NOVIEMBRE": 11, "DICIEMBRE": 12}
CLAVE = ["mes", "departamento", "producto"]

# 1. Excel de chacra -> promedio mensual por departamento y producto
x = pd.read_excel(f"{RAW}/PRECIO_CHACRA.xlsx").iloc[:, :7]
x.columns = ["region", "provincia", "producto", "dia", "mes_txt", "anio", "precio"]
x["producto"] = x.producto.map(norm).map(PRODUCTOS)
x["mes_n"] = x.mes_txt.map(norm).map(MESES)
x["anio"] = pd.to_numeric(x.anio, errors="coerce")
x["precio"] = pd.to_numeric(x.precio, errors="coerce")
x = x.dropna(subset=["producto", "mes_n", "anio", "precio"])
x = x[x.precio > 0]
x["mes"] = x.anio.astype(int).astype(str) + "-" + x.mes_n.astype(int).astype(str).str.zfill(2)
x["departamento"] = x.region.map(norm).replace(CORRECCIONES)
excel = (x.groupby(CLAVE, as_index=False).precio.mean()
          .rename(columns={"precio": "chacra_excel"}))

# 2. Panel: mensual + relleno + serie semanal
p = pd.concat([pd.read_csv(f"{PROC}/{n}.csv")
               for n in ("panel_mensual", "panel_relleno", "panel_serie")], ignore_index=True)
p["departamento"] = p.departamento.map(norm)
p = p.drop_duplicates(["fecha_consulta", "departamento", "producto"])
for c in ["precio_chacra", "precio_mayorista", "precio_minorista"]:
    p[c] = p[c].where(p[c] > 0)          # 0 = sin dato
p["mes"] = p.fecha_consulta.str[:7]

pm = (p.groupby(CLAVE, as_index=False)
        .agg(chacra_panel=("precio_chacra", "mean"),
             mayorista=("precio_mayorista", "mean"),
             minorista=("precio_minorista", "mean")))

# 3. Unir: chacra del Excel si existe, si no la del panel
m = excel.merge(pm, on=CLAVE, how="outer")
m["chacra"] = m.chacra_excel.fillna(m.chacra_panel)
m["fuente_chacra"] = None
m.loc[m.chacra_panel.notna(), "fuente_chacra"] = "panel"
m.loc[m.chacra_excel.notna(), "fuente_chacra"] = "excel"
m["pct_vs_mayorista"] = (m.chacra / m.mayorista).round(3)
m["pct_vs_minorista"] = (m.chacra / m.minorista).round(3)
m = m[["mes", "departamento", "producto", "chacra", "mayorista", "minorista",
       "pct_vs_mayorista", "pct_vs_minorista", "fuente_chacra"]]
m = m.dropna(subset=["chacra", "mayorista", "minorista"], how="all")
m = m.sort_values(CLAVE).round(4)

# 4. Serie semanal reciente (oct 2025 en adelante)
s = p[p.fecha_consulta >= "2025-10-24"].rename(columns={
    "fecha_consulta": "fecha", "precio_chacra": "chacra",
    "precio_mayorista": "mayorista", "precio_minorista": "minorista"})
s = s[["fecha", "departamento", "producto", "chacra", "mayorista", "minorista"]]
s = s.sort_values(["producto", "departamento", "fecha"]).round(4)

# 5. Guardar
m.to_csv(f"{PROC}/precios_mensual.csv", index=False)
m.to_json(f"{PROC}/precios_mensual.json", orient="records", force_ascii=False)
s.to_json(f"{PROC}/precios_semanal.json", orient="records", force_ascii=False)
meta = {"fuente": "SISAP-SIEA, MIDAGRI",
        "ultimo_dato": p.fecha_consulta.max(),
        "primer_mes": m.mes.min(),
        "minorista_desde": m[m.minorista.notna()].mes.min()}
with open(f"{PROC}/meta.json", "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

# 6. Revisión
print(meta)
print(m.groupby("producto").agg(
    meses=("mes", "nunique"), deptos=("departamento", "nunique"),
    con_chacra=("chacra", "count"), con_mayorista=("mayorista", "count"),
    con_minorista=("minorista", "count")).to_string())
print("Departamentos del Excel que no están en el panel:",
      sorted(set(excel.departamento) - set(p.departamento)))
print("Semanal:", len(s), "filas | Mensual:", len(m), "filas")
