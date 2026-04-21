import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import useTalhoes from "../hooks/useTalhoes";
import "./Caderno.css";

const tiposAtividade = [
  "Plantio", "Adubação", "Herbicida", "Inseticida", "Fungicida",
  "Irrigação", "Colheita", "Manutenção", "Análise de solo", "Outro",
];

const coresAtividade = {
  Plantio: { bg: "#eaf3de", cor: "#3B6D11" },
  Adubação: { bg: "#FAEEDA", cor: "#633806" },
  Herbicida: { bg: "#e6f1fb", cor: "#185FA5" },
  Inseticida: { bg: "#fcebeb", cor: "#791F1F" },
  Fungicida: { bg: "#EEEDFE", cor: "#26215C" },
  Irrigação: { bg: "#E1F5EE", cor: "#04342C" },
  Colheita: { bg: "#FAEEDA", cor: "#412402" },
  Manutenção: { bg: "#F1EFE8", cor: "#2C2C2A" },
  "Análise de solo": { bg: "#FBEAF0", cor: "#4B1528" },
  Outro: { bg: "#F1EFE8", cor: "#444441" },
};

function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function Caderno({ irPara }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTalhao, setFiltroTalhao] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [mostrarFiltroData, setMostrarFiltroData] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandido, setExpandido] = useState(null);

  const { nomesDosTalhoes } = useTalhoes();
  const talhoesFiltro = ["Todos", ...nomesDosTalhoes];

  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    tipo: "Plantio",
    talhao: "",
    descricao: "",
    insumos: "",
    clima: "",
  });

  useEffect(() => {
    buscarRegistros();
  }, []);

  useEffect(() => {
    if (nomesDosTalhoes.length > 0 && !form.talhao) {
      setForm((f) => ({ ...f, talhao: nomesDosTalhoes[0] }));
    }
  }, [nomesDosTalhoes]);

  async function buscarRegistros() {
    try {
      const resposta = await api.get('/caderno');
      setRegistros(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar caderno:', err);
    } finally {
      setCarregando(false);
    }
  }

  // filtra com data tambem
  const registrosFiltrados = registros
    .filter((r) => filtroTalhao === "Todos" || r.talhao === filtroTalhao)
    .filter((r) => filtroTipo === "Todos" || r.tipo === filtroTipo)
    .filter((r) => {
      if (!filtroDataInicio && !filtroDataFim) return true;
      const data = new Date(r.data);
      if (filtroDataInicio && data < new Date(filtroDataInicio)) return false;
      if (filtroDataFim && data > new Date(filtroDataFim)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  async function salvarRegistro(e) {
    e.preventDefault();
    try {
      const resposta = await api.post('/caderno', form);
      setRegistros([...registros, resposta.data]);
      setMostrarForm(false);
      setForm({
        data: new Date().toISOString().split("T")[0],
        tipo: "Plantio",
        talhao: nomesDosTalhoes[0] || "",
        descricao: "",
        insumos: "",
        clima: "",
      });
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
    }
  }

  async function deletarRegistro(id) {
    try {
      await api.delete(`/caderno/${id}`);
      setRegistros(registros.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Erro ao deletar registro:', err);
    }
  }

  function limparFiltros() {
    setFiltroTalhao("Todos");
    setFiltroTipo("Todos");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  }

  const totalMes = registros.filter((r) => {
    const d = new Date(r.data);
    const hoje = new Date();
    return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
  }).length;

  const temFiltroAtivo = filtroTalhao !== "Todos" || filtroTipo !== "Todos" || filtroDataInicio || filtroDataFim;

  return (
    <div className="caderno-pagina">
      <Sidebar telaAtiva="caderno" irPara={irPara} />
      <div className="caderno-main">
        <div className="caderno-header">
          <div>
            <h1 className="caderno-titulo">Caderno de campo</h1>
            <span className="caderno-sub">Registro de todas as atividades realizadas na propriedade</span>
          </div>
          <button className="btn-novo-registro" onClick={() => setMostrarForm(true)}>+ Novo registro</button>
        </div>

        <div className="caderno-metrics">
          <div className="metric-card">
            <div className="metric-label">Total de registros</div>
            <div className="metric-val">{registros.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Este mês</div>
            <div className="metric-val">{totalMes}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Filtrados</div>
            <div className="metric-val">{registrosFiltrados.length}</div>
          </div>
        </div>

        <div className="caderno-filtros">
          <div className="filtro-grupo">
            <span className="filtro-label">Talhão:</span>
            <div className="filtro-btns">
              {talhoesFiltro.map((t) => (
                <button key={t} className={`filtro-btn ${filtroTalhao === t ? "filtro-btn-ativo" : ""}`}
                  onClick={() => setFiltroTalhao(t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="filtro-grupo">
            <span className="filtro-label">Tipo:</span>
            <div className="filtro-btns">
              {["Todos", ...tiposAtividade].map((t) => (
                <button key={t} className={`filtro-btn ${filtroTipo === t ? "filtro-btn-ativo" : ""}`}
                  onClick={() => setFiltroTipo(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* filtro de data */}
          <div className="filtro-grupo">
            <span className="filtro-label">Data:</span>
            <div className="filtro-btns">
              <button
                className={`filtro-btn ${mostrarFiltroData ? "filtro-btn-ativo" : ""}`}
                onClick={() => setMostrarFiltroData(!mostrarFiltroData)}
              >
                {filtroDataInicio || filtroDataFim ? `${filtroDataInicio || "..."} até ${filtroDataFim || "..."}` : "Filtrar por data"}
              </button>
              {(filtroDataInicio || filtroDataFim) && (
                <button className="filtro-btn" onClick={() => { setFiltroDataInicio(""); setFiltroDataFim(""); }}>
                  ✕ Limpar data
                </button>
              )}
            </div>
          </div>

          {mostrarFiltroData && (
            <div className="filtro-data-painel">
              <div className="campo">
                <label className="label">De</label>
                <input type="date" className="input" value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)} />
              </div>
              <div className="campo">
                <label className="label">Até</label>
                <input type="date" className="input" value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)} />
              </div>
            </div>
          )}

          {temFiltroAtivo && (
            <button className="btn-limpar-filtros" onClick={limparFiltros}>
              Limpar todos os filtros
            </button>
          )}
        </div>

        <div className="registros-lista">
          {carregando ? (
            <p style={{ fontSize: "13px", color: "#888" }}>Carregando...</p>
          ) : registrosFiltrados.length === 0 ? (
            <div className="registros-vazio">Nenhum registro encontrado.</div>
          ) : (
            registrosFiltrados.map((r) => {
              const cores = coresAtividade[r.tipo] || coresAtividade["Outro"];
              return (
                <div key={r.id} className={`registro-card ${expandido === r.id ? "registro-card-expandido" : ""}`}
                  onClick={() => setExpandido(expandido === r.id ? null : r.id)}>
                  <div className="registro-linha">
                    <div className="registro-data">{formatarData(r.data)}</div>
                    <span className="registro-tipo" style={{ background: cores.bg, color: cores.cor }}>{r.tipo}</span>
                    <div className="registro-talhao">{r.talhao}</div>
                    <div className="registro-descricao-resumo">{r.descricao}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="registro-seta">{expandido === r.id ? "▲" : "▼"}</div>
                      <button className="btn-deletar-registro"
                        onClick={(e) => { e.stopPropagation(); deletarRegistro(r.id); }}>✕</button>
                    </div>
                  </div>
                  {expandido === r.id && (
                    <div className="registro-detalhe">
                      <div className="detalhe-item">
                        <span className="detalhe-label">Descrição</span>
                        <span className="detalhe-valor">{r.descricao}</span>
                      </div>
                      {r.insumos && (
                        <div className="detalhe-item">
                          <span className="detalhe-label">Insumos utilizados</span>
                          <span className="detalhe-valor">{r.insumos}</span>
                        </div>
                      )}
                      {r.clima && (
                        <div className="detalhe-item">
                          <span className="detalhe-label">Condição climática</span>
                          <span className="detalhe-valor">{r.clima}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {mostrarForm && (
          <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">Novo registro</h3>
              <form onSubmit={salvarRegistro}>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Data</label>
                    <input type="date" className="input" required
                      value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label className="label">Tipo de atividade</label>
                    <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                      {tiposAtividade.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Talhão</label>
                  <select className="input" value={form.talhao} onChange={(e) => setForm({ ...form, talhao: e.target.value })}>
                    {nomesDosTalhoes.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="campo">
                  <label className="label">Descrição</label>
                  <textarea className="input textarea" rows={3} required placeholder="O que foi feito?"
                    value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="campo">
                  <label className="label">Insumos utilizados (opcional)</label>
                  <input type="text" className="input" placeholder="Ex: 350 kg NPK, 3,5 L Atrazina"
                    value={form.insumos} onChange={(e) => setForm({ ...form, insumos: e.target.value })} />
                </div>
                <div className="campo">
                  <label className="label">Condição climática (opcional)</label>
                  <input type="text" className="input" placeholder="Ex: Ensolarado, 28°C"
                    value={form.clima} onChange={(e) => setForm({ ...form, clima: e.target.value })} />
                </div>
                <div className="modal-botoes">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-salvar">Salvar registro</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Caderno;