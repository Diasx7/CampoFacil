import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MapaTalhoes from "./MapaTalhoes";
import api from "../api";
import "./Talhoes.css";

function Talhoes({ irPara }) {
  const [talhoes, setTalhoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [talhaoCerto, setTalhaoCerto] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCultura, setNovaCultura] = useState("");
  const [areaMedida, setAreaMedida] = useState(null);

  // busca os talhoes do banco quando a tela abre
  useEffect(() => {
    buscarTalhoes();
  }, []);

  async function buscarTalhoes() {
    try {
      const resposta = await api.get('/talhoes');
      setTalhoes(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar talhões:', err);
    } finally {
      setCarregando(false);
    }
  }

  function receberArea(area) {
    setAreaMedida(area);
    setMostrarForm(true);
  }

  async function salvarTalhao(e) {
    e.preventDefault();
    if (!novoNome || !areaMedida) return;

    try {
      const resposta = await api.post('/talhoes', {
        nome: novoNome,
        cultura: novaCultura || "Sem plantio",
        area: areaMedida,
        cor: "#639922",
        status: "Planejando",
      });

      // adiciona o novo talhao na lista
      setTalhoes([...talhoes, resposta.data]);
      setMostrarForm(false);
      setNovoNome("");
      setNovaCultura("");
      setAreaMedida(null);
    } catch (err) {
      console.error('Erro ao salvar talhão:', err);
    }
  }

  async function deletarTalhao(id) {
    try {
      await api.delete(`/talhoes/${id}`);
      setTalhoes(talhoes.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Erro ao deletar talhão:', err);
    }
  }

  function cancelar() {
    setMostrarForm(false);
    setNovoNome("");
    setNovaCultura("");
    setAreaMedida(null);
  }

  return (
    <div className="talhoes-pagina">
      <Sidebar telaAtiva="talhoes" irPara={irPara} />

      <div className="talhoes-main">
        <div className="talhoes-header">
          <div>
            <h1 className="talhoes-titulo">Meus talhões</h1>
            <span className="talhoes-sub">Clique no mapa para desenhar um novo talhão</span>
          </div>
          <div className="talhoes-total">
            <span className="total-label">Área total cadastrada</span>
            <span className="total-val">
              {talhoes.reduce((acc, t) => acc + parseFloat(t.area || 0), 0).toFixed(1)} ha
            </span>
          </div>
        </div>

        <div className="talhoes-grid">
          <div className="mapa-wrapper">
            <MapaTalhoes onAreaMedida={receberArea} />

            <div className="mapa-dica">
              Clique nos pontos do mapa para desenhar o talhão — o app calcula os hectares automaticamente
            </div>

            {mostrarForm && (
              <div className="form-overlay">
                <div className="form-card">
                  <h3 className="form-titulo">Novo talhão</h3>
                  <p className="form-area-medida">
                    Área medida: <strong>{areaMedida} ha</strong>
                  </p>
                  <form onSubmit={salvarTalhao}>
                    <div className="campo">
                      <label className="label">Nome do talhão</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ex: Talhão Norte"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="campo">
                      <label className="label">Cultura (opcional)</label>
                      <select className="input" value={novaCultura}
                        onChange={(e) => setNovaCultura(e.target.value)}>
                        <option value="">Sem plantio</option>
                        <option>Milho silagem</option>
                        <option>Milho grão</option>
                        <option>Soja</option>
                        <option>Sorgo</option>
                        <option>Capim / Pastagem</option>
                        <option>Cana-de-açúcar</option>
                        <option>Hortifrutti</option>
                      </select>
                    </div>
                    <div className="form-botoes">
                      <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                      <button type="submit" className="btn-salvar">Salvar talhão</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="talhoes-lista">
            <div className="lista-header">
              <span className="lista-titulo">Talhões cadastrados</span>
              <span className="lista-count">{talhoes.length} talhões</span>
            </div>

            {carregando ? (
              <p style={{ fontSize: "13px", color: "#888", padding: "1rem 0" }}>Carregando...</p>
            ) : talhoes.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#888", padding: "1rem 0" }}>Nenhum talhão cadastrado ainda.</p>
            ) : (
              talhoes.map((t) => (
                <div
                  key={t.id}
                  className={`talhao-card ${talhaoCerto === t.id ? "talhao-card-ativo" : ""}`}
                  onClick={() => setTalhaoCerto(t.id === talhaoCerto ? null : t.id)}
                >
                  <div className="talhao-cor" style={{ background: t.cor || "#639922" }}></div>
                  <div className="talhao-info">
                    <div className="talhao-nome">{t.nome}</div>
                    <div className="talhao-detalhe">{t.cultura} · {t.area} ha</div>
                  </div>
                  <div className="talhao-direita">
                    <span className={`talhao-status status-${t.status === "Em crescimento" || t.status === "Plantado" ? "ok" : t.status === "Cobertura hoje" ? "warn" : "plan"}`}>
                      {t.status}
                    </span>
                    <button
                      className="btn-deletar"
                      onClick={(e) => { e.stopPropagation(); deletarTalhao(t.id); }}
                    >✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Talhoes;