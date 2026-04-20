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

function Dashboard({ irPara }) {
  const [talhoes, setTalhoes] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // pega o nome do usuario do localStorage
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
        setAtividades(resCaderno.data.slice(0, 4));
        setTransacoes(resFinanceiro.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setCarregando(false);
      }
    }
    carregarDados();
  }, []);

  // calculos
  const areaTotal = talhoes.reduce((acc, t) => acc + parseFloat(t.area || 0), 0).toFixed(1);
  const areaEmUso = talhoes.filter((t) => t.cultura && t.cultura !== "Sem plantio")
    .reduce((acc, t) => acc + parseFloat(t.area || 0), 0).toFixed(1);
  const totalGastos = transacoes.filter((t) => t.tipo === "gasto").reduce((acc, t) => acc + parseFloat(t.valor), 0);
  const itensCriticos = estoque.filter((i) => {
    const pct = (parseFloat(i.quantidade) / parseFloat(i.minimo)) * 100;
    return i.quantidade === 0 || pct < 30;
  });

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
            <div className="badge-clima">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" fill="#EF9F27" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1l1.1-1.1M10 4l1.1-1.1" stroke="#EF9F27" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Uberlândia, MG
            </div>
            {itensCriticos.length > 0 && (
              <div className="badge-alerta" onClick={() => irPara("estoque")}>
                {itensCriticos.length} alerta{itensCriticos.length > 1 ? "s" : ""}
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
                <div className="metric-label">Estoque crítico</div>
                <div className="metric-val">{itensCriticos.length} itens</div>
                <div className={`metric-sub ${itensCriticos.length > 0 ? "negativo" : "positivo"}`}>
                  {itensCriticos.length > 0 ? "Atenção necessária" : "Tudo ok"}
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

                {itensCriticos.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <span className="card-titulo">Alertas</span>
                      <span className="card-link" onClick={() => irPara("estoque")}>ver estoque →</span>
                    </div>
                    {itensCriticos.map((i) => (
                      <div key={i.id} className="alerta-item">
                        <div className="alerta-dot" style={{ background: "#E24B4A" }}></div>
                        <div>
                          <div className="alerta-texto">{i.nome} com estoque crítico</div>
                          <div className="alerta-sub">{i.quantidade} {i.unidade} · mín: {i.minimo} {i.unidade}</div>
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
                    const pct = e.minimo > 0 ? Math.min(Math.round((e.quantidade / e.minimo) * 100), 100) : 100;
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
                {atividades.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#888" }}>Nenhuma atividade registrada ainda.</p>
                ) : (
                  atividades.map((a) => (
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