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

function App() {
  const [tela, setTela] = useState("login");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setTela("dashboard");
  }, []);

  function irPara(novaTela) {
    if (novaTela === "login") {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    setTela(novaTela);
  }

  return (
    <div>
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
    </div>
  );
}

export default App;