import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Caderno.css";

const talhoes = ["Todos", "Talhão Norte", "Talhão Sul", "Milharal Leste", "Área Reserva"];

const tiposAtividade = [
  "Plantio",
  "Adubação",
  "Herbicida",
  "Inseticida",
  "Fungicida",
  "Irrigação",
  "Colheita",
  "Manutenção",
  "Análise de solo",
  "Outro",
];

// registros de exemplo
const registrosIniciais = [
  {
    id: 1,
    data: "2026-04-14",
    tipo: "Plantio",
    talhao: "Milharal Leste",
    descricao: "Plantio de milho grão iniciado. Utilizado semente DKB 390 PRO3.",
    insumos: "110 sacas de semente, 7000 kg NPK 08-28-16",
    clima: "Ensolarado, 28°C",
  },
  {
    id: 2,
    data: "2026-04-12",
    tipo: "Herbicida",
    talhao: "Talhão Norte",
    descricao: "Aplicação de Atrazina em pré-emergência.",
    insumos: "84 L de Atrazina",
    clima: "Nublado, 24°C, sem vento",
  },
  {
    id: 3,
    data: "2026-04-10",
    tipo: "Adubação",
    talhao: "Milharal Leste",
    descricao: "Adubação de plantio com NPK 08-28-16.",
    insumos: "700 kg NPK",
    clima: "Ensolarado, 26°C",
  },
  {
    id: 4,
    data: "2026-04-08",
    tipo: "Análise de solo",
    talhao: "Área Reserva",
    descricao: "Coleta de amostras de solo enviadas para laboratório. Resultado previsto para 30 dias.",
    insumos: "-",
    clima: "Parcialmente nublado, 25°C",
  },
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
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function Caderno({ irPara }) {
  const [registros, setRegistros] = useState(registrosIniciais);
  const [filtroTalhao, setFiltroTalhao] = useState("Todos");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    tipo: "Plantio",
    talhao: "Talhão Norte",
    descricao: "",
    insumos: "",
    clima: "",
  });

  // filtra os registros
  const registrosFiltrados = registros
    .filter((r) => filtroTalhao === "Todos" || r.talhao === filtroTalhao)
    .filter((r) => filtroTipo === "Todos" || r.tipo === filtroTipo)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  function salvarRegistro(e) {
    e.preventDefault();
    const novo = {
      id: registros.length + 1,
      ...form,
    };
    setRegistros([...registros, novo]);
    setMostrarForm(false);
    setForm({
      data: new Date().toISOString().split("T")[0],
      tipo: "Plantio",
      talhao: "Talhão Norte",
      descricao: "",
      insumos: "",
      clima: "",
    });
  }

  return (
    <div className="caderno-pagina">
      <Sidebar telaAtiva="caderno" irPara={irPara} />

      <div className="caderno-main">
        <div className="caderno-header">
          <div>
            <h1 className="caderno-titulo">Caderno de campo</h1>
            <span className="caderno-sub">Registro de todas as atividades realizadas na propriedade</span>
          </div>
          <button className="btn-novo-registro" onClick={() => setMostrarForm(true)}>
            + Novo registro
          </button>
        </div>

        {/* cards de resumo */}
        <div className="caderno-metrics">
          <div className="metric-card">
            <div className="metric-label">Total de registros</div>
            <div className="metric-val">{registros.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Este mês</div>
            <div className="metric-val">
              {registros.filter((r) => r.data.startsWith("2026-04")).length}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Último registro</div>
            <div className="metric-val" style={{ fontSize: "16px" }}>
              {registros.length > 0
                ? formatarData(registros.sort((a, b) => new Date(b.data) - new Date(a.data))[0].data)
                : "-"}
            </div>
          </div>
        </div>

        {/* filtros */}
        <div className="caderno-filtros">
          <div className="filtro-grupo">
            <span className="filtro-label">Talhão:</span>
            <div className="filtro-btns">
              {talhoes.map((t) => (
                <button
                  key={t}
                  className={`filtro-btn ${filtroTalhao === t ? "filtro-btn-ativo" : ""}`}
                  onClick={() => setFiltroTalhao(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="filtro-grupo">
            <span className="filtro-label">Tipo:</span>
            <div className="filtro-btns">
              {["Todos", ...tiposAtividade].map((t) => (
                <button
                  key={t}
                  className={`filtro-btn ${filtroTipo === t ? "filtro-btn-ativo" : ""}`}
                  onClick={() => setFiltroTipo(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* lista de registros */}
        <div className="registros-lista">
          {registrosFiltrados.length === 0 ? (
            <div className="registros-vazio">Nenhum registro encontrado.</div>
          ) : (
            registrosFiltrados.map((r) => {
              const cores = coresAtividade[r.tipo] || coresAtividade["Outro"];
              return (
                <div
                  key={r.id}
                  className={`registro-card ${expandido === r.id ? "registro-card-expandido" : ""}`}
                  onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                >
                  <div className="registro-linha">
                    <div className="registro-data">{formatarData(r.data)}</div>
                    <span
                      className="registro-tipo"
                      style={{ background: cores.bg, color: cores.cor }}
                    >
                      {r.tipo}
                    </span>
                    <div className="registro-talhao">{r.talhao}</div>
                    <div className="registro-descricao-resumo">{r.descricao}</div>
                    <div className="registro-seta">{expandido === r.id ? "▲" : "▼"}</div>
                  </div>

                  {expandido === r.id && (
                    <div className="registro-detalhe">
                      <div className="detalhe-item">
                        <span className="detalhe-label">Descrição</span>
                        <span className="detalhe-valor">{r.descricao}</span>
                      </div>
                      {r.insumos && r.insumos !== "-" && (
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

        {/* modal novo registro */}
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
                    <select className="input" value={form.tipo}
                      onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                      {tiposAtividade.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Talhão</label>
                  <select className="input" value={form.talhao}
                    onChange={(e) => setForm({ ...form, talhao: e.target.value })}>
                    {talhoes.filter((t) => t !== "Todos").map((t) => <option key={t}>{t}</option>)}
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