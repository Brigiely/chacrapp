import { useMemo, useState } from "react"

type Page = "inicio" | "precios" | "mapa" | "ofertas" | "acerca"
type IconName = "home" | "chart" | "map" | "tag" | "info" | "leaf" | "calendar" | "chevron" | "arrowUp" | "arrowDown" | "search" | "phone" | "pin" | "weight" | "sprout" | "close" | "check"

const icons: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v11h14V10M9 21v-7h6v7" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9m6 10V5m6 14v-7m5 7H2" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
      <path d="M9 3v15m6-12v15" />
    </>
  ),
  tag: (
    <>
      <path d="M20 13 13 20 4 11V4h7Z" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-9h.01" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C10 4 5 8 5 15c0 2 1 4 3 5 0-7 5-11 12-16Z" />
      <path d="M4 21c3-5 7-8 12-10" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  arrowUp: (
    <>
      <path d="m6 12 6-6 6 6" />
      <path d="M12 18V6" />
    </>
  ),
  arrowDown: (
    <>
      <path d="m6 12 6 6 6-6" />
      <path d="M12 6v12" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  phone: (
    <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-1-1.3 2.2a15 15 0 0 1-8.9-8.9L8 8Z" />
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  weight: (
    <>
      <path d="M5 8h14l2 13H3Z" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 13c-5 0-8-3-8-7 5 0 8 2 8 7Zm0 3c5 0 8-3 8-7-5 0-8 2-8 7Z" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4L19 6" />,
}

function Icon({ name, size = 20 }: { name: IconName size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}

const navigation: { id: Page label: string mobile: string icon: IconName }[] = [
  { id: "inicio", label: "Inicio", mobile: "Inicio", icon: "home" },
  { id: "precios", label: "Precios", mobile: "Precios", icon: "chart" },
  { id: "mapa", label: "Mapa", mobile: "Mapa", icon: "map" },
  { id: "ofertas", label: "Ofertas", mobile: "Ofertas", icon: "tag" },
  {
    id: "acerca",
    label: "Acerca del proyecto",
    mobile: "Acerca",
    icon: "info",
  },
]

const products = ["Papa amarilla", "Palta Hass", "Quinua blanca", "Maíz choclo"]
const markets = [
  "Mercado Mayorista de Lima",
  "Mercado Moshoqueque",
  "Mercado San Camilo",
]

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange?: (value: string) => void
}) {
  return (
    <label className="select-filter">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <section className={`panel ${className}`}>{children}</section>
}

function PanelHeading({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="panel-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

function LineChart({ multi = false }: { multi?: boolean }) {
  const [active, setActive] = useState(8)
  const main = [184, 171, 177, 151, 145, 138, 128, 111, 102, 96, 81, 88]
  const second = [202, 195, 186, 182, 167, 159, 147, 151, 139, 125, 116, 108]
  const third = [157, 154, 149, 143, 136, 130, 124, 122, 119, 113, 107, 103]
  const toPoints = (values: number[]) =>
    values.map((y, i) => `${45 + i * 49},${y}`).join(" ")
  const value = (5.6 - ((main[active] - 81) / 103) * 2.5).toFixed(2)
  return (
    <div className="chart-wrap" onMouseLeave={() => setActive(8)}>
      {multi && (
        <div className="chart-legend">
          <span className="legend-papa">Papa</span>
          <span className="legend-palta">Palta</span>
          <span className="legend-quinua">Quinua</span>
        </div>
      )}
      <svg
        className="line-chart"
        viewBox="0 0 620 230"
        role="img"
        aria-label="Gráfico de evolución de precios"
      >
        {[45, 85, 125, 165, 205].map((y) => (
          <line key={y} x1="44" x2="592" y1={y} y2={y} className="gridline" />
        ))}
        {[45, 143, 241, 339, 437, 584].map((x, i) => (
          <text
            key={x}
            x={x}
            y="224"
            textAnchor="middle"
            className="axis-label"
          >
            {["01 Mar", "05 Mar", "10 Mar", "15 Mar", "20 Mar", "25 Mar"][i]}
          </text>
        ))}
        {[45, 85, 125, 165, 205].map((y, i) => (
          <text
            key={y}
            x="35"
            y={y + 3}
            textAnchor="end"
            className="axis-label"
          >
            {["S/ 6", "S/ 5", "S/ 4", "S/ 3", "S/ 2"][i]}
          </text>
        ))}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2E7D32" stopOpacity=".22" />
            <stop offset="1" stopColor="#2E7D32" stopOpacity="0" />
          </linearGradient>
        </defs>
        {!multi && (
          <path
            d={`M${toPoints(main)} L584 205 L45 205Z`}
            fill="url(#chartFill)"
          />
        )}
        {multi && (
          <>
            <polyline points={toPoints(second)} className="line secondary" />
            <polyline points={toPoints(third)} className="line tertiary" />
          </>
        )}
        <polyline points={toPoints(main)} className="line primary" />
        {main.map((y, i) => (
          <g
            key={i}
            className="chart-hit"
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <rect
              x={26 + i * 49}
              y="30"
              width="38"
              height="178"
              fill="transparent"
            />
            {active === i && (
              <>
                <line
                  x1={45 + i * 49}
                  x2={45 + i * 49}
                  y1="40"
                  y2="205"
                  className="focus-line"
                />
                <circle cx={45 + i * 49} cy={y} r="6" className="focus-dot" />
              </>
            )}
          </g>
        ))}
      </svg>
      <div
        className="chart-tooltip"
        style={{
          left: `${Math.min(82, 7 + active * 7.8)}%`,
          top: `${Math.max(8, main[active] / 2.55 - 16)}px`,
        }}
      >
        <small>20 MAR 2025</small>
        <strong>
          S/ {value} <em>por kg</em>
        </strong>
        <span>▲ 4.2% vs. día anterior</span>
      </div>
    </div>
  )
}

function BarChart() {
  const bars = [
    { name: "Lima", value: 4.2, h: 73 },
    { name: "Arequipa", value: 3.8, h: 64 },
    { name: "Cusco", value: 3.4, h: 55 },
    { name: "Chiclayo", value: 3.1, h: 48 },
    { name: "Huancayo", value: 2.9, h: 43 },
  ]
  return (
    <div className="bar-chart">
      {bars.map((bar, index) => (
        <div className="bar-item" key={bar.name}>
          <span className="bar-price">S/ {bar.value}</span>
          <div
            className={`bar ${index === 0 ? "highlight" : ""}`}
            style={{ height: `${bar.h}%` }}
          />
          <small>{bar.name}</small>
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [product, setProduct] = useState(products[0])
  const metrics = [
    {
      label: "Precio hoy",
      value: "S/ 4.20",
      note: "por kilogramo",
      icon: "leaf" as IconName,
    },
    {
      label: "Variación semanal",
      value: "+8.4%",
      note: "Subió S/ 0.33",
      icon: "arrowUp" as IconName,
      positive: true,
    },
    {
      label: "Mínimo del mes",
      value: "S/ 3.42",
      note: "08 de marzo",
      icon: "arrowDown" as IconName,
    },
    {
      label: "Máximo del mes",
      value: "S/ 4.36",
      note: "22 de marzo",
      icon: "arrowUp" as IconName,
    },
  ]
  return (
    <>
      <header className="page-header">
        <div>
          <span className="kicker">RESUMEN DEL MERCADO</span>
          <h1>Buenos días, Carlos</h1>
          <p>Precios agrícolas al alcance del productor.</p>
        </div>
        <div className="updated">
          <span className="live-dot" /> Datos actualizados hoy, 8:30 a.m.
        </div>
      </header>
      <Panel className="filters-panel">
        <SelectFilter
          label="Producto"
          value={product}
          options={products}
          onChange={setProduct}
        />
        <SelectFilter label="Mercado" value={markets[0]} options={markets} />
        <label className="select-filter date-filter">
          <span>Rango de fechas</span>
          <div>
            <Icon name="calendar" size={17} /> 01 mar — 25 mar 2025
          </div>
        </label>
        <button className="primary-button">Aplicar filtros</button>
      </Panel>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <article className="metric-card" key={metric.label}>
            <div className={`metric-icon metric-${index}`}>
              <Icon name={metric.icon} size={19} />
            </div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small className={metric.positive ? "positive" : ""}>
              {metric.positive && "↑ "}
              {metric.note}
            </small>
          </article>
        ))}
      </div>
      <div className="dashboard-grid">
        <Panel className="line-panel">
          <PanelHeading
            title={`Evolución del precio — ${product}`}
            subtitle="Precio promedio diario por kilogramo"
            action={
              <div className="micro-tabs">
                <button className="active">Diario</button>
                <button>Semanal</button>
              </div>
            }
          />
          <LineChart />
        </Panel>
        <Panel className="bar-panel">
          <PanelHeading
            title="Precio por mercado"
            subtitle="Comparación de hoy"
          />
          <BarChart />
        </Panel>
        <Panel className="share-panel">
          <div className="share-copy">
            <span className="orange-label">CADENA DE VALOR</span>
            <h2>
              Precio en chacra <br />
              vs. mayorista
            </h2>
            <p>Descubre cuánto del precio final regresa al campo.</p>
          </div>
          <div className="donut" aria-label="El productor recibe 58 por ciento">
            <div>
              <strong>58%</strong>
              <span>
                recibe el
                <br />
                agricultor
              </span>
            </div>
          </div>
          <div className="price-bridge">
            <div>
              <span>En chacra</span>
              <strong>S/ 2.45</strong>
            </div>
            <i />
            <Icon name="chevron" />
            <i />
            <div>
              <span>Mayorista</span>
              <strong>S/ 4.20</strong>
            </div>
          </div>
        </Panel>
      </div>
    </>
  )
}

const latestPrices = [
  ["Papa amarilla", "Lima", "S/ 4.20", "+8.4%", "25 mar, 08:30"],
  ["Palta Hass", "Arequipa", "S/ 6.80", "+3.1%", "25 mar, 08:22"],
  ["Quinua blanca", "Cusco", "S/ 7.35", "-1.2%", "25 mar, 08:10"],
  ["Maíz choclo", "Huancayo", "S/ 3.10", "+5.7%", "25 mar, 07:54"],
  ["Papa blanca", "Chiclayo", "S/ 2.85", "-0.8%", "25 mar, 07:40"],
]

function Heatmap() {
  const values = [
    [2, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4],
    [4, 4, 3, 3, 2, 2, 2, 3, 4, 4, 5, 5],
    [5, 5, 4, 4, 3, 2, 2, 3, 3, 4, 5, 5],
    [3, 3, 2, 2, 2, 3, 4, 5, 5, 4, 3, 3],
  ]
  return (
    <div className="heatmap">
      <div className="heat-months">
        {[
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Set",
          "Oct",
          "Nov",
          "Dic",
        ].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      {values.map((row, i) => (
        <div className="heat-row" key={products[i]}>
          <strong>{products[i].split(" ")[0]}</strong>
          <div>
            {row.map((value, j) => (
              <span
                key={j}
                className={`heat-${value}`}
                title={`${products[i]} · ${value + 2}.20 S/ kg`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function PricesPage() {
  const [query, setQuery] = useState("")
  const rows = latestPrices.filter(
    (row) =>
      row[0].toLowerCase().includes(query.toLowerCase()) ||
      row[1].toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <header className="page-header">
        <div>
          <span className="kicker">ANÁLISIS DE PRECIOS</span>
          <h1>Entiende el mejor momento para vender</h1>
          <p>Compara productos, temporadas y mercados en un solo lugar.</p>
        </div>
      </header>
      <div className="analysis-grid">
        <Panel className="heat-panel">
          <PanelHeading
            title="Estacionalidad de precios"
            subtitle="Promedio mensual por producto — últimos 12 meses"
            action={
              <div className="heat-legend">
                <span>Bajo</span>
                <i />
                <i />
                <i />
                <i />
                <i />
                <span>Alto</span>
              </div>
            }
          />
          <Heatmap />
        </Panel>
        <Panel className="compare-panel">
          <PanelHeading
            title="Comparar productos"
            subtitle="Evolución en S/ por kg"
            action={
              <button className="outline-button">+ Agregar producto</button>
            }
          />
          <LineChart multi />
        </Panel>
        <Panel className="table-panel">
          <PanelHeading
            title="Últimos precios reportados"
            subtitle="Información de mercados mayoristas"
            action={
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar producto o mercado"
                />
              </label>
            }
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {[
                    "Producto",
                    "Mercado",
                    "Precio / kg",
                    "Variación",
                    "Actualización",
                  ].map((h) => (
                    <th key={h}>{h} ↕</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.join("-")}>
                    <td>
                      <span className="crop-dot" />
                      {row[0]}
                    </td>
                    <td>{row[1]}</td>
                    <td>
                      <strong>{row[2]}</strong>
                    </td>
                    <td
                      className={
                        row[3].startsWith("+") ? "positive" : "negative"
                      }
                    >
                      {row[3]}
                    </td>
                    <td>{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  )
}

const marketPins = [
  {
    name: "Mercado Mayorista de Lima",
    city: "Lima",
    price: "S/ 4.20",
    x: 114,
    y: 235,
  },
  { name: "Moshoqueque", city: "Chiclayo", price: "S/ 3.10", x: 91, y: 107 },
  { name: "San Camilo", city: "Arequipa", price: "S/ 3.80", x: 171, y: 332 },
  { name: "Vinocanchón", city: "Cusco", price: "S/ 3.40", x: 210, y: 269 },
  { name: "Maltería", city: "Huancayo", price: "S/ 2.90", x: 157, y: 221 },
]

function PeruMap() {
  const [selected, setSelected] = useState(0)
  return (
    <div className="map-canvas">
      <div className="map-controls">
        <button>+</button>
        <button>−</button>
      </div>
      <svg
        viewBox="0 0 330 430"
        role="img"
        aria-label="Mapa de mercados mayoristas del Perú"
      >
        <defs>
          <filter id="mapShadow">
            <feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity=".12" />
          </filter>
        </defs>
        <path
          className="peru-shape"
          filter="url(#mapShadow)"
          d="M76 31 130 42l13 32 46 25-10 34 24 40-8 45 39 39-2 34 27 44-20 39-31-9-35-42-37-7-23-45-4-55-31-35 11-41-24-30 22-31Z"
        />
        <path
          className="region-line"
          d="m79 99 100 34M89 190l106-17M110 276l99-7M136 326l72-43M143 74l-54 116m114-17-90 58m122 26-62 66"
        />
        {marketPins.map((pin, i) => (
          <g
            key={pin.name}
            className={`map-pin ${selected === i ? "selected" : ""}`}
            onClick={() => setSelected(i)}
            transform={`translate(${pin.x} ${pin.y})`}
          >
            <circle r="16" />
            <path d="M0 9s-8-8-8-14a8 8 0 1 1 16 0C8 1 0 9 0 9Z" />
            <circle cy="-5" r="2.5" />
          </g>
        ))}
      </svg>
      <div className="map-popup">
        <button onClick={() => setSelected((selected + 1) % marketPins.length)}>
          <Icon name="close" size={15} />
        </button>
        <small>{marketPins[selected].city.toUpperCase()}</small>
        <strong>{marketPins[selected].name}</strong>
        <div>
          <span>Papa amarilla</span>
          <b>
            {marketPins[selected].price} <em>/ kg</em>
          </b>
        </div>
        <p>Actualizado hoy, 8:30 a.m.</p>
      </div>
      <div className="map-legend">
        <span>Precio bajo</span>
        <i />
        <i />
        <i />
        <i />
        <span>Precio alto</span>
      </div>
    </div>
  )
}

function MapPage() {
  return (
    <>
      <header className="page-header compact-header">
        <div>
          <span className="kicker">MAPA DE PRECIOS</span>
          <h1>Explora precios en todo el Perú</h1>
          <p>Selecciona un mercado para conocer sus precios actuales.</p>
        </div>
      </header>
      <div className="map-layout">
        <Panel className="map-filters">
          <h2>Filtrar mercados</h2>
          <p>Ajusta tu búsqueda</p>
          <SelectFilter
            label="Producto"
            value={products[0]}
            options={products}
          />
          <SelectFilter
            label="Departamento"
            value="Todos los departamentos"
            options={[
              "Todos los departamentos",
              "Lima",
              "Lambayeque",
              "Arequipa",
              "Cusco",
              "Junín",
            ]}
          />
          <div className="switch-row">
            <span>Mostrar mapa de calor</span>
            <button className="switch active">
              <i />
            </button>
          </div>
          <div className="market-count">
            <strong>18</strong>
            <span>
              mercados
              <br />
              encontrados
            </span>
          </div>
          <div className="mini-market-list">
            {marketPins.slice(0, 3).map((pin) => (
              <div key={pin.city}>
                <i />
                <span>
                  <b>{pin.city}</b>
                  <small>{pin.name}</small>
                </span>
                <strong>{pin.price}</strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel className="map-panel">
          <PeruMap />
        </Panel>
      </div>
    </>
  )
}

const offerData = [
  {
    product: "Papa amarilla",
    qty: "1,200 kg",
    zone: "Huancayo, Junín",
    date: "28 mar",
    price: "S/ 3.20 / kg",
    initials: "JM",
    name: "Juan Mendoza",
    color: "yellow",
  },
  {
    product: "Palta Hass",
    qty: "850 kg",
    zone: "Chao, La Libertad",
    date: "02 abr",
    price: "A convenir",
    initials: "RL",
    name: "Rosa López",
    color: "green",
  },
  {
    product: "Quinua blanca",
    qty: "500 kg",
    zone: "Ayacucho",
    date: "05 abr",
    price: "S/ 6.80 / kg",
    initials: "AC",
    name: "Ana Cárdenas",
    color: "red",
  },
]

function OffersPage() {
  const [sent, setSent] = useState(false)
  return (
    <>
      <header className="page-header">
        <div>
          <span className="kicker">CONECTA Y COMERCIALIZA</span>
          <h1>Ofertas directas del campo</h1>
          <p>
            Publica tu cosecha o encuentra productos frescos sin intermediarios.
          </p>
        </div>
        <button
          className="primary-button top-action"
          onClick={() =>
            document
              .getElementById("offer-form")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          + Publicar una oferta
        </button>
      </header>
      <div className="offers-layout">
        <Panel className="offers-list">
          <PanelHeading
            title="Ofertas recientes"
            subtitle="Productos disponibles directamente del agricultor"
            action={
              <SelectFilter
                label="Ordenar por"
                value="Más recientes"
                options={["Más recientes", "Menor precio", "Mayor cantidad"]}
              />
            }
          />
          <div className="offer-cards">
            {offerData.map((offer) => (
              <article className="offer-card" key={offer.product}>
                <div className={`product-illustration ${offer.color}`}>
                  <Icon name="sprout" size={28} />
                </div>
                <div className="offer-main">
                  <span className="available">DISPONIBLE</span>
                  <h3>{offer.product}</h3>
                  <div className="offer-meta">
                    <span>
                      <Icon name="weight" size={15} />
                      {offer.qty}
                    </span>
                    <span>
                      <Icon name="pin" size={15} />
                      {offer.zone}
                    </span>
                    <span>
                      <Icon name="calendar" size={15} />
                      Cosecha: {offer.date}
                    </span>
                  </div>
                  <div className="farmer">
                    <i>{offer.initials}</i>
                    <span>
                      <b>{offer.name}</b>
                      <small>Agricultor verificado</small>
                    </span>
                  </div>
                </div>
                <div className="offer-action">
                  <strong>{offer.price}</strong>
                  <button>
                    <Icon name="phone" size={17} />
                    Contactar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel className="offer-form">
          <div id="offer-form">
            <span className="kicker">PUBLICA GRATIS</span>
            <h2>¿Qué tienes para vender?</h2>
            <p>
              Completa estos datos y compradores interesados podrán contactarte.
            </p>
          </div>
          <label>
            Producto
            <select>
              <option>Selecciona un producto</option>
              {products.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Cantidad
              <input placeholder="Ej. 500" />
            </label>
            <label>
              Unidad
              <select>
                <option>kg</option>
                <option>toneladas</option>
              </select>
            </label>
          </div>
          <label>
            Zona o distrito
            <input placeholder="Ej. Huancayo, Junín" />
          </label>
          <label>
            Fecha de cosecha
            <input type="date" />
          </label>
          <label>
            Teléfono de contacto
            <input placeholder="Ej. 987 654 321" type="tel" />
          </label>
          <button
            className="primary-button submit-offer"
            onClick={() => setSent(true)}
          >
            {sent ? (
              <>
                <Icon name="check" size={18} /> Oferta publicada
              </>
            ) : (
              "Publicar mi oferta"
            )}
          </button>
          <small className="form-note">
            Tus datos solo se compartirán con compradores interesados.
          </small>
        </Panel>
      </div>
    </>
  )
}

function AboutPage() {
  return (
    <>
      <header className="about-hero">
        <span className="kicker">ACERCA DEL PROYECTO</span>
        <h1>
          Información justa para
          <br />
          <em>decisiones más justas.</em>
        </h1>
        <p>
          PreciosChacra nace para que cada agricultor peruano pueda negociar con
          información clara, actual y accesible.
        </p>
        <div className="about-stat-row">
          <div>
            <strong>2.2 M</strong>
            <span>productores agrarios en el Perú</span>
          </div>
          <div>
            <strong>58%</strong>
            <span>recibe en promedio del precio final</span>
          </div>
          <div>
            <strong>25+</strong>
            <span>mercados monitoreados</span>
          </div>
        </div>
      </header>
      <div className="about-content">
        <Panel className="problem-card">
          <div className="number-badge">01</div>
          <div>
            <span className="kicker">EL PROBLEMA</span>
            <h2>Quien produce, suele ser quien menos información tiene.</h2>
            <p>
              Muchos pequeños agricultores venden sin conocer el precio real de
              sus productos en los mercados. Esta asimetría reduce su capacidad
              de negociación y limita sus ingresos.
            </p>
          </div>
          <div className="quote-card">
            “Antes vendía al precio que me ofrecían. Ahora puedo comparar antes
            de decidir.”<span>— Productor de papa, Junín</span>
          </div>
        </Panel>
        <Panel className="sources-card">
          <PanelHeading
            title="Datos abiertos, impacto real"
            subtitle="Trabajamos con fuentes públicas y confiables para acercar información de calidad al campo."
          />
          <div className="source-grid">
            <article>
              <strong>MIDAGRI</strong>
              <span>Ministerio de Desarrollo Agrario y Riego</span>
              <p>Precios diarios, volúmenes y procedencias.</p>
            </article>
            <article>
              <strong>INEI</strong>
              <span>Instituto Nacional de Estadística</span>
              <p>Indicadores agrícolas y socioeconómicos.</p>
            </article>
          </div>
        </Panel>
        <Panel className="tools-card">
          <span className="kicker">TECNOLOGÍA ABIERTA</span>
          <h2>Herramientas que hacen visible la información</h2>
          <div className="tool-row">
            {["R", "Shiny", "Leaflet", "plotly"].map((tool, i) => (
              <div key={tool}>
                <i className={`tool-icon tool-${i}`}>
                  {i === 0 ? "R" : i === 1 ? "S" : i === 2 ? "⌖" : "P"}
                </i>
                <strong>{tool}</strong>
                <span>
                  {
                    [
                      "Análisis de datos",
                      "Aplicación web",
                      "Mapas interactivos",
                      "Gráficos dinámicos",
                    ][i]
                  }
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

function App() {
  const [page, setPage] = useState<Page>("inicio")
  const currentLabel = useMemo(
    () => navigation.find((item) => item.id === page)?.label,
    [page],
  )
  const navigate = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("inicio")}>
          <span>
            <Icon name="leaf" size={23} />
          </span>
          <div>
            <strong>
              Precios<span>Chacra</span>
            </strong>
            <small>Información que cultiva</small>
          </div>
        </button>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="help-card">
          <Icon name="sprout" size={30} />
          <strong>¿Necesitas ayuda?</strong>
          <p>Te enseñamos a usar la plataforma paso a paso.</p>
          <button>Ver guía rápida</button>
        </div>
        <div className="sidebar-footer">
          <span>Datos de</span>
          <strong>MIDAGRI · INEI</strong>
          <small>Versión 1.0 · 2025</small>
        </div>
      </aside>
      <main className={`main-content page-${page}`} aria-label={currentLabel}>
        <div className="mobile-topbar">
          <button className="brand" onClick={() => navigate("inicio")}>
            <span>
              <Icon name="leaf" size={20} />
            </span>
            <strong>
              Precios<span>Chacra</span>
            </strong>
          </button>
          <div>
            <span className="live-dot" /> En vivo
          </div>
        </div>
        <div className="content-inner">
          {page === "inicio" && <Dashboard />}
          {page === "precios" && <PricesPage />}
          {page === "mapa" && <MapPage />}
          {page === "ofertas" && <OffersPage />}
          {page === "acerca" && <AboutPage />}
        </div>
      </main>
      <nav className="mobile-nav">
        {navigation.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => navigate(item.id)}
          >
            <Icon name={item.icon} size={20} />
            <span>{item.mobile}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
