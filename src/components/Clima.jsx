import { useState, useEffect } from "react";
import "./Clima.css";

const CHAVE_API = "d04c2bd169c091255a451458d2ec02d7";

// icones do clima baseado no codigo da API
function IconeClima({ codigo, tamanho = 20 }) {
  // ensolarado
  if (codigo === "01d" || codigo === "01n") {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="4" fill="#EF9F27" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4" stroke="#EF9F27" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // parcialmente nublado
  if (codigo === "02d" || codigo === "02n") {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="9" r="3" fill="#EF9F27" />
        <path d="M8 14 Q10 11 13 12 Q16 12 16 15 Q15 17 11 17 Q8 17 7 15 Q6 13 8 14Z" fill="#B4B2A9" />
      </svg>
    );
  }
  // chuva
  if (["09d","09n","10d","10n","11d","11n"].includes(codigo)) {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
        <path d="M4 10 Q6 6 10 7 Q13 5 16 8 Q19 9 18 13 Q17 16 12 15 Q7 16 5 14 Q2 12 4 10Z" fill="#B4B2A9" />
        <path d="M8 15 L7 18M11 15 L10 18M14 15 L13 18" stroke="#378ADD" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  // neve
  if (["13d","13n"].includes(codigo)) {
    return (
      <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
        <path d="M4 10 Q6 6 10 7 Q13 5 16 8 Q19 9 18 13 Q17 16 12 15 Q7 16 5 14 Q2 12 4 10Z" fill="#B4B2A9" />
        <path d="M8 16 L8 18M11 16 L11 18M14 16 L14 18" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  // nublado
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 20 20" fill="none">
      <path d="M3 12 Q5 7 10 8 Q13 6 16 9 Q20 10 19 14 Q18 17 13 16 Q7 17 5 15 Q1 13 3 12Z" fill="#B4B2A9" />
    </svg>
  );
}

function Clima() {
  const [clima, setClima] = useState(null);
  const [previsao, setPrevisao] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    buscarClima();
  }, []);

  async function buscarClima() {
    try {
      // pega a localizacao do usuario
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await carregarDadosClima(latitude, longitude);
        },
        // se nao permitir localizacao usa Uberlandia MG como padrao
        async () => {
          await carregarDadosClima(-18.9186, -48.2772);
        }
      );
    } catch (err) {
      setErro("Não foi possível carregar o clima");
      setCarregando(false);
    }
  }

  async function carregarDadosClima(lat, lon) {
    try {
      // clima atual
      const resAtual = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CHAVE_API}&units=metric&lang=pt_br`
      );
      const dadosAtual = await resAtual.json();

      // previsao dos proximos dias
      const resPrevisao = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CHAVE_API}&units=metric&lang=pt_br&cnt=40`
      );
      const dadosPrevisao = await resPrevisao.json();

      setClima(dadosAtual);

      // pega um dado por dia (a cada 8 itens = 24h)
      const diasUnicos = [];
      const diasVistos = new Set();

      dadosPrevisao.list.forEach((item) => {
        const dia = new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' });
        if (!diasVistos.has(dia) && diasUnicos.length < 5) {
          diasVistos.add(dia);
          diasUnicos.push(item);
        }
      });

      setPrevisao(diasUnicos);
    } catch (err) {
      setErro("Erro ao carregar clima");
    } finally {
      setCarregando(false);
    }
  }

  // verifica se vai chover nos proximos 2 dias
  const vaiChover = previsao.slice(0, 2).some((d) =>
    ["Rain", "Drizzle", "Thunderstorm"].includes(d.weather[0].main)
  );

  if (carregando) {
    return <div className="clima-loading">Carregando clima...</div>;
  }

  if (erro || !clima) {
    return <div className="clima-erro">Clima indisponível</div>;
  }

  return (
    <div className="clima-widget">
      <div className="clima-atual">
        <div className="clima-atual-info">
          <IconeClima codigo={clima.weather[0].icon} tamanho={28} />
          <div>
            <div className="clima-temp">{Math.round(clima.main.temp)}°C</div>
            <div className="clima-cidade">{clima.name}</div>
          </div>
        </div>
        <div className="clima-detalhes">
          <span>💧 {clima.main.humidity}%</span>
          <span>💨 {Math.round(clima.wind.speed * 3.6)} km/h</span>
        </div>
      </div>

      {previsao.length > 0 && (
        <div className="clima-previsao">
          {previsao.map((d, i) => (
            <div key={i} className="clima-dia">
              <span className="clima-dia-nome">
                {i === 0 ? "Hoje" : new Date(d.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' })}
              </span>
              <IconeClima codigo={d.weather[0].icon} tamanho={18} />
              <span className="clima-dia-temp">{Math.round(d.main.temp)}°</span>
            </div>
          ))}
        </div>
      )}

      {vaiChover && (
        <div className="clima-aviso">
          Chuva prevista — evite aplicar defensivo ou adubo nesses dias
        </div>
      )}
    </div>
  );
}

export default Clima;