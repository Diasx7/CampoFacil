import { useState } from "react";
import api from "../api";
import "./Login.css";

function Login({ irPara }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleEntrar(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // chama o backend
      const resposta = await api.post('/auth/login', { email, senha });

      // salva o token e dados do usuario
      localStorage.setItem('token', resposta.data.token);
      localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

      irPara("dashboard");
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-pagina">
      <div className="login-painel-esquerdo">
        <div className="login-logo">
          <div className="login-logo-icone">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L11.5 7H17L12.5 10.5L14 16.5L9 13L4 16.5L5.5 10.5L1 7H6.5L9 1.5Z" fill="#1a3a2a" />
            </svg>
          </div>
          <span className="login-logo-texto">CampoFácil</span>
        </div>

        <div className="login-painel-conteudo">
          <h1 className="login-titulo">Sua lavoura<br />na palma da mão</h1>
          <p className="login-sub">Calcule insumos, acompanhe o clima e gerencie cada talhão com facilidade.</p>
          <div className="login-pontos">
            <span className="ponto ponto-ativo"></span>
            <span className="ponto"></span>
            <span className="ponto"></span>
          </div>
        </div>

        <svg className="login-curva" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80 Q50 55 100 72 Q150 90 200 62 Q250 35 300 68 Q350 95 400 55 L400 120 L0 120Z" fill="#4ade80" opacity="0.3" />
          <path d="M0 95 Q60 78 120 88 Q180 100 240 80 Q300 60 360 84 Q385 90 400 78 L400 120 L0 120Z" fill="#2d6a4f" opacity="0.5" />
        </svg>
      </div>

      <div className="login-painel-direito">
        <div className="login-form">
          <h2 className="login-form-titulo">Bem-vindo de volta</h2>
          <p className="login-form-sub">Entre na sua conta para continuar</p>

          {erro && <div className="login-erro">{erro}</div>}

          <form onSubmit={handleEntrar}>
            <div className="campo">
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-entrar" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="divisor">
            <span className="divisor-linha"></span>
            <span className="divisor-texto">ou</span>
            <span className="divisor-linha"></span>
          </div>

          <p className="trocar-tela">
            Não tem conta?{" "}
            <button className="link-tela" onClick={() => irPara("cadastro")}>
              Criar conta grátis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;