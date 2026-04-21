import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import "./Estoque.css";

const categorias = ["Todos", "Adubo", "Herbicida", "Inseticida", "Semente", "Correção", "Fungicida"];

function Estoque({ irPara }) {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("Todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarMovimento, setMostrarMovimento] = useState(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [form, setForm] = useState({ nome: "", categoria: "Adubo", unidade: "kg", quantidade: "", minimo: "", preco: "" });
  const [movimento, setMovimento] = useState({ tipo: "entrada", quantidade: "" });

  useEffect(() => {
    buscarEstoque();
  }, []);

  async function buscarEstoque() {
    try {
      const resposta = await api.get('/estoque');
      setItens(resposta.data);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setCarregando(false);
    }
  }

  async function verHistorico(id) {
    try {
      const resposta = await api.get(`/estoque/${id}/historico`);
      setHistorico(resposta.data);
      setMostrarHistorico(id);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  }

  // gera a lista de compras e abre no whatsapp
  function compartilharWhatsApp() {
    const itensBaixos = itens.filter((i) => {
      const pct = parseFloat(i.minimo) > 0
        ? (parseFloat(i.quantidade) / parseFloat(i.minimo)) * 100
        : 100;
      return parseFloat(i.quantidade) === 0 || pct < 50;
    });

    if (itensBaixos.length === 0) {
      alert('Nenhum item com estoque baixo no momento!');
      return;
    }

    const linhas = itensBaixos.map((i) => {
      const falta = Math.max(0, parseFloat(i.minimo) - parseFloat(i.quantidade));
      return "• " + i.nome + ": " + falta.toFixed(1) + " " + i.unidade;
    });

    const data = new Date().toLocaleDateString('pt-BR');
    const mensagem = "Lista de compras — CampoFácil\n\n" + linhas.join("\n") + "\n\nGerado em " + data;
    const url = "https://wa.me/?text=" + encodeURIComponent(mensagem);
    window.open(url, '_blank');
  }

  const itensFiltrados = filtro === "Todos" ? itens : itens.filter((i) => i.categoria === filtro);

  function nivelEstoque(item) {
    if (parseFloat(item.minimo) === 0) return 100;
    return Math.min(Math.round((parseFloat(item.quantidade) / parseFloat(item.minimo)) * 100), 200);
  }

  function statusEstoque(item) {
    const pct = (parseFloat(item.quantidade) / parseFloat(item.minimo)) * 100;
    if (parseFloat(item.quantidade) === 0) return "zerado";
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

  async function salvarItem(e) {
    e.preventDefault();
    try {
      const resposta = await api.post('/estoque', {
        nome: form.nome, categoria: form.categoria, unidade: form.unidade,
        quantidade: parseFloat(form.quantidade) || 0,
        minimo: parseFloat(form.minimo) || 0,
        preco: parseFloat(form.preco) || 0,
      });
      setItens([...itens, resposta.data]);
      setMostrarForm(false);
      setForm({ nome: "", categoria: "Adubo", unidade: "kg", quantidade: "", minimo: "", preco: "" });
    } catch (err) {
      console.error('Erro ao salvar item:', err);
    }
  }

  async function salvarMovimento(e) {
    e.preventDefault();
    const item = itens.find((i) => i.id === mostrarMovimento);
    const qtd = parseFloat(movimento.quantidade) || 0;
    const novaQtd = movimento.tipo === "entrada"
      ? parseFloat(item.quantidade) + qtd
      : Math.max(0, parseFloat(item.quantidade) - qtd);

    try {
      const resposta = await api.put(`/estoque/${mostrarMovimento}`, {
        quantidade: novaQtd,
        tipo: movimento.tipo,
      });
      setItens(itens.map((i) => i.id === mostrarMovimento ? resposta.data : i));
      setMostrarMovimento(null);
      setMovimento({ tipo: "entrada", quantidade: "" });
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err);
    }
  }

  async function deletarItem(id) {
    try {
      await api.delete(`/estoque/${id}`);
      setItens(itens.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Erro ao deletar item:', err);
    }
  }

  function formatarDataHora(data) {
    if (!data) return "";
    const d = new Date(data);
    return String(d.getDate()).padStart(2,"0") + "/" + String(d.getMonth()+1).padStart(2,"0") + " " + String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");
  }

  const itensCriticos = itens.filter((i) => statusEstoque(i) === "critico" || statusEstoque(i) === "zerado");
  const valorTotal = itens.reduce((acc, i) => acc + parseFloat(i.quantidade) * parseFloat(i.preco), 0);

  return (
    <div className="estoque-pagina">
      <Sidebar telaAtiva="estoque" irPara={irPara} />

      <div className="estoque-main">
        <div className="estoque-header">
          <div>
            <h1 className="estoque-titulo">Estoque de insumos</h1>
            <span className="estoque-sub">Controle o que você tem no galpão</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-whatsapp" onClick={compartilharWhatsApp}>📲 Lista de compras</button>
            <button className="btn-novo-item" onClick={() => setMostrarForm(true)}>+ Novo item</button>
          </div>
        </div>

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
            <div className="metric-val">{valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
          </div>
        </div>

        {itensCriticos.length > 0 && (
          <div className="alerta-critico">
            <strong>Atenção!</strong> {itensCriticos.map((i) => i.nome).join(", ")} {itensCriticos.length === 1 ? "está" : "estão"} com estoque crítico ou zerado.
          </div>
        )}

        <div className="filtro-categorias">
          {categorias.map((c) => (
            <button key={c} className={`filtro-btn ${filtro === c ? "filtro-btn-ativo" : ""}`} onClick={() => setFiltro(c)}>{c}</button>
          ))}
        </div>

        <div className="estoque-lista">
          {carregando ? (
            <p style={{ fontSize: "13px", color: "#888" }}>Carregando...</p>
          ) : itensFiltrados.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#888" }}>Nenhum item cadastrado ainda.</p>
          ) : (
            itensFiltrados.map((item) => (
              <div key={item.id} className="estoque-item">
                <div className="item-info">
                  <div className="item-nome">{item.nome}</div>
                  <div className="item-categoria">{item.categoria}</div>
                </div>
                <div className="item-barra-wrap">
                  <div className="item-barra-track">
                    <div className="item-barra-fill" style={{ width: `${Math.min(nivelEstoque(item), 100)}%`, background: corBarra(item) }}></div>
                  </div>
                  <div className="item-barra-labels">
                    <span className="item-quantidade" style={{ color: corBarra(item) }}>{item.quantidade} {item.unidade}</span>
                    <span className="item-minimo">mín: {item.minimo} {item.unidade}</span>
                  </div>
                </div>
                <div className="item-valor">
                  {(parseFloat(item.quantidade) * parseFloat(item.preco)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
                <div className="item-acoes">
                  <button className="btn-entrada" onClick={() => { setMostrarMovimento(item.id); setMovimento({ tipo: "entrada", quantidade: "" }); }}>+ Entrada</button>
                  <button className="btn-saida" onClick={() => { setMostrarMovimento(item.id); setMovimento({ tipo: "saida", quantidade: "" }); }}>− Saída</button>
                  <button className="btn-historico" onClick={() => verHistorico(item.id)}>Histórico</button>
                  <button className="btn-deletar-estoque" onClick={() => deletarItem(item.id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {mostrarHistorico && (
          <div className="modal-overlay" onClick={() => setMostrarHistorico(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">Histórico de movimentações</h3>
              <p className="modal-sub">{itens.find((i) => i.id === mostrarHistorico)?.nome}</p>
              {historico.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#888" }}>Nenhuma movimentação ainda.</p>
              ) : (
                <div className="historico-lista">
                  {historico.map((h) => (
                    <div key={h.id} className="historico-item">
                      <div className={`historico-tipo ${h.tipo === "entrada" ? "tipo-entrada" : "tipo-saida"}`}>
                        {h.tipo === "entrada" ? "+" : "−"}
                      </div>
                      <div className="historico-info">
                        <div className="historico-qtd">{h.tipo === "entrada" ? "+" : "−"}{h.quantidade} unidades</div>
                        <div className="historico-detalhe">{h.quantidade_anterior} → {h.quantidade_nova}</div>
                      </div>
                      <div className="historico-data">{formatarDataHora(h.criado_em)}</div>
                    </div>
                  ))}
                </div>
              )}
              <button className="btn-salvar" style={{ width: "100%", marginTop: "1rem" }} onClick={() => setMostrarHistorico(null)}>Fechar</button>
            </div>
          </div>
        )}

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
                    <select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                      {categorias.filter((c) => c !== "Todos").map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="campo">
                    <label className="label">Unidade</label>
                    <select className="input" value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value })}>
                      <option>kg</option><option>L</option><option>sacas</option><option>ton</option><option>doses</option>
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

        {mostrarMovimento && (
          <div className="modal-overlay" onClick={() => setMostrarMovimento(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-titulo">{movimento.tipo === "entrada" ? "Entrada de estoque" : "Saída de estoque"}</h3>
              <p className="modal-sub">{itens.find((i) => i.id === mostrarMovimento)?.nome}</p>
              <form onSubmit={salvarMovimento}>
                <div className="tipo-movimento">
                  <button type="button" className={`tipo-btn ${movimento.tipo === "entrada" ? "tipo-btn-ativo-entrada" : ""}`}
                    onClick={() => setMovimento({ ...movimento, tipo: "entrada" })}>+ Entrada</button>
                  <button type="button" className={`tipo-btn ${movimento.tipo === "saida" ? "tipo-btn-ativo-saida" : ""}`}
                    onClick={() => setMovimento({ ...movimento, tipo: "saida" })}>− Saída</button>
                </div>
                <div className="campo" style={{ marginTop: "1rem" }}>
                  <label className="label">Quantidade</label>
                  <input type="number" className="input" placeholder="0" required step="0.1"
                    value={movimento.quantidade} onChange={(e) => setMovimento({ ...movimento, quantidade: e.target.value })} />
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