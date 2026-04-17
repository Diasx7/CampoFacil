import { useState } from "react";
import Sidebar from "../components/Sidebar";
import MapaTalhoes from "./MapaTalhoes";
import "./Talhoes.css";

// talhoes de exemplo, depois vai vir do banco de dados
const talhoesIniciais = [
  { id: 1, nome: "Talhão Norte", cultura: "Milho silagem", area: 24, cor: "#639922", status: "Em crescimento" },
  { id: 2, nome: "Talhão Sul", cultura: "Soja", area: 18, cor: "#378ADD", status: "Cobertura hoje" },
  { id: 3, nome: "Milharal Leste", cultura: "Milho grão", area: 20, cor: "#EF9F27", status: "Plantado" },
  { id: 4, nome: "Área Reserva", cultura: "Sem plantio", area: 25, cor: "#B4B2A9", status: "Planejando" },
];

function Talhoes({ irPara }) {
  const [talhoes, setTalhoes] = useState(talhoesIniciais);
  const [talhaoCerto, setTalhaoCerto] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaCultura, setNovaCultura] = useState("");
  const [areaMedida, setAreaMedida] = useState(null);

  function receberArea(area) {
    setAreaMedida(area);
    setMostrarForm(true);
  }

  function salvarTalhao(e) {
    e.preventDefault();
    if (!novoNome || !areaMedida) return;

    const novo = {
      id: talhoes.length + 1,
      nome: novoNome,
      cultura: novaCultura || "Sem plantio",
      area: areaMedida,
      cor: "#639922",
      status: "Planejando",
    };

    setTalhoes([...talhoes, novo]);
    setMostrarForm(false);
    setNovoNome("");
    setNovaCultura("");
    setAreaMedida(null);
  }

  function cancelar() {
    setMostrarForm(false);    setNovoNome("");
    setNovaCultura("");
    setAreaMedida(null);
  }

  return (
    <div className="talhoes-pagina">
      <Sidebar telaAtiva="talhoes" irPara={irPara} />

      <div className="talhoes-main">
        <div className="talhoes-header">
          <div>
            <h1 className="talhoes-titulo">Meus talhões</h1>
            <span className="talhoes-sub">Clique no mapa para desenhar um novo talhão</span>
          </div>
          <div className="talhoes-total">
            <span className="total-label">Área total cadastrada</span>
            <span className="total-val">
              {talhoes.reduce((acc, t) => acc + t.area, 0)} ha
            </span>
          </div>
        </div>

        <div className="talhoes-grid">
          <div className="mapa-wrapper">
            <MapaTalhoes onAreaMedida={receberArea} />

            <div className="mapa-dica">
              Clique nos pontos do mapa para desenhar o talhão — o app calcula os hectares automaticamente
            </div>

            {mostrarForm && (
              <div className="form-overlay">
                <div className="form-card">
                  <h3 className="form-titulo">Novo talhão</h3>
                  <p className="form-area-medida">
                    Área medida: <strong>{areaMedida} ha</strong>
                  </p>
                  <form onSubmit={salvarTalhao}>
                    <div className="campo">
                      <label className="label">Nome do talhão</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ex: Talhão Norte"
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="campo">
                      <label className="label">Cultura (opcional)</label>
                      <select
                        className="input"
                        value={novaCultura}
                        onChange={(e) => setNovaCultura(e.target.value)}
                      >
                        <option value="">Sem plantio</option>
                        <option>Milho silagem</option>
                        <option>Milho grão</option>
                        <option>Soja</option>
                        <option>Sorgo</option>
                        <option>Capim / Pastagem</option>
                        <option>Cana-de-açúcar</option>
                        <option>Hortifrutti</option>
                      </select>
                    </div>
                    <div className="form-botoes">
                      <button type="button" className="btn-cancelar" onClick={cancelar}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-salvar">
                        Salvar talhão
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="talhoes-lista">
            <div className="lista-header">
              <span className="lista-titulo">Talhões cadastrados</span>
              <span className="lista-count">{talhoes.length} talhões</span>
            </div>

            {talhoes.map((t) => (
              <div
                key={t.id}
                className={`talhao-card ${talhaoCerto === t.id ? "talhao-card-ativo" : ""}`}
                onClick={() => setTalhaoCerto(t.id === talhaoCerto ? null : t.id)}
              >
                <div className="talhao-cor" style={{ background: t.cor }}></div>
                <div className="talhao-info">
                  <div className="talhao-nome">{t.nome}</div>
                  <div className="talhao-detalhe">{t.cultura} · {t.area} ha</div>
                </div>
                <div className="talhao-direita">
                  <span className={`talhao-status status-${t.status === "Em crescimento" || t.status === "Plantado" ? "ok" : t.status === "Cobertura hoje" ? "warn" : "plan"}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Talhoes;