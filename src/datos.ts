import { useEffect, useState } from "react"

export type Registro = {
  mes: string // "2025-10"
  departamento: string // "JUNIN" (mayúsculas, sin tildes)
  producto: string // "PAPA" | "CEBOLLA" | "ARROZ" | "CHOCLO"
  chacra: number | null
  mayorista: number | null
  minorista: number | null
  pct_vs_mayorista: number | null
  pct_vs_minorista: number | null
  fuente_chacra: string | null
}

export type Semanal = {
  fecha: string // "2026-08-28"
  departamento: string
  producto: string
  chacra: number | null
  mayorista: number | null
  minorista: number | null
}

export type Meta = {
  fuente: string
  ultimo_dato: string
  primer_mes: string
  minorista_desde: string
}

export type Datos = { mensual: Registro[]; semanal: Semanal[]; meta: Meta }

export const PRODUCTOS = ["PAPA", "CEBOLLA", "ARROZ", "CHOCLO"]
export const NOMBRE_PRODUCTO: Record<string, string> = {
  PAPA: "Papa",
  CEBOLLA: "Cebolla",
  ARROZ: "Arroz cáscara",
  CHOCLO: "Maíz choclo",
}

export const titulo = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()
export const soles = (n: number | null | undefined) =>
  n == null ? "sin dato" : `S/ ${n.toFixed(2)}`

// Se descarga una sola vez y se reutiliza en todas las páginas
let promesa: Promise<Datos> | null = null
function cargar(): Promise<Datos> {
  if (!promesa) {
    promesa = Promise.all([
      fetch("/data/precios_mensual.json").then((r) => r.json()),
      fetch("/data/precios_semanal.json").then((r) => r.json()),
      fetch("/data/meta.json").then((r) => r.json()),
    ]).then(([mensual, semanal, meta]) => ({ mensual, semanal, meta }))
  }
  return promesa
}

export function usePrecios() {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    cargar().then(setDatos).catch(() => setError(true))
  }, [])
  return { datos, error }
}
