import Sidebar from "../../components/Sidebar";
import "./Dashboard.css";

const talhoes = [
  { nome: "Talhão Norte", cultura: "Milho silagem", area: 24, cor: "#639922", status: "Em crescimento", statusTipo: "ok" },
  { nome: "Talhão Sul", cultura: "Soja", area: 18, cor: "#378ADD", status: "Cobertura hoje", statusTipo: "warn" },
  { nome: "Milharal Leste", cultura: "Milho grão", area: 20, cor: "#EF9F27", status: "Plantado", statusTipo: "ok" },
  { nome: "Área Reserva", cultura: "Sem plantio", area: 25, cor: "#B4B2A9", status: "Planejando", statusTipo: "plan" },
];

const estoque = [
  { nome: "Ureia", pct: 12 },
  { nome: "NPK 08-28-16", pct: 58 },
  { nome: "Atrazina (herbicida)", pct: 22 },
  { nome: "Sementes milho", pct: 75 },
];

const atividades = [
  { data: "hoje", texto: "Plantio iniciado", talhao: "Milharal Leste" },
  { data: "12/04", texto: "Herbicida aplicado", talhao: "Talhão Norte" },
  { data: "10/04", texto: "Adubo de plantio", talhao: "Milharal Leste · 700 kg NPK" },
  { data: "08/04", texto: "Análise de solo concluída", talhao: "Área Reserva" },
];

function corEstoque(pct) {
  if (pct < 20) return "#E24B4A";
  if (pct < 35) return "#EF9F27";
  return "#639922";
}

function Dashboard({ irPara }) {
  return (
    <div className="dash-pagina">
      <Sidebar telaAtiva="dashboard" irPara={irPara} />

      <div className="dash-main">
        <div className="dash-topbar">
          <div>
            <h1 className="dash-titulo">Bom dia, João</h1>
            <span className="dash-data">Segunda-feira, 14 de abril de 2026</span>
          </div>
          <div className="dash-topbar-direito">
            <div className="badge-clima">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" fill="#EF9F27" />
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1l1.1-1.1M10 4l1.1-1.1" stroke="#EF9F27" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              28°C · Uberlândia, MG
            </div>
            <div className="badge-alerta">2 alertas</div>
          </div>
        </div>

        <div className="dash-metrics">
          <div className="metric-card">
            <div className="metric-label">Área total</div>
            <div className="metric-val">87 ha</div>
            <div className="metric-sub neutro">4 talhões cadastrados</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Safra atual</div>
            <div className="metric-val">62 ha</div>
            <div className="metric-sub positivo">71% da área em uso</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Gasto na safra</div>
            <div className="metric-val">R$ 41.200</div>
            <div className="metric-sub negativo">+8% vs safra anterior</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Estoque crítico</div>
            <div className="metric-val">3 itens</div>
            <div className="metric-sub negativo">Atenção necessária</div>
          </div>
        </div>

        <div className="dash-grid2">
          <div className="card">
            <div className="card-header">
              <span className="card-titulo">Meus talhões</span>
              <span className="card-link">ver mapa →</span>
            </div>
            {talhoes.map((t) => (
              <div key={t.nome} className="talhao-row">
                <div className="talhao-dot" style={{ background: t.cor }}></div>
                <div className="talhao-info">
                  <div className="talhao-nome">{t.nome}</div>
                  <div className="talhao-cultura">{t.cultura} · {t.area} ha</div>
                </div>
                <span className={`badge badge-${t.statusTipo}`}>{t.status}</span>
              </div>
            ))}
          </div>

          <div className="dash-col-direita">
            <div className="card">
              <div className="card-header">
                <span className="card-titulo">Previsão do tempo</span>
              </div>
              <div className="clima-row">
                {[
                  { dia: "Hoje", temp: 28, tipo: "sol" },
                  { dia: "Ter", temp: 25, tipo: "parcial" },
                  { dia: "Qua", temp: 21, tipo: "chuva" },
                  { dia: "Qui", temp: 19, tipo: "chuva" },
                  { dia: "Sex", temp: 27, tipo: "sol" },
                ].map((d) => (
                  <div key={d.dia} className="dia-clima">
                    <span className="dia-nome">{d.dia}</span>
                    <div className="clima-icone">
                      {d.tipo === "sol" && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="10" cy="10" r="4" fill="#EF9F27" />
                        </svg>
                      )}
                      {d.tipo === "parcial" && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <circle cx="8" cy="9" r="3" fill="#EF9F27" />
                          <path d="M8 14 Q10 11 13 12 Q16 12 16 15 Q15 17 11 17 Q8 17 7 15 Q6 13 8 14Z" fill="#B4B2A9" />
                        </svg>
                      )}
                      {d.tipo === "chuva" && (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10 Q6 6 10 7 Q13 5 16 8 Q19 9 18 13 Q17 16 12 15 Q7 16 5 14 Q2 12 4 10Z" fill="#B4B2A9" />
                          <path d="M8 15 L7 18M11 15 L10 18M14 15 L13 18" stroke="#378ADD" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="dia-temp">{d.temp}°</span>
                  </div>
                ))}
              </div>
              <div className="clima-aviso">
                Chuva na quarta e quinta — evite aplicar defensivo nesses dias
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-titulo">Alertas da IA</span>
                <span className="card-link">ver todos →</span>
              </div>
              <div className="alerta-item">
                <div className="alerta-dot" style={{ background: "#E24B4A" }}></div>
                <div>
                  <div className="alerta-texto">Ureia acabando no estoque</div>
                  <div className="alerta-sub">Cobertura do Talhão Sul precisa de 175 kg esta semana</div>
                </div>
              </div>
              <div className="alerta-item">
                <div className="alerta-dot" style={{ background: "#EF9F27" }}></div>
                <div>
                  <div className="alerta-texto">Adubação de cobertura pendente</div>
                  <div className="alerta-sub">Talhão Sul · prazo recomendado: hoje</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid2">
          <div className="card">
            <div className="card-header">
              <span className="card-titulo">Estoque de insumos</span>
              <span className="card-link">gerenciar →</span>
            </div>
            {estoque.map((e) => (
              <div key={e.nome} className="bar-wrap">
                <div className="bar-label">
                  <span>{e.nome}</span>
                  <span style={{ color: corEstoque(e.pct) }}>{e.pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${e.pct}%`, background: corEstoque(e.pct) }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-titulo">Últimas atividades</span>
              <span className="card-link">ver caderno →</span>
            </div>
            {atividades.map((a, i) => (
              <div key={i} className="atividade-row">
                <div className="ativ-data">{a.data}</div>
                <div>
                  <div className="ativ-texto">{a.texto}</div>
                  <div className="ativ-talhao">{a.talhao}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;