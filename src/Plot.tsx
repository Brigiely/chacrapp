import Plotly from "plotly.js-cartesian-dist-min"
import createPlotlyComponent from "react-plotly.js/factory"

// Versión liviana de Plotly (líneas, barras, heatmap y pie), sin cargar la librería completa
const Plot = createPlotlyComponent(Plotly)
export default Plot
