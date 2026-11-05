import "./acerca-proyecto.css"

// Archivos en la carpeta /public del proyecto:
//   public/chacra-papa.png   (portada)
//   public/video.mp4         (video de la sección del problema)

// Para usar un video también en la portada, escribe su ruta, por ejemplo "/chacra.mp4".
// Si queda vacío, la portada muestra solo la foto.
const HERO_VIDEO = ""

export default function AcercaProyecto({ onVolver }: { onVolver?: () => void }) {
  return (
    <div className="ap-page">
      {onVolver && (
        <button type="button" className="ap-back" onClick={onVolver}>
          Volver al inicio
        </button>
      )}

      <header className="ap-hero">
        <img
          className="ap-hero-media"
          src="/chacra-papa.png"
          alt="Agricultor mostrando papas recién cosechadas sobre un cajón de madera"
        />
        {HERO_VIDEO && (
          <video
            className="ap-hero-media ap-hero-video"
            src={HERO_VIDEO}
            poster="/chacra-papa.png"
            autoPlay
            muted
            loop
            playsInline
          />
        )}
        <div className="ap-hero-shade" />
        <div className="ap-hero-body">
          <p className="ap-kicker">ACERCA DEL PROYECTO</p>
          <h1>PreciosChacra</h1>
          <p className="ap-lead">
            Visualización interactiva de precios agrícolas para reducir la
            asimetría de información entre pequeños productores, intermediarios
            y compradores en el Perú.
          </p>
        </div>
      </header>

      <section className="ap-card ap-problem">
        <div className="ap-problem-text">
          <h2>El problema</h2>
          <p>
            Muchos pequeños agricultores venden su producción sin conocer los
            precios vigentes en los mercados. Eso les quita poder de negociación
            frente a los intermediarios y los lleva a recibir un precio en
            chacra menor al que podrían obtener. Las plataformas oficiales
            (SISAP y SIEA del MIDAGRI) presentan la información de forma
            dispersa y poco amigable.
          </p>
        </div>
        <video
          className="ap-video"
          src="/video.mp4"
          controls
          preload="metadata"
          playsInline
        >
          Tu navegador no puede reproducir este video.
        </video>
      </section>

      <section className="ap-question">
        <h2>Pregunta de investigación</h2>
        <p>
          ¿De qué manera una aplicación de visualización interactiva de precios
          agrícolas puede ayudar a reducir la asimetría de información en la
          comercialización agrícola del Perú?
        </p>
      </section>

      <section className="ap-card ap-goal">
        <h2>Nuestro objetivo</h2>
        <p>
          Ofrecer una aplicación web que muestre los precios agrícolas con
          gráficos dinámicos y mapas, para que el productor pueda comparar
          mercados, ver tendencias y decidir mejor cuándo y a quién vender.
        </p>
      </section>
    </div>
  )
}