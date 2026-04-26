import { useState, useEffect } from "react";
import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import Dashboard from "./pages/Dashboard/Dashboard";
import Talhoes from "./pages/Talhoes";
import Plantios from "./pages/Plantios.jsx";
import Estoque from "./pages/Estoque.jsx";
import Caderno from "./pages/Caderno.jsx";
import Financeiro from "./pages/Financeiro.jsx";
import Produtividade from "./pages/Produtividade.jsx";
import Perfil from "./pages/Perfil.jsx";
import Diagnostico from "./pages/Diagnostico.jsx";
import Loading from "./components/Loading";
import Notificacao from "./components/Notificacao";

function App() {
  const [tela, setTela] = useState(null);
  const [iniciando, setIniciando] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      const token = localStorage.getItem('token');
      setTela(token ? "dashboard" : "login");
      setIniciando(false);
    }, 800);
  }, []);

  function irPara(novaTela) {
    if (novaTela === "login") {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    setTela(novaTela);
  }

  if (iniciando) return <Loading texto="Iniciando CampoFácil..." />;

  return (
    <div>
      {tela === "dashboard" && <Notificacao />}
      {tela === "login" && <Login irPara={irPara} />}
      {tela === "cadastro" && <Cadastro irPara={irPara} />}
      {tela === "dashboard" && <Dashboard irPara={irPara} />}
      {tela === "talhoes" && <Talhoes irPara={irPara} />}
      {tela === "plantios" && <Plantios irPara={irPara} />}
      {tela === "estoque" && <Estoque irPara={irPara} />}
      {tela === "caderno" && <Caderno irPara={irPara} />}
      {tela === "financeiro" && <Financeiro irPara={irPara} />}
      {tela === "produtividade" && <Produtividade irPara={irPara} />}
      {tela === "perfil" && <Perfil irPara={irPara} />}
      {tela === "diagnostico" && <Diagnostico irPara={irPara} />}
    </div>
  );
}

export default App;