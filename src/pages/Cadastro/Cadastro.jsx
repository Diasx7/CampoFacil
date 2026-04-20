import { useState } from "react";
import api from "../../api";
import "./Cadastro.css";

const CULTURAS = [
  "Milho silagem", "Milho grão", "Soja", "Sorgo",
  "Capim / Pastagem", "Cana-de-açúcar", "Hortifrutti",
];

function Cadastro({ irPara }) {
  const [passo, setPasso] = useState(1);
  const [culturasEscolhidas, setCulturasEscolhidas] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // dados do passo 1
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // dados do passo 2
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [estado, setEstado] = useState("");
  const [areaTotal, setAreaTotal] = useState("");

  function toggleCultura(cultura) {
    if (culturasEscolhidas.includes(cultura)) {
      setCulturasEscolhidas(culturasEscolhidas.filter((c) => c !== cultura));
    } else {
      setCulturasEscolhidas([...culturasEscolhidas, cultura]);
    }
  }

  function avancarPasso(e) {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    setErro("");
    setPasso(2);
  }

  async function handleCriarConta(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const resposta = await api.post('/auth/cadastro', {
        nome: `${nome} ${sobrenome}`,
        email,
        senha,
        nome_propriedade: nomePropriedade,
        estado,
        area_total: areaTotal,
      });

      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

      irPara("dashboard");
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="cadastro-pagina">
      <div className="cadastro-painel-esquerdo">
        <div className="cadastro-logo">
          <div className="cadastro-logo-icone">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L11.5 7H17L12.5 10.5L14 16.5L9 13L4 16.5L5.5 10.5L1 7H6.5L9 1.5Z" fill="#1a3a2a" />
            </svg>
          </div>
          <span className="cadastro-logo-texto">CampoFácil</span>
        </div>

        <div className="cadastro-painel-conteudo">
          {passo === 1 ? (
            <>
              <h1 className="cadastro-titulo">Crie sua conta<br />em 2 passos</h1>
              <p className="cadastro-sub">Rápido e gratuito. Sem cartão de crédito.</p>
            </>
          ) : (
            <>
              <h1 className="cadastro-titulo">Quase lá!<br />Só mais um passo</h1>
              <p className="cadastro-sub">Essas informações ajudam o app a calcular as recomendações certas pra você.</p>
            </>
          )}
          <div className="cadastro-pontos">
            <span className="ponto ponto-ativo"></span>
            <span className={`ponto ${passo === 2 ? "ponto-ativo" : ""}`}></span>
            <span className="ponto"></span>
          </div>
        </div>

        <svg className="cadastro-curva" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80 Q50 55 100 72 Q150 90 200 62 Q250 35 300 68 Q350 95 400 55 L400 120 L0 120Z" fill="#4ade80" opacity="0.3" />
          <path d="M0 95 Q60 78 120 88 Q180 100 240 80 Q300 60 360 84 Q385 90 400 78 L400 120 L0 120Z" fill="#2d6a4f" opacity="0.5" />
        </svg>
      </div>

      <div className="cadastro-painel-direito">
        <div className="cadastro-form">
          <div className="step-indicator">
            <div className={`step-dot ${passo >= 1 ? "step-ativo" : ""} ${passo > 1 ? "step-feito" : ""}`}>
              {passo > 1 ? "✓" : "1"}
            </div>
            <div className={`step-linha ${passo > 1 ? "step-linha-feita" : ""}`}></div>
            <div className={`step-dot ${passo === 2 ? "step-ativo" : ""}`}>2</div>
          </div>

          {erro && <div className="cadastro-erro">{erro}</div>}

          {passo === 1 && (
            <form onSubmit={avancarPasso}>
              <h2 className="cadastro-form-titulo">Seus dados</h2>
              <p className="cadastro-form-sub">Informações básicas da sua conta</p>

              <div className="linha-2">
                <div className="campo">
                  <label className="label">Nome</label>
                  <input type="text" className="input" placeholder="João" required
                    value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div className="campo">
                  <label className="label">Sobrenome</label>
                  <input type="text" className="input" placeholder="Silva" required
                    value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
                </div>
              </div>

              <div className="campo">
                <label className="label">E-mail</label>
                <input type="email" className="input" placeholder="seu@email.com" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="linha-2">
                <div className="campo">
                  <label className="label">Senha</label>
                  <input type="password" className="input" placeholder="••••••••" required
                    value={senha} onChange={(e) => setSenha(e.target.value)} />
                </div>
                <div className="campo">
                  <label className="label">Confirmar senha</label>
                  <input type="password" className="input" placeholder="••••••••" required
                    value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn-proximo">Próximo →</button>
            </form>
          )}

          {passo === 2 && (
            <form onSubmit={handleCriarConta}>
              <h2 className="cadastro-form-titulo">Sua propriedade</h2>
              <p className="cadastro-form-sub">Dados da sua fazenda ou sítio</p>

              <div className="campo">
                <label className="label">Nome da propriedade</label>
                <input type="text" className="input" placeholder="Ex: Sítio Boa Esperança" required
                  value={nomePropriedade} onChange={(e) => setNomePropriedade(e.target.value)} />
              </div>

              <div className="linha-2">
                <div className="campo">
                  <label className="label">Estado</label>
                  <select className="input" value={estado} onChange={(e) => setEstado(e.target.value)}>
                    <option value="">Selecionar...</option>
                    <option>Minas Gerais</option>
                    <option>Goiás</option>
                    <option>Mato Grosso</option>
                    <option>São Paulo</option>
                    <option>Paraná</option>
                    <option>Mato Grosso do Sul</option>
                    <option>Bahia</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div className="campo">
                  <label className="label">Área total (ha)</label>
                  <input type="number" className="input" placeholder="Ex: 50"
                    value={areaTotal} onChange={(e) => setAreaTotal(e.target.value)} />
                </div>
              </div>

              <div className="campo">
                <label className="label">O que você planta?</label>
                <div className="tags">
                  {CULTURAS.map((c) => (
                    <button type="button" key={c}
                      className={`tag ${culturasEscolhidas.includes(c) ? "tag-ativa" : ""}`}
                      onClick={() => toggleCultura(c)}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-proximo" disabled={carregando}>
                {carregando ? "Criando conta..." : "Criar minha conta"}
              </button>
            </form>
          )}

          <p className="trocar-tela">
            Já tem conta?{" "}
            <button className="link-tela" onClick={() => irPara("login")}>Entrar</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;