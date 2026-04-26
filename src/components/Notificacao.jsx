import { useState, useEffect } from "react";
import api from "../api";
import "./Notificacao.css";

function Notificacao() {
  const [alertas, setAlertas] = useState([]);
  const [visivel, setVisivel] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    verificarEstoque();
    // verifica a cada 5 minutos
    const intervalo = setInterval(verificarEstoque, 5 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  async function verificarEstoque() {
    try {
      const resposta = await api.get('/estoque');
      const criticos = resposta.data.filter((item) => {
        const pct = parseFloat(item.minimo) > 0
          ? (parseFloat(item.quantidade) / parseFloat(item.minimo)) * 100
          : 100;
        return parseFloat(item.quantidade) === 0 || pct < 30;
      });

      if (criticos.length > 0) {
        setAlertas(criticos);
        setVisivel(true);
      }
    } catch (err) {
      // silencioso
    }
  }

  if (!visivel || alertas.length === 0) return null;

  return (
    <div className="notif-container">
      <div className="notif-bar" onClick={() => setAberto(!aberto)}>
        <div className="notif-esquerda">
          <div className="notif-icone">⚠️</div>
          <span className="notif-texto">
            {alertas.length} item{alertas.length > 1 ? "s" : ""} com estoque crítico
          </span>
        </div>
        <div className="notif-direita">
          <span className="notif-toggle">{aberto ? "▲" : "▼"}</span>
          <button className="notif-fechar" onClick={(e) => { e.stopPropagation(); setVisivel(false); }}>✕</button>
        </div>
      </div>

      {aberto && (
        <div className="notif-lista">
          {alertas.map((item) => {
            const pct = parseFloat(item.minimo) > 0
              ? Math.round((parseFloat(item.quantidade) / parseFloat(item.minimo)) * 100)
              : 0;
            return (
              <div key={item.id} className="notif-item">
                <div className="notif-item-nome">{item.nome}</div>
                <div className="notif-item-detalhe">
                  {parseFloat(item.quantidade) === 0
                    ? "Zerado"
                    : `${item.quantidade} ${item.unidade} (${pct}% do mínimo)`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notificacao;