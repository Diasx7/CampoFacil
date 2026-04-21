import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import MapaTalhoes from "./MapaTalhoes";
import api from "../api";
import "./Talhoes.css";

const coresTalhoes = ["#639922", "#378ADD", "#EF9F27", "#D85A30", "#534AB7", "#1D9E75", "#B4B2A9"];
const statusOpcoes = ["Planejando", "Plantado", "Em crescimento", "Colheita", "Pousio"];
const culturaOpcoes = ["Sem plantio", "Milho silagem", "Milho grão", "Soja", "Sorgo", "Capim / Pastagem", "Cana-de-açúcar", "Hortifrutti"];

function Talhoes({ irPara }) {
  const [talhoes, setTalhoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [talhaoCerto, setTalhaoCerto] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarEditar, setMostrarEditar] = useState(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaCultura, setNovaCultura] = useState("");
  const [areaMedida, setAreaMedida] = useState(null);
  const [pontosMedidos, setPontosMedidos] = useState([]);
  const [formEditar, setFormEditar] = useState({ nome: "", cultura: "", status: "", cor: "" });

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

  // agora recebe area E pontos do mapa
  function receberArea(area, pontos) {
    setAreaMedida(area);
    setPontosMedidos(pontos || []);
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
        cor: coresTalhoes[talhoes.length % coresTalhoes.length],
        status: "Planejando",
        poligono: pontosMedidos, // salva os pontos do mapa
      });
      setTalhoes([...talhoes, resposta.data]);
      setMostrarForm(false);
      setNovoNome("");
      setNovaCultura("");
      setAreaMedida(null);
      setPontosMedidos([]);
    } catch (err) {
      console.error('Erro ao salvar talhão:', err);
    }
  }

  function abrirEditar(t) {
    setFormEditar({ nome: t.nome, cultura: t.cultura, status: t.status, cor: t.cor });
    setMostrarEditar(t.id);
  }

  async function salvarEditar(e) {
    e.preventDefault();
    const talhaoAtual = talhoes.find((t) => t.id === mostrarEditar);
    try {
      const resposta = await api.put(`/talhoes/${mostrarEditar}`, {
        ...formEditar,
        area: talhaoAtual.area,
        poligono: talhaoAtual.poligono || [],
      });
      setTalhoes(talhoes.map((t) => t.id === mostrarEditar ? resposta.data : t));
      setMostrarEditar(null);
    } catch (err) {
      console.error('Erro ao editar talhão:', err);
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
    setPontosMedidos([]);
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
            {/* passa os talhoes salvos pro mapa mostrar os poligonos */}
            <MapaTalhoes onAreaMedida={receberArea} talhoesSalvos={talhoes} />
            <div className="mapa-dica">
              Clique nos pontos do mapa para desenhar o talhão — o app calcula os hectares automaticamente
            </div>

            {mostrarForm && (
              <div className="form-overlay">
                <div className="form-card">
                  <h3 className="form-titulo">Novo talhão</h3>
                  <p className="form-area-medida">Área medida: <strong>{areaMedida} ha</strong></p>
                  <form onSubmit={salvarTalhao}>
                    <div className="campo">
                      <label className="label">Nome do talhão</label>
                      <input type="text" className="input" placeholder="Ex: Talhão Norte" required
                        value={novoNome} onChange={(e) => setNovoNome(e.target.value)} autoFocus />
                    </div>
                    <div className="campo">
                      <label className="label">Cultura (opcional)</label>
                      <select className="input" value={novaCultura} onChange={(e) => setNovaCultura(e.target.value)}>
                        {culturaOpcoes.map((c) => <option key={c}>{c}</option>)}
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
                <div key={t.id}
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
                    <button className="btn-editar" title="Editar"
                      onClick={(e) => { e.stopPropagation(); abrirEditar(t); }}>✏️</button>
                    <button className="btn-deletar"
                      onClick={(e) => { e.stopPropagation(); deletarTalhao(t.id); }}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {mostrarEditar && (
        <div className="modal-overlay-talhao" onClick={() => setMostrarEditar(null)}>
          <div className="form-card" onClick={(e) => e.stopPropagation()} style={{ position: "relative", zIndex: 1001 }}>
            <h3 className="form-titulo">Editar talhão</h3>
            <form onSubmit={salvarEditar}>
              <div className="campo">
                <label className="label">Nome</label>
                <input type="text" className="input" required
                  value={formEditar.nome} onChange={(e) => setFormEditar({ ...formEditar, nome: e.target.value })} />
              </div>
              <div className="campo">
                <label className="label">Cultura</label>
                <select className="input" value={formEditar.cultura}
                  onChange={(e) => setFormEditar({ ...formEditar, cultura: e.target.value })}>
                  {culturaOpcoes.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="campo">
                <label className="label">Status</label>
                <select className="input" value={formEditar.status}
                  onChange={(e) => setFormEditar({ ...formEditar, status: e.target.value })}>
                  {statusOpcoes.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="campo">
                <label className="label">Cor</label>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {coresTalhoes.map((cor) => (
                    <div key={cor} onClick={() => setFormEditar({ ...formEditar, cor })}
                      style={{
                        width: "24px", height: "24px", borderRadius: "50%", background: cor, cursor: "pointer",
                        border: formEditar.cor === cor ? "3px solid #1a2e1a" : "2px solid transparent",
                      }} />
                  ))}
                </div>
              </div>
              <div className="form-botoes" style={{ marginTop: "1rem" }}>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarEditar(null)}>Cancelar</button>
                <button type="submit" className="btn-salvar">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Talhoes;