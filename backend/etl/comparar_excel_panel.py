import unicodedata
import pandas as pd

def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.strip().upper()

MAPA = {"ARROZ CASCARA": "ARROZ", "CEBOLLA": "CEBOLLA",
        "MAIZ CHCLO": "CHOCLO", "MAIZ CHOCLO": "CHOCLO", "PAPA BLANCA": "PAPA"}

x = pd.read_excel("../data/raw/PRECIO_CHACRA.xlsx").iloc[:, :7]
x.columns = ["region", "provincia", "producto", "dia", "mes", "anio", "precio"]
x["producto"] = x.producto.map(norm).map(MAPA)
x["precio"] = pd.to_numeric(x.precio, errors="coerce")
x = x[(x.dia == 17) & (x.mes.astype(str).str.lower() == "octubre")
      & (x.anio == 2025) & x.producto.notna()]
x["departamento"] = x.region.map(norm)
excel = x.groupby(["departamento", "producto"]).precio.mean().rename("excel").reset_index()

p = pd.read_csv("../data/processed/panel_todos.csv")
p = p[(p.fecha_consulta == "2025-10-17") & (p.precio_chacra > 0)]
p["departamento"] = p.departamento.map(norm)
panel = p[["departamento", "producto", "precio_chacra"]].rename(columns={"precio_chacra": "panel"})

m = panel.merge(excel, on=["departamento", "producto"], how="outer")
m["dif"] = (m.panel - m.excel).round(3)
print(m.sort_values(["producto", "departamento"]).to_string(index=False))
print()
print("Solo en panel:", m.excel.isna().sum(), "| Solo en Excel:", m.panel.isna().sum())
print("Coinciden (dif=0):", (m["dif"] == 0).sum(), "de", m["dif"].notna().sum())