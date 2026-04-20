import { useState, useEffect } from "react";
import api from "../api";

// hook customizado pra buscar os talhoes do usuario
// assim nao precisa repetir o mesmo codigo em cada tela
function useTalhoes() {
  const [talhoes, setTalhoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscar() {
      try {
        const resposta = await api.get('/talhoes');
        setTalhoes(resposta.data);
      } catch (err) {
        console.error('Erro ao buscar talhões:', err);
      } finally {
        setCarregando(false);
      }
    }
    buscar();
  }, []);

  // retorna os nomes dos talhoes pra usar nos selects
  const nomesDosTalhoes = talhoes.map((t) => t.nome);

  return { talhoes, nomesDosTalhoes, carregando };
}

export default useTalhoes;