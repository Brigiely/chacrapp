import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import type { Layer, PathOptions } from "leaflet";
import type { Feature, FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

type Registro = {
  mes: string;
  departamento: string;
  producto: string;
  chacra: number | null;
  mayorista: number | null;
  minorista: number | null;
  pct_vs_mayorista: number | null;
  pct_vs_minorista: number | null;
  fuente_chacra: string | null;
};

type Meta = { fuente: string; ultimo_dato: string; primer_mes: string; minorista_desde: string };

const PRODUCTOS = ["PAPA", "CEBOLLA", "ARROZ", "CHOCLO"];
const NOMBRES: Record<string, string> = { PAPA: "Papa", CEBOLLA: "Cebolla", ARROZ: "Arroz cáscara", CHOCLO: "Maíz choclo" };
const COLORES = ["#e5f0d8", "#bcd99a", "#8dbd62", "#5a9a3a", "#2f6f26"]; // de menor a mayor precio
const SIN_DATO = "#d9d9d9";

const fmt = (n: number | null | undefined) => (n == null ? "sin dato" : `S/ ${n.toFixed(2)}`);
const nombreMes = (m: string) =>
  new Date(`${m}-15T12:00:00`).toLocaleDateString("es-PE", { month: "long", year: "numeric" });

export default function MapaChacra() {
  const [datos, setDatos] = useState<Registro[]>([]);
  const [geo, setGeo] = useState<FeatureCollection | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [producto, setProducto] = useState("PAPA");
  const [mes, setMes] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/precios_mensual.json").then((r) => r.json()),
      fetch("/data/departamentos.geojson").then((r) => r.json()),
      fetch("/data/meta.json").then((r) => r.json()),
    ])
      .then(([d, g, m]) => {
        setDatos(d);
        setGeo(g);
        setMeta(m);
      })
      .catch(() => setError("No se pudieron cargar los datos. Revisa la carpeta public/data."));
  }, []);

  // Meses que tienen al menos un precio en chacra para el producto elegido
  const meses = useMemo(
    () =>
      [...new Set(datos.filter((r) => r.producto === producto && r.chacra != null).map((r) => r.mes))].sort(),
    [datos, producto]
  );

  // Si el mes elegido no existe para este producto, usa el último disponible
  useEffect(() => {
    if (meses.length && !meses.includes(mes)) setMes(meses[meses.length - 1]);
  }, [meses, mes]);

  const porDepto = useMemo(() => {
    const mapa = new Map<string, Registro>();
    datos.filter((r) => r.producto === producto && r.mes === mes).forEach((r) => mapa.set(r.departamento, r));
    return mapa;
  }, [datos, producto, mes]);

  // Cortes de color en 5 tramos iguales entre el mínimo y el máximo del mes
  const { min, max } = useMemo(() => {
    const v = [...porDepto.values()].map((r) => r.chacra).filter((x): x is number => x != null);
    return { min: Math.min(...v), max: Math.max(...v) };
  }, [porDepto]);

  const color = (precio: number | null | undefined) => {
    if (precio == null || !isFinite(min)) return SIN_DATO;
    const t = max === min ? 0 : (precio - min) / (max - min);
    return COLORES[Math.min(COLORES.length - 1, Math.floor(t * COLORES.length))];
  };

  const estilo = (f?: Feature): PathOptions => ({
    fillColor: color(porDepto.get(f?.properties?.NOMBDEP)?.chacra),
    fillOpacity: 0.9,
    color: "#ffffff",
    weight: 1,
  });

  const alCrearCapa = (f: Feature, capa: Layer) => {
    const nombre: string = f.properties?.NOMBDEP;
    const r = porDepto.get(nombre);
    const titulo = nombre.charAt(0) + nombre.slice(1).toLowerCase();
    const html = r
      ? `<strong>${titulo}</strong><br/>Chacra: ${fmt(r.chacra)}<br/>Mayorista: ${fmt(r.mayorista)}<br/>Minorista: ${fmt(r.minorista)}` +
        (r.pct_vs_minorista != null
          ? `<br/>Al agricultor le llega el ${Math.round(r.pct_vs_minorista * 100)} % del precio minorista`
          : "")
      : `<strong>${titulo}</strong><br/>Sin dato en la fuente`;
    capa.bindTooltip(html, { sticky: true });
  };

  if (error) return <p role="alert">{error}</p>;
  if (!geo || !mes) return <p>Cargando mapa…</p>;

  const pasos = COLORES.map((c, i) => ({
    c,
    desde: min + ((max - min) * i) / COLORES.length,
  }));

  return (
    <section style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <label>
          Producto{" "}
          <select value={producto} onChange={(e) => setProducto(e.target.value)}>
            {PRODUCTOS.map((p) => (
              <option key={p} value={p}>
                {NOMBRES[p]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mes{" "}
          <select value={mes} onChange={(e) => setMes(e.target.value)}>
            {[...meses].reverse().map((m) => (
              <option key={m} value={m}>
                {nombreMes(m)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ position: "relative" }}>
        <MapContainer
          center={[-9.2, -75]}
          zoom={5}
          style={{ height: 520, width: "100%", borderRadius: 8 }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* key: fuerza a redibujar los polígonos cuando cambian producto o mes */}
          <GeoJSON key={`${producto}-${mes}`} data={geo} style={estilo} onEachFeature={alCrearCapa} />
        </MapContainer>

        <div
          style={{
            position: "absolute", right: 12, bottom: 24, zIndex: 1000, background: "#fff",
            padding: "8px 10px", borderRadius: 6, fontSize: 12, boxShadow: "0 1px 4px rgba(0,0,0,.25)",
          }}
        >
          <div style={{ marginBottom: 4 }}>Precio en chacra (S/ por kg)</div>
          {pasos.map((p) => (
            <div key={p.c} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 14, background: p.c, display: "inline-block" }} />
              desde {p.desde.toFixed(2)}
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 14, height: 14, background: SIN_DATO, display: "inline-block" }} />
            sin dato en la fuente
          </div>
        </div>
      </div>

      {meta && (
        <small>
          Fuente: {meta.fuente}. Datos hasta el {meta.ultimo_dato}. Precio de referencia, no garantizado.
        </small>
      )}
    </section>
  );
}
