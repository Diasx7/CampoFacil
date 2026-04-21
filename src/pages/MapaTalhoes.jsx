import { useEffect, useRef, useState } from "react";
import "./MapaTalhoes.css";

function calcularAreaHectares(pontos) {
  if (pontos.length < 3) return 0;
  let area = 0;
  const n = pontos.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += pontos[i].lat * pontos[j].lng;
    area -= pontos[j].lat * pontos[i].lng;
  }
  area = Math.abs(area) / 2;
  const areaMetros = area * 111320 * 111320;
  return Math.round((areaMetros / 10000) * 10) / 10;
}

function MapaTalhoes({ onAreaMedida, talhoesSalvos = [] }) {
  const mapaRef = useRef(null);
  const mapaInstancia = useRef(null);
  const [desenhando, setDesenhando] = useState(false);
  const [pontos, setPontos] = useState([]);
  const [carregandoLoc, setCarregandoLoc] = useState(false);
  const [mapaProto, setMapaProto] = useState(false);
  const marcadoresRef = useRef([]);
  const poligonoRef = useRef(null);
  const linhaRef = useRef(null);
  const pontosRef = useRef([]);
  const poligonosSalvosRef = useRef([]);

  useEffect(() => {
    function carregarLeaflet() {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setTimeout(() => inicializarMapa(), 200);
      document.head.appendChild(script);
    }

    if (window.L) {
      setTimeout(() => inicializarMapa(), 200);
    } else {
      carregarLeaflet();
    }

    return () => {
      if (mapaInstancia.current) {
        mapaInstancia.current.remove();
        mapaInstancia.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapaProto && talhoesSalvos.length > 0) {
      desenharPoligonosSalvos();
    }
  }, [mapaProto, talhoesSalvos]);

  function inicializarMapa() {
    if (mapaInstancia.current || !mapaRef.current) return;

    const mapa = window.L.map(mapaRef.current).setView([-18.9186, -48.2772], 13);

    // satelite do Esri - gratuito e sem chave de API
    window.L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "© Esri, DigitalGlobe, GeoEye",
        maxZoom: 19,
      }
    ).addTo(mapa);

    mapaInstancia.current = mapa;
    setMapaProto(true);
    irParaMinhaLocalizacao(mapa);
  }

  function desenharPoligonosSalvos() {
    if (!mapaInstancia.current) return;

    poligonosSalvosRef.current.forEach((p) => mapaInstancia.current.removeLayer(p));
    poligonosSalvosRef.current = [];

    talhoesSalvos.forEach((talhao) => {
      if (!talhao.poligono) return;

      const pts = typeof talhao.poligono === 'string'
        ? JSON.parse(talhao.poligono)
        : talhao.poligono;

      if (!pts || pts.length < 3) return;

      const coordenadas = pts.map((p) => [p.lat, p.lng]);

      const poligono = window.L.polygon(coordenadas, {
        color: talhao.cor || "#4ade80",
        fillColor: talhao.cor || "#4ade80",
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(mapaInstancia.current);

      poligono.bindTooltip(talhao.nome, {
        permanent: true,
        direction: "center",
        className: "talhao-tooltip",
      });

      poligonosSalvosRef.current.push(poligono);
    });
  }

  function irParaMinhaLocalizacao(mapaParam) {
    const mapa = mapaParam || mapaInstancia.current;
    if (!mapa) return;
    setCarregandoLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapa.setView([latitude, longitude], 16);
        const icone = window.L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;background:#378ADD;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px rgba(55,138,221,0.3);"></div>`,
          iconSize: [14, 14], iconAnchor: [7, 7],
        });
        window.L.marker([latitude, longitude], { icon: icone })
          .addTo(mapa).bindPopup("Você está aqui").openPopup();
        setCarregandoLoc(false);
      },
      () => setCarregandoLoc(false)
    );
  }

  function adicionarPonto(e) {
    const novoPonto = { lat: e.latlng.lat, lng: e.latlng.lng };
    pontosRef.current = [...pontosRef.current, novoPonto];
    setPontos([...pontosRef.current]);

    const marcador = window.L.circleMarker([novoPonto.lat, novoPonto.lng], {
      radius: 6, color: "#fff", fillColor: "#4ade80", fillOpacity: 1, weight: 2,
    }).addTo(mapaInstancia.current);
    marcadoresRef.current.push(marcador);

    if (linhaRef.current) mapaInstancia.current.removeLayer(linhaRef.current);
    if (pontosRef.current.length > 1) {
      linhaRef.current = window.L.polyline(
        pontosRef.current.map((p) => [p.lat, p.lng]),
        { color: "#4ade80", weight: 2, dashArray: "5, 5" }
      ).addTo(mapaInstancia.current);
    }
  }

  function iniciarDesenho() {
    if (!mapaInstancia.current) return;
    setDesenhando(true);
    pontosRef.current = [];
    setPontos([]);
    limparDesenho();
    mapaInstancia.current.on("click", adicionarPonto);
  }

  function finalizarDesenho() {
    if (!mapaInstancia.current || pontosRef.current.length < 3) return;

    if (linhaRef.current) {
      mapaInstancia.current.removeLayer(linhaRef.current);
      linhaRef.current = null;
    }

    poligonoRef.current = window.L.polygon(
      pontosRef.current.map((p) => [p.lat, p.lng]),
      { color: "#4ade80", fillColor: "#4ade80", fillOpacity: 0.3, weight: 2 }
    ).addTo(mapaInstancia.current);

    mapaInstancia.current.off("click", adicionarPonto);
    setDesenhando(false);
    onAreaMedida(calcularAreaHectares(pontosRef.current), pontosRef.current);
  }

  function limparDesenho() {
    marcadoresRef.current.forEach((m) => {
      if (mapaInstancia.current) mapaInstancia.current.removeLayer(m);
    });
    marcadoresRef.current = [];
    if (linhaRef.current && mapaInstancia.current) {
      mapaInstancia.current.removeLayer(linhaRef.current);
      linhaRef.current = null;
    }
    if (poligonoRef.current && mapaInstancia.current) {
      mapaInstancia.current.removeLayer(poligonoRef.current);
      poligonoRef.current = null;
    }
    pontosRef.current = [];
    setPontos([]);
  }

  function cancelarDesenho() {
    if (mapaInstancia.current) mapaInstancia.current.off("click", adicionarPonto);
    limparDesenho();
    setDesenhando(false);
  }

  return (
    <div className="mapa-container">
      <div className="mapa-controles">
        {!desenhando ? (
          <div className="mapa-controles-normal">
            <button className="btn-desenhar" onClick={iniciarDesenho} disabled={!mapaProto}>
              + Desenhar talhão
            </button>
            <button className="btn-localizacao" onClick={() => irParaMinhaLocalizacao()} disabled={carregandoLoc || !mapaProto}>
              {carregandoLoc ? "Localizando..." : "📍 Minha localização"}
            </button>
          </div>
        ) : (
          <div className="mapa-controles-desenho">
            <span className="mapa-instrucao">
              {pontos.length === 0 ? "Clique no mapa para começar"
                : `${pontos.length} ponto${pontos.length > 1 ? "s" : ""} marcado${pontos.length > 1 ? "s" : ""}`}
            </span>
            {pontos.length >= 3 && (
              <button className="btn-finalizar" onClick={finalizarDesenho}>Finalizar talhão</button>
            )}
            <button className="btn-cancelar-mapa" onClick={cancelarDesenho}>Cancelar</button>
          </div>
        )}
      </div>
      <div ref={mapaRef} className="mapa-leaflet"></div>
    </div>
  );
}

export default MapaTalhoes;