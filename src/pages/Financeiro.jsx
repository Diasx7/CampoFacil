import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import useTalhoes from "../hooks/useTalhoes";
import "./Financeiro.css";

const categoriasGasto = ["Adubo", "Semente", "Defensivo", "Mão de obra", "Combustível", "Manutenção", "Outro"];
const categoriasReceita = ["Venda de grãos", "Venda de silagem", "Arrendamento", "Outro"];

function formatarDinheiro(valor) {
  return parseFloat(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data) {
  if (!data) return "";
  const d = new Date(data);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function Financeiro({ irPara }) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoForm, setTipoForm] = useState("gasto");

  // busca talhoes reais do usuario
  const { nomesDosTalhoes } = useTalhoes();
  const talhoesFiltro = ["Todos", ...nomesDosTalhoes];

  const [form, setForm] = useState({
    data: new Date().toISOString().split("T")[0],
    descricao: "",
    categoria: "Adubo",
    valor: "",
    talhao: "Todos",
  });

  useEffect(() => {
    buscarTransacoes();
  }, []);

  async function buscarTransacoes() {
    try {
      const resposta = await api.get('/financeiro');
      setTransacoes(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar financeiro:', err);
    } finally {
      setCarregando(false);
    }
  }

  const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalGastos = transacoes.filter((t) => t.tipo === "gasto").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const saldo = totalReceitas - totalGastos;

  const transacoesFiltradas = transacoes
    .filter((t) => filtroTipo === "todos" || t.tipo === filtroTipo)
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const gastosPorCategoria = categoriasGasto.map((cat) => {
    const total = transacoes.filter((t) => t.tipo === "gasto" && t.categoria === cat)
      .reduce((acc, t) => acc + parseFloat(t.valor), 0);
    return { cat, total };
  }).filter((c) => c.total > 0);

  const maxGasto = Math.max(...gastosPorCategoria.map((c) => c.total), 1);

  function abrirForm(tipo) {
    setTipoForm(tipo);
    setForm({
      data: new Date().toISOString().split("T")[0],
      descricao: "",
      categoria: tipo === "gasto" ? "Adubo" : "Venda de grãos",
      valor: "",
      talhao: nomesDosTalhoes[0] || "Todos",
    });
    setMostrarForm(true);
  }

  async function salvarTransacao(e) {
    e.preventDefault();
    try {
      const resposta = await api.post('/financeiro', {
        tipo: tipoForm, ...form, valor: parseFloat(form.valor) || 0,
      });
      setTransacoes([...transacoes, resposta.data]);
      setMostrarForm(false);
    } catch (err) {
      console.error('Erro ao salvar transação:', err);
    }
  }

  async function deletarTransacao(id) {
    try {
      await api.delete(`/financeiro/${id}`);
      setTransacoes(transacoes.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Erro ao deletar transação:', err);
    }
  }

  return (
    <div className="fin-pagina">
      <Sidebar telaAtiva="financeiro" irPara={irPara} />
      <div className="fin-main">
        <div className="fin-header">
          <div>
            <h1 className="fin-titulo">Financeiro</h1>
            <span className="fin-sub">Controle de gastos e receitas da propriedade</span>
          </div>
          <div className="fin-header-btns">
            <button className="btn-gasto" onClick={() => abrirForm("gasto")}>− Registrar gasto</button>
            <button className="btn-receita" onClick={() => abrirForm("receita")}>+ Registrar receita</button>
          </div>
        </div>

        <div className="fin-metrics">
          <div className="metric-card">
            <div className="metric-label">Total de receitas</div>
            <div className="metric-val positivo">{formatarDinheiro(totalReceitas)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total de gastos</div>
            <div className="metric-val negativo">{formatarDinheiro(totalGastos)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Saldo</div>
            <div className={`metric-val ${saldo >= 0 ? "positivo" : "negativo"}`}>{formatarDinheiro(saldo)}</div>
          </div>
        </div>

        <div className="fin-grid">
          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-titulo">Lançamentos</span>
              <div className="filtro-tipo">
                <button className={`filtro-tipo-btn ${filtroTipo === "todos" ? "filtro-tipo-ativo" : ""}`} onClick={() => setFiltroTipo("todos")}>Todos</button>
                <button className={`filtro-tipo-btn ${filtroTipo === "receita" ? "filtro-tipo-ativo-receita" : ""}`} onClick={() => setFiltroTipo("receita")}>Receitas</button>
                <button className={`filtro-tipo-btn ${filtroTipo === "gasto" ? "filtro-tipo-ativo-gasto" : ""}`} onClick={() => setFiltroTipo("gasto")}>Gastos</button>
              </div>
            </div>
            {carregando ? (
              <p style={{ fontSize: "13px", color: "#888" }}>Carregando...</p>
            ) : transacoesFiltradas.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#888", padding: "1rem 0" }}>Nenhum lançamento ainda.</p>
            ) : (
              transacoesFiltradas.map((t) => (
                <div key={t.id} className="transacao-row">
                  <div className={`transacao-icone ${t.tipo === "receita" ? "icone-receita" : "icone-gasto"}`}>
                    {t.tipo === "receita" ? "+" : "−"}
                  </div>
                  <div className="transacao-info">
                    <div className="transacao-descricao">{t.descricao}</div>
                    <div className="transacao-meta">{t.categoria} · {t.talhao} · {formatarData(t.data)}</div>
                  </div>
                  <div className={`transacao-valor ${t.tipo === "receita" ? "positivo" : "negativo"}`}>
                    {t.tipo === "receita" ? "+" : "−"} {formatarDinheiro(t.valor)}
                  </div>
                  <button className="btn-deletar-fin" onClick={() => deletarTransacao(t.id)}>✕</button>
                </div>
              ))
            )}
          </div>

          <div className="fin-card">
            <div className="fin-card-header">
              <span className="fin-card-titulo">Gastos por categoria</span>
            </div>
            {gastosPorCategoria.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#888" }}>Nenhum gasto registrado.</p>
            ) : (
              <>
                {gastosPorCategoria.map((c) => (
                  <div key={c.cat} className="categoria-row">
                    <div className="categoria-nome">{c.cat}</div>
                    <div className="categoria-barra-wrap">
                      <div className="categoria-barra-track">
                        <div className="categoria-barra-fill" style={{ width: `${(c.total / maxGasto) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="categoria-valor">{formatarDinheiro(c.total)}</div>
                  </div>
                ))}
                <div className="categoria-resumo">
                  {gastosPorCategoria.map((c) => (
                    <div key={c.cat} className="resumo-item">
                      <span className="resumo-nome">{c.cat}</span>
                      <span className="resumo-pct">{Math.round((c.total / totalGastos) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {mostrarForm && (
          <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">{tipoForm === "gasto" ? "Registrar gasto" : "Registrar receita"}</h3>
              <form onSubmit={salvarTransacao}>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Data</label>
                    <input type="date" className="input" required
                      value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label className="label">Valor (R$)</label>
                    <input type="number" className="input" placeholder="0,00" required step="0.01"
                      value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Descrição</label>
                  <input type="text" className="input" placeholder="Ex: Compra de ureia" required
                    value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                </div>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Categoria</label>
                    <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                      {(tipoForm === "gasto" ? categoriasGasto : categoriasReceita).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="campo">
                    <label className="label">Talhão</label>
                    <select className="input" value={form.talhao} onChange={(e) => setForm({ ...form, talhao: e.target.value })}>
                      {talhoesFiltro.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-botoes">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                  <button type="submit" className={tipoForm === "gasto" ? "btn-salvar-gasto" : "btn-salvar-receita"}>Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Financeiro;