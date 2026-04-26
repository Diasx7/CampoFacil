import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import useTalhoes from "../hooks/useTalhoes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [abaAtiva, setAbaAtiva] = useState("lancamentos");
  const [filtroSafra, setFiltroSafra] = useState("todas");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tipoForm, setTipoForm] = useState("gasto");

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

  // anos disponiveis pra filtrar por safra
  const anosDisponiveis = [...new Set(transacoes.map((t) => new Date(t.data).getFullYear()))].sort().reverse();

  const transacoesFiltradas = transacoes
    .filter((t) => filtroTipo === "todos" || t.tipo === filtroTipo)
    .filter((t) => filtroSafra === "todas" || new Date(t.data).getFullYear() === parseInt(filtroSafra))
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const dadosBarras = categoriasGasto.map((cat) => ({
    nome: cat,
    valor: transacoes.filter((t) => t.tipo === "gasto" && t.categoria === cat)
      .reduce((acc, t) => acc + parseFloat(t.valor), 0),
  })).filter((c) => c.valor > 0);

  const dadosLinha = () => {
    const porMes = {};
    transacoes.forEach((t) => {
      const d = new Date(t.data);
      const chave = `${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
      if (!porMes[chave]) porMes[chave] = { mes: chave, receitas: 0, gastos: 0 };
      if (t.tipo === "receita") porMes[chave].receitas += parseFloat(t.valor);
      else porMes[chave].gastos += parseFloat(t.valor);
    });
    return Object.values(porMes).sort((a, b) => {
      const [ma, ya] = a.mes.split("/");
      const [mb, yb] = b.mes.split("/");
      return new Date(`${ya}-${ma}-01`) - new Date(`${yb}-${mb}-01`);
    }).map((m) => ({ ...m, saldo: m.receitas - m.gastos }));
  };

  // gera o relatorio em PDF
  function gerarPDF() {
    const doc = new jsPDF();
    const usuarioSalvo = localStorage.getItem('usuario');
    const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    const dataAtual = new Date().toLocaleDateString('pt-BR');

    // cabecalho
    doc.setFillColor(26, 58, 42);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CampoFácil', 14, 15);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Relatório Financeiro', 14, 23);
    doc.setFontSize(9);
    doc.text(`Gerado em ${dataAtual}`, 14, 30);
    if (usuario?.nome_propriedade) {
      doc.text(usuario.nome_propriedade, 196, 30, { align: 'right' });
    }

    // resumo
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo', 14, 48);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // cards de resumo
    const cards = [
      { label: 'Total de Receitas', valor: formatarDinheiro(totalReceitas), cor: [39, 107, 79] },
      { label: 'Total de Gastos', valor: formatarDinheiro(totalGastos), cor: [163, 45, 45] },
      { label: 'Saldo', valor: formatarDinheiro(saldo), cor: saldo >= 0 ? [39, 107, 79] : [163, 45, 45] },
    ];

    cards.forEach((card, i) => {
      const x = 14 + i * 62;
      doc.setFillColor(247, 250, 245);
      doc.roundedRect(x, 53, 58, 22, 3, 3, 'F');
      doc.setTextColor(136, 136, 136);
      doc.setFontSize(8);
      doc.text(card.label, x + 5, 61);
      doc.setTextColor(...card.cor);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(card.valor, x + 5, 70);
      doc.setFont('helvetica', 'normal');
    });

    // tabela de lancamentos
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Lançamentos', 14, 90);

    const linhas = transacoes
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .map((t) => [
        formatarData(t.data),
        t.descricao,
        t.categoria,
        t.talhao,
        t.tipo === "receita" ? "Receita" : "Gasto",
        formatarDinheiro(t.valor),
      ]);

    autoTable(doc, {
      startY: 94,
      head: [['Data', 'Descrição', 'Categoria', 'Talhão', 'Tipo', 'Valor']],
      body: linhas,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [26, 58, 42], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [247, 250, 245] },
      columnStyles: {
        4: { cellWidth: 20 },
        5: { cellWidth: 28, halign: 'right' },
      },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === 'body') {
          data.cell.styles.textColor = data.cell.raw === 'Receita' ? [39, 107, 79] : [163, 45, 45];
        }
      },
    });

    // gastos por categoria
    if (dadosBarras.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('Gastos por categoria', 14, finalY);

      autoTable(doc, {
        startY: finalY + 4,
        head: [['Categoria', 'Total', '% do total']],
        body: dadosBarras.map((c) => [
          c.cat,
          formatarDinheiro(c.total),
          `${Math.round((c.total / totalGastos) * 100)}%`,
        ]),
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [26, 58, 42], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [247, 250, 245] },
      });
    }

    // rodape
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(170, 170, 170);
      doc.text(`Página ${i} de ${pageCount} — CampoFácil`, 105, 290, { align: 'center' });
    }

    doc.save(`relatorio-financeiro-${dataAtual.replace(/\//g, '-')}.pdf`);
  }

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

  const linhaData = dadosLinha();

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
            <button className="btn-pdf" onClick={gerarPDF}>📄 Exportar PDF</button>
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

        <div className="fin-abas">
          <button className={`fin-aba ${abaAtiva === "lancamentos" ? "fin-aba-ativa" : ""}`}
            onClick={() => setAbaAtiva("lancamentos")}>Lançamentos</button>
          <button className={`fin-aba ${abaAtiva === "graficos" ? "fin-aba-ativa" : ""}`}
            onClick={() => setAbaAtiva("graficos")}>Gráficos</button>
        </div>

        {abaAtiva === "lancamentos" && (
          <div className="fin-grid">
            <div className="fin-card">
              <div className="fin-card-header">
                <span className="fin-card-titulo">Lançamentos</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select className="input" style={{ height: "30px", fontSize: "12px", width: "110px" }}
                  value={filtroSafra} onChange={(e) => setFiltroSafra(e.target.value)}>
                  <option value="todas">Todos os anos</option>
                  {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
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
              {dadosBarras.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#888" }}>Nenhum gasto registrado.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dadosBarras} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                    <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "#888" }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatarDinheiro(v)} labelStyle={{ fontSize: 12 }} />
                    <Bar dataKey="valor" fill="#A32D2D" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {abaAtiva === "graficos" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="fin-card">
              <div className="fin-card-header">
                <span className="fin-card-titulo">Evolução mensal — receitas vs gastos</span>
              </div>
              {linhaData.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#888" }}>Nenhum dado ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={linhaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ec" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatarDinheiro(v)} />
                    <Bar dataKey="receitas" fill="#639922" radius={[4,4,0,0]} name="Receitas" />
                    <Bar dataKey="gastos" fill="#E24B4A" radius={[4,4,0,0]} name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="fin-card">
              <div className="fin-card-header">
                <span className="fin-card-titulo">Evolução do saldo</span>
              </div>
              {linhaData.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#888" }}>Nenhum dado ainda.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={linhaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4ec" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#888" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatarDinheiro(v)} />
                    <Line type="monotone" dataKey="saldo" stroke="#2d6a4f" strokeWidth={2} dot={{ fill: "#2d6a4f", r: 4 }} name="Saldo" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

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