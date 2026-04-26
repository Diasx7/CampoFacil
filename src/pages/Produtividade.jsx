import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import useTalhoes from "../hooks/useTalhoes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import "./Produtividade.css";

const safras = ["Todas", "2025/2026", "2024/2025", "2023/2024"];
const unidades = ["sacas", "sacas/ha", "toneladas", "kg"];

const coresTalhoes = {
  "Talhão Norte": "#639922",
  "Talhão Sul": "#378ADD",
  "Milharal Leste": "#EF9F27",
  "Área Reserva": "#B4B2A9",
};

// pega uma cor pra cada talhao dinamicamente
function getCorTalhao(nome, index) {
  const cores = ["#639922", "#378ADD", "#EF9F27", "#D85A30", "#534AB7", "#1D9E75"];
  return coresTalhoes[nome] || cores[index % cores.length];
}

function Produtividade({ irPara }) {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTalhao, setFiltroTalhao] = useState("Todos");
  const [abaAtiva, setAbaAtiva] = useState("tabela");
  const [mostrarForm, setMostrarForm] = useState(false);

  const { talhoes, nomesDosTalhoes } = useTalhoes();
  const talhoesFiltro = ["Todos", ...nomesDosTalhoes];

  const [form, setForm] = useState({
    talhao: "",
    cultura: "",
    safra: "2025/2026",
    area: "",
    producao: "",
    unidade: "sacas",
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
      const resposta = await api.get('/produtividade');
      setRegistros(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar produtividade:', err);
    } finally {
      setCarregando(false);
    }
  }

  const safraAtual = "2025/2026";
  const registrosFiltrados = registros.filter((r) => filtroTalhao === "Todos" || r.talhao === filtroTalhao);

  const ranking = registros
    .filter((r) => r.safra === safraAtual)
    .map((r) => ({ ...r, porHectare: r.unidade === "sacas/ha" ? r.producao : Math.round(r.producao / r.area) }))
    .sort((a, b) => b.porHectare - a.porHectare);

  const safrasUnicas = [...new Set(registros.map((r) => r.safra))];
  const talhoesUnicos = [...new Set(registros.map((r) => r.talhao))];

  // dados pro grafico de comparativo entre safras
  const dadosGrafico = safrasUnicas.map((safra) => {
    const obj = { safra };
    talhoesUnicos.forEach((talhao) => {
      const reg = registros.find((r) => r.safra === safra && r.talhao === talhao);
      obj[talhao] = reg ? parseFloat(reg.producao) : 0;
    });
    return obj;
  }).sort((a, b) => a.safra.localeCompare(b.safra));

  // quando selecionar talhao, preenche area e cultura automaticamente
  function selecionarTalhao(nomeTalhao) {
    const talhaoEncontrado = talhoes.find((t) => t.nome === nomeTalhao);
    setForm({
      ...form,
      talhao: nomeTalhao,
      area: talhaoEncontrado ? talhaoEncontrado.area : form.area,
      cultura: talhaoEncontrado?.cultura && talhaoEncontrado.cultura !== "Sem plantio"
        ? talhaoEncontrado.cultura
        : form.cultura,
    });
  }

  async function salvarRegistro(e) {
    e.preventDefault();
    try {
      const resposta = await api.post('/produtividade', {
        ...form, area: parseFloat(form.area), producao: parseFloat(form.producao),
      });
      setRegistros([...registros, resposta.data]);
      setMostrarForm(false);
      setForm({ talhao: nomesDosTalhoes[0] || "", cultura: "", safra: "2025/2026", area: "", producao: "", unidade: "sacas" });
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
    }
  }

  async function deletarRegistro(id) {
    try {
      await api.delete(`/produtividade/${id}`);
      setRegistros(registros.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Erro ao deletar registro:', err);
    }
  }

  return (
    <div className="prod-pagina">
      <Sidebar telaAtiva="produtividade" irPara={irPara} />
      <div className="prod-main">
        <div className="prod-header">
          <div>
            <h1 className="prod-titulo">Produtividade</h1>
            <span className="prod-sub">Acompanhe o resultado de cada talhão por safra</span>
          </div>
          <button className="btn-novo-registro" onClick={() => setMostrarForm(true)}>+ Registrar colheita</button>
        </div>

        <div className="prod-metrics">
          <div className="metric-card">
            <div className="metric-label">Registros totais</div>
            <div className="metric-val">{registros.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Safra atual</div>
            <div className="metric-val" style={{ fontSize: "16px" }}>{safraAtual}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Melhor talhão</div>
            <div className="metric-val" style={{ fontSize: "15px" }}>{ranking.length > 0 ? ranking[0].talhao : "-"}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Safras registradas</div>
            <div className="metric-val">{safrasUnicas.length}</div>
          </div>
        </div>

        {/* abas */}
        <div className="prod-abas">
          <button className={`prod-aba ${abaAtiva === "tabela" ? "prod-aba-ativa" : ""}`} onClick={() => setAbaAtiva("tabela")}>Tabela</button>
          <button className={`prod-aba ${abaAtiva === "grafico" ? "prod-aba-ativa" : ""}`} onClick={() => setAbaAtiva("grafico")}>Gráficos</button>
          <button className={`prod-aba ${abaAtiva === "ranking" ? "prod-aba-ativa" : ""}`} onClick={() => setAbaAtiva("ranking")}>Ranking</button>
        </div>

        {/* aba tabela */}
        {abaAtiva === "tabela" && (
          <div className="prod-card">
            <div className="prod-card-header">
              <span className="prod-card-titulo">Comparativo entre safras</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {talhoesFiltro.map((t) => (
                  <button key={t} className={`filtro-btn ${filtroTalhao === t ? "filtro-btn-ativo" : ""}`}
                    onClick={() => setFiltroTalhao(t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="tabela-comparativo">
              <div className="tabela-cab">
                <span>Talhão</span><span>Cultura</span><span>Safra</span>
                <span>Área</span><span>Produção</span><span>Unidade</span><span></span>
              </div>
              {carregando ? (
                <p style={{ fontSize: "13px", color: "#888", padding: "1rem 0" }}>Carregando...</p>
              ) : registrosFiltrados.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#888", padding: "1rem 0" }}>Nenhum registro encontrado.</p>
              ) : (
                registrosFiltrados.map((r, i) => (
                  <div key={r.id} className={`tabela-linha ${i % 2 === 0 ? "linha-par" : ""}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: coresTalhoes[r.talhao] || "#639922", flexShrink: 0 }}></div>
                      {r.talhao}
                    </span>
                    <span>{r.cultura}</span>
                    <span>{r.safra}</span>
                    <span>{r.area} ha</span>
                    <span style={{ fontWeight: 500, color: "#2d6a4f" }}>{r.producao}</span>
                    <span>{r.unidade}</span>
                    <span><button className="btn-del" onClick={() => deletarRegistro(r.id)}>✕</button></span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* aba grafico */}
        {abaAtiva === "grafico" && (
          <div className="prod-card">
            <div className="prod-card-header">
              <span className="prod-card-titulo">Produção por talhão e safra</span>
            </div>
            {dadosGrafico.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#888" }}>Nenhum dado ainda. Registre uma colheita!</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosGrafico} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ec" />
                  <XAxis dataKey="safra" tick={{ fontSize: 12, fill: "#888" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#888" }} />
                  <Tooltip />
                  <Legend />
                  {talhoesUnicos.map((talhao, i) => (
                    <Bar key={talhao} dataKey={talhao} fill={getCorTalhao(talhao, i)} radius={[4,4,0,0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* aba ranking */}
        {abaAtiva === "ranking" && (
          <div className="prod-card">
            <div className="prod-card-header">
              <span className="prod-card-titulo">Ranking — safra {safraAtual}</span>
            </div>
            {ranking.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#888" }}>Nenhum dado da safra atual ainda.</p>
            ) : (
              ranking.map((r, i) => (
                <div key={r.id} className="ranking-item">
                  <div className={`ranking-pos ${i === 0 ? "pos-1" : i === 1 ? "pos-2" : "pos-3"}`}>{i + 1}</div>
                  <div className="ranking-info">
                    <div className="ranking-nome">{r.talhao}</div>
                    <div className="ranking-cultura">{r.cultura} · {r.area} ha</div>
                  </div>
                  <div className="ranking-prod">
                    <div className="ranking-val">{r.producao} {r.unidade}</div>
                    <div className="ranking-area">{r.porHectare} por ha</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {mostrarForm && (
          <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">Registrar colheita</h3>
              <form onSubmit={salvarRegistro}>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Talhão</label>
                    <select className="input" value={form.talhao} onChange={(e) => selecionarTalhao(e.target.value)}>
                      {nomesDosTalhoes.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="campo">
                    <label className="label">Safra</label>
                    <select className="input" value={form.safra} onChange={(e) => setForm({ ...form, safra: e.target.value })}>
                      {safras.filter((s) => s !== "Todas").map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Cultura</label>
                  <input type="text" className="input" placeholder="Ex: Milho silagem" required
                    value={form.cultura} onChange={(e) => setForm({ ...form, cultura: e.target.value })} />
                </div>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Área (ha)</label>
                    <input type="number" className="input" placeholder="Ex: 24" required step="0.1"
                      value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label className="label">Produção</label>
                    <input type="number" className="input" placeholder="Ex: 960" required step="0.1"
                      value={form.producao} onChange={(e) => setForm({ ...form, producao: e.target.value })} />
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Unidade</label>
                  <select className="input" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
                    {unidades.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="modal-botoes">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-salvar">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Produtividade;