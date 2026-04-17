import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./Estoque.css";

// estoque inicial de exemplo
const estoqueInicial = [
  { id: 1, nome: "Ureia", categoria: "Adubo", unidade: "kg", quantidade: 210, minimo: 500, preco: 3.2 },
  { id: 2, nome: "NPK 08-28-16", categoria: "Adubo", unidade: "kg", quantidade: 4060, minimo: 1000, preco: 2.8 },
  { id: 3, nome: "Atrazina", categoria: "Herbicida", unidade: "L", quantidade: 15.4, minimo: 20, preco: 18 },
  { id: 4, nome: "Sementes milho", categoria: "Semente", unidade: "sacas", quantidade: 82, minimo: 20, preco: 280 },
  { id: 5, nome: "Inseticida cupinicida", categoria: "Inseticida", unidade: "L", quantidade: 8, minimo: 5, preco: 45 },
  { id: 6, nome: "Calcário", categoria: "Correção", unidade: "kg", quantidade: 0, minimo: 2000, preco: 0.25 },
];

const categorias = ["Todos", "Adubo", "Herbicida", "Inseticida", "Semente", "Correção", "Fungicida"];

function Estoque({ irPara }) {
  const [itens, setItens] = useState(estoqueInicial);
  const [filtro, setFiltro] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarMovimento, setMostrarMovimento] = useState(null);
  const [form, setForm] = useState({ nome: "", categoria: "Adubo", unidade: "kg", quantidade: "", minimo: "", preco: "" });
  const [movimento, setMovimento] = useState({ tipo: "entrada", quantidade: "" });

  // filtra por categoria
  const itensFiltrados = filtro === "Todos" ? itens : itens.filter((i) => i.categoria === filtro);

  // calcula o nivel do estoque
  function nivelEstoque(item) {
    if (item.minimo === 0) return 100;
    return Math.min(Math.round((item.quantidade / item.minimo) * 100), 200);
  }

  function statusEstoque(item) {
    const pct = (item.quantidade / item.minimo) * 100;
    if (item.quantidade === 0) return "zerado";
    if (pct < 30) return "critico";
    if (pct < 80) return "atencao";
    return "ok";
  }

  function corBarra(item) {
    const s = statusEstoque(item);
    if (s === "zerado" || s === "critico") return "#E24B4A";
    if (s === "atencao") return "#EF9F27";
    return "#639922";
  }

  function salvarItem(e) {
    e.preventDefault();
    const novo = {
      id: itens.length + 1,
      nome: form.nome,
      categoria: form.categoria,
      unidade: form.unidade,
      quantidade: parseFloat(form.quantidade) || 0,
      minimo: parseFloat(form.minimo) || 0,
      preco: parseFloat(form.preco) || 0,
    };
    setItens([...itens, novo]);
    setMostrarForm(false);
    setForm({ nome: "", categoria: "Adubo", unidade: "kg", quantidade: "", minimo: "", preco: "" });
  }

  function salvarMovimento(e) {
    e.preventDefault();
    const qtd = parseFloat(movimento.quantidade) || 0;
    setItens(itens.map((item) => {
      if (item.id === mostrarMovimento) {
        const nova = movimento.tipo === "entrada"
          ? item.quantidade + qtd
          : Math.max(0, item.quantidade - qtd);
        return { ...item, quantidade: Math.round(nova * 10) / 10 };
      }
      return item;
    }));
    setMostrarMovimento(null);
    setMovimento({ tipo: "entrada", quantidade: "" });
  }

  // itens com estoque critico
  const itensCriticos = itens.filter((i) => statusEstoque(i) === "critico" || statusEstoque(i) === "zerado");

  // valor total em estoque
  const valorTotal = itens.reduce((acc, i) => acc + i.quantidade * i.preco, 0);

  return (
    <div className="estoque-pagina">
      <Sidebar telaAtiva="estoque" irPara={irPara} />

      <div className="estoque-main">
        <div className="estoque-header">
          <div>
            <h1 className="estoque-titulo">Estoque de insumos</h1>
            <span className="estoque-sub">Controle o que você tem no galpão</span>
          </div>
          <button className="btn-novo-item" onClick={() => setMostrarForm(true)}>
            + Novo item
          </button>
        </div>

        {/* cards de resumo */}
        <div className="estoque-metrics">
          <div className="metric-card">
            <div className="metric-label">Total de itens</div>
            <div className="metric-val">{itens.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Estoque crítico</div>
            <div className="metric-val" style={{ color: itensCriticos.length > 0 ? "#A32D2D" : "#3B6D11" }}>
              {itensCriticos.length} itens
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Valor em estoque</div>
            <div className="metric-val">
              {valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
        </div>

        {/* alerta de itens criticos */}
        {itensCriticos.length > 0 && (
          <div className="alerta-critico">
            <strong>Atenção!</strong> {itensCriticos.map((i) => i.nome).join(", ")} {itensCriticos.length === 1 ? "está" : "estão"} com estoque crítico ou zerado.
          </div>
        )}

        {/* filtro de categorias */}
        <div className="filtro-categorias">
          {categorias.map((c) => (
            <button
              key={c}
              className={`filtro-btn ${filtro === c ? "filtro-btn-ativo" : ""}`}
              onClick={() => setFiltro(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* lista de itens */}
        <div className="estoque-lista">
          {itensFiltrados.map((item) => (
            <div key={item.id} className="estoque-item">
              <div className="item-info">
                <div className="item-nome">{item.nome}</div>
                <div className="item-categoria">{item.categoria}</div>
              </div>

              <div className="item-barra-wrap">
                <div className="item-barra-track">
                  <div
                    className="item-barra-fill"
                    style={{
                      width: `${Math.min(nivelEstoque(item), 100)}%`,
                      background: corBarra(item),
                    }}
                  ></div>
                </div>
                <div className="item-barra-labels">
                  <span className="item-quantidade" style={{ color: corBarra(item) }}>
                    {item.quantidade} {item.unidade}
                  </span>
                  <span className="item-minimo">mín: {item.minimo} {item.unidade}</span>
                </div>
              </div>

              <div className="item-valor">
                {(item.quantidade * item.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>

              <div className="item-acoes">
                <button
                  className="btn-entrada"
                  onClick={() => { setMostrarMovimento(item.id); setMovimento({ tipo: "entrada", quantidade: "" }); }}
                >
                  + Entrada
                </button>
                <button
                  className="btn-saida"
                  onClick={() => { setMostrarMovimento(item.id); setMovimento({ tipo: "saida", quantidade: "" }); }}
                >
                  − Saída
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* modal novo item */}
        {mostrarForm && (
          <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">Novo item no estoque</h3>
              <form onSubmit={salvarItem}>
                <div className="campo">
                  <label className="label">Nome do insumo</label>
                  <input type="text" className="input" placeholder="Ex: Glifosato" required
                    value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Categoria</label>
                    <select className="input" value={form.categoria}
                      onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                      {categorias.filter((c) => c !== "Todos").map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="campo">
                    <label className="label">Unidade</label>
                    <select className="input" value={form.unidade}
                      onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
                      <option>kg</option>
                      <option>L</option>
                      <option>sacas</option>
                      <option>ton</option>
                      <option>doses</option>
                    </select>
                  </div>
                </div>
                <div className="linha-2">
                  <div className="campo">
                    <label className="label">Quantidade atual</label>
                    <input type="number" className="input" placeholder="0" required
                      value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label className="label">Estoque mínimo</label>
                    <input type="number" className="input" placeholder="0"
                      value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} />
                  </div>
                </div>
                <div className="campo">
                  <label className="label">Preço unitário (R$)</label>
                  <input type="number" className="input" placeholder="0.00" step="0.01"
                    value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
                </div>
                <div className="modal-botoes">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarForm(false)}>Cancelar</button>
                  <button type="submit" className="btn-salvar">Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* modal movimento */}
        {mostrarMovimento && (
          <div className="modal-overlay" onClick={() => setMostrarMovimento(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">
                {movimento.tipo === "entrada" ? "Entrada de estoque" : "Saída de estoque"}
              </h3>
              <p className="modal-sub">
                {itens.find((i) => i.id === mostrarMovimento)?.nome}
              </p>
              <form onSubmit={salvarMovimento}>
                <div className="tipo-movimento">
                  <button
                    type="button"
                    className={`tipo-btn ${movimento.tipo === "entrada" ? "tipo-btn-ativo-entrada" : ""}`}
                    onClick={() => setMovimento({ ...movimento, tipo: "entrada" })}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    className={`tipo-btn ${movimento.tipo === "saida" ? "tipo-btn-ativo-saida" : ""}`}
                    onClick={() => setMovimento({ ...movimento, tipo: "saida" })}
                  >
                    − Saída
                  </button>
                </div>
                <div className="campo" style={{ marginTop: "1rem" }}>
                  <label className="label">Quantidade</label>
                  <input type="number" className="input" placeholder="0" required step="0.1"
                    value={movimento.quantidade}
                    onChange={(e) => setMovimento({ ...movimento, quantidade: e.target.value })} />
                </div>
                <div className="modal-botoes">
                  <button type="button" className="btn-cancelar" onClick={() => setMostrarMovimento(null)}>Cancelar</button>
                  <button type="submit" className="btn-salvar">Confirmar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Estoque;