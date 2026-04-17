import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { culturas, listaCulturas } from "./dadosCulturas.js";
import "./Plantios.css";

// talhoes de exemplo, depois vem do banco
const talhoesDisponiveis = [
  { id: 1, nome: "Talhão Norte", area: 24 },
  { id: 2, nome: "Talhão Sul", area: 18 },
  { id: 3, nome: "Milharal Leste", area: 20 },
  { id: 4, nome: "Área Reserva", area: 25 },
];

function Plantios({ irPara }) {
  const [talhaoSelecionado, setTalhaoSelecionado] = useState(null);
  const [culturaSelecionada, setCulturaSelecionada] = useState("");
  const [precos, setPrecos] = useState({});
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const cultura = culturas[culturaSelecionada];
  const talhao = talhoesDisponiveis.find((t) => t.id === talhaoSelecionado);

  // calcula a quantidade de cada insumo pela area do talhao
  function calcularQuantidade(porHectare) {
    if (!talhao) return 0;
    return Math.round(porHectare * talhao.area * 10) / 10;
  }

  // calcula o custo de cada insumo
  function calcularCusto(insumo) {
    const preco = precos[insumo.nome] || insumo.precoReferencia;
    return Math.round(calcularQuantidade(insumo.porHectare) * preco * 100) / 100;
  }

  // custo total do plantio
  function custoTotal() {
    if (!cultura) return 0;
    return cultura.insumos.reduce((acc, insumo) => acc + calcularCusto(insumo), 0);
  }

  function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <div className="plantios-pagina">
      <Sidebar telaAtiva="plantios" irPara={irPara} />

      <div className="plantios-main">
        <div className="plantios-header">
          <div>
            <h1 className="plantios-titulo">Módulo de culturas</h1>
            <span className="plantios-sub">Selecione um talhão e uma cultura para calcular os insumos</span>
          </div>
        </div>

        <div className="plantios-grid">
          {/* painel esquerdo - selecao */}
          <div className="plantios-selecao">
            {/* selecionar talhao */}
            <div className="selecao-card">
              <div className="selecao-titulo">1. Selecione o talhão</div>
              <div className="talhao-lista">
                {talhoesDisponiveis.map((t) => (
                  <div
                    key={t.id}
                    className={`talhao-opcao ${talhaoSelecionado === t.id ? "talhao-opcao-ativo" : ""}`}
                    onClick={() => setTalhaoSelecionado(t.id)}
                  >
                    <div className="talhao-opcao-nome">{t.nome}</div>
                    <div className="talhao-opcao-area">{t.area} ha</div>
                  </div>
                ))}
              </div>
            </div>

            {/* selecionar cultura */}
            <div className="selecao-card">
              <div className="selecao-titulo">2. Selecione a cultura</div>
              <div className="cultura-lista">
                {listaCulturas.map((c) => (
                  <div
                    key={c}
                    className={`cultura-opcao ${culturaSelecionada === c ? "cultura-opcao-ativa" : ""}`}
                    onClick={() => setCulturaSelecionada(c)}
                  >
                    <div
                      className="cultura-cor"
                      style={{ background: culturas[c].cor }}
                    ></div>
                    <div>
                      <div className="cultura-nome">{c}</div>
                      <div className="cultura-ciclo">{culturas[c].ciclo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* painel direito - resultados */}
          <div className="plantios-resultado">
            {!talhaoSelecionado || !culturaSelecionada ? (
              <div className="resultado-vazio">
                <div className="resultado-vazio-icone">🌱</div>
                <p>Selecione um talhão e uma cultura para ver as recomendações calculadas</p>
              </div>
            ) : (
              <>
                {/* resumo */}
                <div className="resultado-resumo">
                  <div>
                    <div className="resumo-titulo">{talhao.nome} — {culturaSelecionada}</div>
                    <div className="resumo-sub">{talhao.area} ha · {cultura.ciclo} · {cultura.espacamento}</div>
                  </div>
                  <div className="resumo-custo">
                    <div className="custo-label">Custo estimado total</div>
                    <div className="custo-val">{formatarDinheiro(custoTotal())}</div>
                    <div className="custo-ha">{formatarDinheiro(custoTotal() / talhao.area)} / ha</div>
                  </div>
                </div>

                {/* tabela de insumos */}
                <div className="insumos-card">
                  <div className="insumos-header">
                    <span className="insumos-titulo">Insumos necessários</span>
                    <span className="insumos-sub-titulo">Ajuste os preços conforme sua região</span>
                  </div>

                  <div className="insumos-tabela">
                    <div className="tabela-cabecalho">
                      <span>Insumo</span>
                      <span>Qtd / ha</span>
                      <span>Total ({talhao.area} ha)</span>
                      <span>Preço unit.</span>
                      <span>Custo total</span>
                    </div>

                    {cultura.insumos.map((insumo) => (
                      <div key={insumo.nome} className="tabela-linha">
                        <span className="insumo-nome">{insumo.nome}</span>
                        <span className="insumo-qtd">
                          {insumo.porHectare} {insumo.unidade}
                        </span>
                        <span className="insumo-total">
                          <strong>{calcularQuantidade(insumo.porHectare)}</strong> {insumo.unidade}
                        </span>
                        <span className="insumo-preco">
                          <span className="preco-prefixo">R$</span>
                          <input
                            type="number"
                            className="preco-input"
                            value={precos[insumo.nome] ?? insumo.precoReferencia}
                            onChange={(e) =>
                              setPrecos({ ...precos, [insumo.nome]: parseFloat(e.target.value) || 0 })
                            }
                            step="0.01"
                          />
                        </span>
                        <span className="insumo-custo">
                          {formatarDinheiro(calcularCusto(insumo))}
                        </span>
                      </div>
                    ))}

                    <div className="tabela-total">
                      <span>Total estimado</span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span className="total-valor">{formatarDinheiro(custoTotal())}</span>
                    </div>
                  </div>
                </div>

                {/* calendario */}
                <div className="calendario-card">
                  <div
                    className="calendario-header"
                    onClick={() => setMostrarCalendario(!mostrarCalendario)}
                  >
                    <span className="calendario-titulo">Calendário de atividades</span>
                    <span className="calendario-toggle">{mostrarCalendario ? "▲" : "▼"}</span>
                  </div>

                  {mostrarCalendario && (
                    <div className="calendario-lista">
                      {cultura.calendario.map((etapa, i) => (
                        <div key={i} className="calendario-item">
                          <div className="calendario-num">{i + 1}</div>
                          <div>
                            <div className="calendario-etapa">{etapa.etapa}</div>
                            <div className="calendario-quando">{etapa.quando}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Plantios;