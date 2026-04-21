import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Clima from "../../components/Clima";
import api from "../../api";
import "./Dashboard.css";

function corEstoque(pct) {
  if (pct < 20) return "#E24B4A";
  if (pct < 35) return "#EF9F27";
  return "#639922";
}

// gera alertas inteligentes baseado nos dados reais
function gerarAlertas(talhoes, estoque, atividades, transacoes) {
  const alertas = [];

  // verifica estoque critico
  estoque.forEach((item) => {
    const pct = parseFloat(item.minimo) > 0
      ? (parseFloat(item.quantidade) / parseFloat(item.minimo)) * 100
      : 100;

    if (parseFloat(item.quantidade) === 0) {
      alertas.push({
        tipo: "critico",
        texto: `${item.nome} zerado no estoque`,
        sub: `Estoque mínimo recomendado: ${item.minimo} ${item.unidade}`,
        cor: "#E24B4A",
      });
    } else if (pct < 30) {
      alertas.push({
        tipo: "atencao",
        texto: `${item.nome} com estoque baixo (${Math.round(pct)}%)`,
        sub: `Restam ${item.quantidade} ${item.unidade} — mínimo: ${item.minimo} ${item.unidade}`,
        cor: "#EF9F27",
      });
    }
  });

  // verifica talhoes sem atividade nos ultimos 30 dias
  const hoje = new Date();
  talhoes.forEach((talhao) => {
    if (talhao.cultura && talhao.cultura !== "Sem plantio") {
      const ultimaAtividade = atividades.find((a) => a.talhao === talhao.nome);
      if (!ultimaAtividade) {
        alertas.push({
          tipo: "info",
          texto: `Nenhuma atividade registrada em ${talhao.nome}`,
          sub: `Cultura: ${talhao.cultura} — considere registrar atividades`,
          cor: "#378ADD",
        });
      } else {
        const diasSemAtividade = Math.floor((hoje - new Date(ultimaAtividade.data)) / (1000 * 60 * 60 * 24));
        if (diasSemAtividade > 30) {
          alertas.push({
            tipo: "info",
            texto: `${talhao.nome} sem registro há ${diasSemAtividade} dias`,
            sub: `Última atividade: ${ultimaAtividade.tipo}`,
            cor: "#378ADD",
          });
        }
      }
    }
  });

  // verifica se tem mais gastos que receitas
  const totalReceitas = transacoes.filter((t) => t.tipo === "receita").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const totalGastos = transacoes.filter((t) => t.tipo === "gasto").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  if (totalGastos > totalReceitas && totalGastos > 0) {
    alertas.push({
      tipo: "atencao",
      texto: "Gastos maiores que receitas na safra",
      sub: `Déficit de ${(totalGastos - totalReceitas).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
      cor: "#EF9F27",
    });
  }

  // verifica talhoes sem cultura definida
  const semCultura = talhoes.filter((t) => !t.cultura || t.cultura === "Sem plantio");
  if (semCultura.length > 0) {
    alertas.push({
      tipo: "info",
      texto: `${semCultura.length} talhão(s) sem cultura definida`,
      sub: semCultura.map((t) => t.nome).join(", "),
      cor: "#378ADD",
    });
  }

  return alertas.slice(0, 5); // mostra no maximo 5 alertas
}

function Dashboard({ irPara }) {
  const [talhoes, setTalhoes] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const usuarioSalvo = localStorage.getItem('usuario');
  const usuario = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
  const primeiroNome = usuario?.nome?.split(' ')[0] || 'Produtor';

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resTalhoes, resEstoque, resCaderno, resFinanceiro] = await Promise.all([
          api.get('/talhoes'),
          api.get('/estoque'),
          api.get('/caderno'),
          api.get('/financeiro'),
        ]);
        setTalhoes(resTalhoes.data);
        setEstoque(resEstoque.data);
        setAtividades(resCaderno.data);
        setTransacoes(resFinanceiro.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  const areaTotal = talhoes.reduce((acc, t) => acc + parseFloat(t.area || 0), 0).toFixed(1);
  const areaEmUso = talhoes.filter((t) => t.cultura && t.cultura !== "Sem plantio")
    .reduce((acc, t) => acc + parseFloat(t.area || 0), 0).toFixed(1);
  const totalGastos = transacoes.filter((t) => t.tipo === "gasto").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const itensCriticos = estoque.filter((i) => {
    const pct = parseFloat(i.minimo) > 0 ? (parseFloat(i.quantidade) / parseFloat(i.minimo)) * 100 : 100;
    return parseFloat(i.quantidade) === 0 || pct < 30;
  });

  // gera alertas inteligentes
  const alertas = gerarAlertas(talhoes, estoque, atividades, transacoes);

  function formatarData(data) {
    if (!data) return "";
    const d = new Date(data);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
  }

  function statusTipo(status) {
    if (status === "Em crescimento" || status === "Plantado") return "ok";
    if (status === "Cobertura hoje") return "warn";
    return "plan";
  }

  const ultimasAtividades = [...atividades].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 4);

  return (
    <div className="dash-pagina">
      <Sidebar telaAtiva="dashboard" irPara={irPara} />

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-titulo">Bom dia, {primeiroNome}</h1>
            <span className="dash-data">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <div className="dash-topbar-direito">
            {alertas.length > 0 && (
              <div className="badge-alerta" onClick={() => irPara("estoque")}>
                {alertas.length} alerta{alertas.length > 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        {carregando ? (
          <p style={{ fontSize: "14px", color: "#888" }}>Carregando dados...</p>
        ) : (
          <>
            <div className="dash-metrics">
              <div className="metric-card">
                <div className="metric-label">Área total</div>
                <div className="metric-val">{areaTotal} ha</div>
                <div className="metric-sub neutro">{talhoes.length} talhões cadastrados</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Safra atual</div>
                <div className="metric-val">{areaEmUso} ha</div>
                <div className={`metric-sub ${areaEmUso > 0 ? "positivo" : "neutro"}`}>
                  {areaTotal > 0 ? Math.round((areaEmUso / areaTotal) * 100) : 0}% da área em uso
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Gasto na safra</div>
                <div className="metric-val">
                  {totalGastos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Alertas ativos</div>
                <div className="metric-val">{alertas.length}</div>
                <div className={`metric-sub ${alertas.length > 0 ? "negativo" : "positivo"}`}>
                  {alertas.length > 0 ? "Atenção necessária" : "Tudo ok"}
                </div>
              </div>
            </div>

            <div className="grid2">
              {/* talhoes */}
              <div className="card">
                <div className="card-header">
                  <span className="card-titulo">Meus talhões</span>
                  <span className="card-link" onClick={() => irPara("talhoes")}>ver mapa →</span>
                </div>
                {talhoes.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#888" }}>Nenhum talhão cadastrado ainda.</p>
                ) : (
                  talhoes.slice(0, 4).map((t) => (
                    <div key={t.id} className="talhao-row">
                      <div className="talhao-dot" style={{ background: t.cor || "#639922" }}></div>
                      <div className="talhao-info">
                        <div className="talhao-nome">{t.nome}</div>
                        <div className="talhao-cultura">{t.cultura} · {t.area} ha</div>
                      </div>
                      <span className={`badge badge-${statusTipo(t.status)}`}>{t.status}</span>
                    </div>
                  ))
                )}
              </div>

              {/* clima + alertas */}
              <div className="dash-col-direita">
                <div className="card">
                  <div className="card-header">
                    <span className="card-titulo">Previsão do tempo</span>
                  </div>
                  <Clima />
                </div>

                {alertas.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-titulo">Alertas</span>
                      <span className="card-link" onClick={() => irPara("estoque")}>ver estoque →</span>
                    </div>
                    {alertas.map((a, i) => (
                      <div key={i} className="alerta-item">
                        <div className="alerta-dot" style={{ background: a.cor }}></div>
                        <div>
                          <div className="alerta-texto">{a.texto}</div>
                          <div className="alerta-sub">{a.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* estoque */}
              <div className="card">
                <div className="card-header">
                  <span className="card-titulo">Estoque de insumos</span>
                  <span className="card-link" onClick={() => irPara("estoque")}>gerenciar →</span>
                </div>
                {estoque.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#888" }}>Nenhum item no estoque ainda.</p>
                ) : (
                  estoque.slice(0, 4).map((e) => {
                    const pct = parseFloat(e.minimo) > 0
                      ? Math.min(Math.round((parseFloat(e.quantidade) / parseFloat(e.minimo)) * 100), 100)
                      : 100;
                    return (
                      <div key={e.id} className="bar-wrap">
                        <div className="bar-label">
                          <span>{e.nome}</span>
                          <span style={{ color: corEstoque(pct) }}>{pct}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%`, background: corEstoque(pct) }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* atividades */}
              <div className="card">
                <div className="card-header">
                  <span className="card-titulo">Últimas atividades</span>
                  <span className="card-link" onClick={() => irPara("caderno")}>ver caderno →</span>
                </div>
                {ultimasAtividades.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#888" }}>Nenhuma atividade registrada ainda.</p>
                ) : (
                  ultimasAtividades.map((a) => (
                    <div key={a.id} className="atividade-row">
                      <div className="ativ-data">{formatarData(a.data)}</div>
                      <div>
                        <div className="ativ-texto">{a.tipo}</div>
                        <div className="ativ-talhao">{a.talhao}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;