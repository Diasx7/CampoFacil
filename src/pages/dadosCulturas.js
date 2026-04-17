// recomendacoes agronomicas por cultura
// depois isso pode vir de uma API ou banco de dados

export const culturas = {
  "Milho silagem": {
    cor: "#639922",
    ciclo: "120 a 140 dias",
    espacamento: "0,45 a 0,50 m entre linhas",
    insumos: [
      {
        nome: "Sementes (saca 60.000)",
        unidade: "sacas",
        porHectare: 5.5,
        precoReferencia: 280,
      },
      {
        nome: "NPK 08-28-16 (plantio)",
        unidade: "kg",
        porHectare: 350,
        precoReferencia: 2.8,
      },
      {
        nome: "Ureia (cobertura)",
        unidade: "kg",
        porHectare: 175,
        precoReferencia: 3.2,
      },
      {
        nome: "Atrazina (herbicida)",
        unidade: "L",
        porHectare: 3.5,
        precoReferencia: 18,
      },
      {
        nome: "Inseticida cupinicida",
        unidade: "L",
        porHectare: 1.5,
        precoReferencia: 45,
      },
    ],
    calendario: [
      { etapa: "Calagem (se necessário)", quando: "30 dias antes do plantio" },
      { etapa: "Plantio + adubo de base", quando: "Época recomendada para a região" },
      { etapa: "Herbicida pré-emergente", quando: "3 a 5 dias após o plantio" },
      { etapa: "Adubação de cobertura", quando: "30 dias após emergência (V4-V6)" },
      { etapa: "Monitoramento de pragas", quando: "Durante todo o ciclo" },
      { etapa: "Colheita / Ensilagem", quando: "Ponto farinhoso — 35% de matéria seca" },
    ],
  },

  "Milho grão": {
    cor: "#EF9F27",
    ciclo: "110 a 130 dias",
    espacamento: "0,45 a 0,50 m entre linhas",
    insumos: [
      {
        nome: "Sementes (saca 60.000)",
        unidade: "sacas",
        porHectare: 5,
        precoReferencia: 320,
      },
      {
        nome: "NPK 08-28-16 (plantio)",
        unidade: "kg",
        porHectare: 300,
        precoReferencia: 2.8,
      },
      {
        nome: "Ureia (cobertura)",
        unidade: "kg",
        porHectare: 150,
        precoReferencia: 3.2,
      },
      {
        nome: "Atrazina (herbicida)",
        unidade: "L",
        porHectare: 3,
        precoReferencia: 18,
      },
      {
        nome: "Fungicida foliar",
        unidade: "L",
        porHectare: 0.5,
        precoReferencia: 120,
      },
    ],
    calendario: [
      { etapa: "Calagem (se necessário)", quando: "30 dias antes do plantio" },
      { etapa: "Plantio + adubo de base", quando: "Época recomendada para a região" },
      { etapa: "Herbicida pré-emergente", quando: "3 a 5 dias após o plantio" },
      { etapa: "Adubação de cobertura", quando: "30 dias após emergência" },
      { etapa: "Fungicida foliar", quando: "VT — pendoamento" },
      { etapa: "Colheita", quando: "Grão com 13% de umidade" },
    ],
  },

  "Soja": {
    cor: "#378ADD",
    ciclo: "100 a 130 dias",
    espacamento: "0,45 a 0,50 m entre linhas",
    insumos: [
      {
        nome: "Sementes (saca 40 kg)",
        unidade: "sacas",
        porHectare: 3.5,
        precoReferencia: 180,
      },
      {
        nome: "Inoculante",
        unidade: "doses",
        porHectare: 1,
        precoReferencia: 25,
      },
      {
        nome: "NPK 00-20-20 (plantio)",
        unidade: "kg",
        porHectare: 280,
        precoReferencia: 3.1,
      },
      {
        nome: "Herbicida (Glifosato)",
        unidade: "L",
        porHectare: 2,
        precoReferencia: 12,
      },
      {
        nome: "Fungicida foliar",
        unidade: "L",
        porHectare: 0.4,
        precoReferencia: 130,
      },
      {
        nome: "Inseticida (MIP)",
        unidade: "L",
        porHectare: 0.5,
        precoReferencia: 80,
      },
    ],
    calendario: [
      { etapa: "Calagem e gessagem", quando: "60 dias antes do plantio" },
      { etapa: "Inoculação das sementes", quando: "No dia do plantio" },
      { etapa: "Plantio + adubo de base", quando: "Época recomendada" },
      { etapa: "Herbicida pós-emergente", quando: "15 a 20 dias após emergência" },
      { etapa: "Fungicida foliar (1ª)", quando: "R1 — início do florescimento" },
      { etapa: "Fungicida foliar (2ª)", quando: "R3 — início do enchimento" },
      { etapa: "Colheita", quando: "R8 — grão com 13% de umidade" },
    ],
  },

  "Sorgo": {
    cor: "#D85A30",
    ciclo: "90 a 120 dias",
    espacamento: "0,50 a 0,70 m entre linhas",
    insumos: [
      {
        nome: "Sementes (kg)",
        unidade: "kg",
        porHectare: 8,
        precoReferencia: 15,
      },
      {
        nome: "NPK 08-28-16 (plantio)",
        unidade: "kg",
        porHectare: 250,
        precoReferencia: 2.8,
      },
      {
        nome: "Ureia (cobertura)",
        unidade: "kg",
        porHectare: 120,
        precoReferencia: 3.2,
      },
      {
        nome: "Herbicida seletivo",
        unidade: "L",
        porHectare: 2.5,
        precoReferencia: 22,
      },
    ],
    calendario: [
      { etapa: "Preparo do solo", quando: "15 dias antes do plantio" },
      { etapa: "Plantio + adubo de base", quando: "Novembro a Janeiro" },
      { etapa: "Herbicida pós-emergente", quando: "10 a 15 dias após emergência" },
      { etapa: "Adubação de cobertura", quando: "25 a 30 dias após emergência" },
      { etapa: "Colheita", quando: "Grão com 14% de umidade" },
    ],
  },

  "Capim / Pastagem": {
    cor: "#1D9E75",
    ciclo: "Perene",
    espacamento: "Plantio a lanço ou em linhas",
    insumos: [
      {
        nome: "Sementes de Brachiaria (kg)",
        unidade: "kg",
        porHectare: 6,
        precoReferencia: 12,
      },
      {
        nome: "Calcário",
        unidade: "kg",
        porHectare: 2000,
        precoReferencia: 0.25,
      },
      {
        nome: "Superfosfato simples",
        unidade: "kg",
        porHectare: 150,
        precoReferencia: 2.5,
      },
      {
        nome: "Ureia (estabelecimento)",
        unidade: "kg",
        porHectare: 80,
        precoReferencia: 3.2,
      },
    ],
    calendario: [
      { etapa: "Calagem", quando: "60 dias antes do plantio" },
      { etapa: "Preparo do solo", quando: "30 dias antes" },
      { etapa: "Plantio + fósforo", quando: "Início das chuvas" },
      { etapa: "Adubação nitrogenada", quando: "30 dias após emergência" },
      { etapa: "Vedação do pasto", quando: "Até estabelecimento completo (90 dias)" },
    ],
  },

  "Cana-de-açúcar": {
    cor: "#534AB7",
    ciclo: "12 a 18 meses (1ª safra)",
    espacamento: "1,40 a 1,50 m entre linhas",
    insumos: [
      {
        nome: "Mudas (toneladas)",
        unidade: "ton",
        porHectare: 8,
        precoReferencia: 150,
      },
      {
        nome: "NPK 05-25-25 (plantio)",
        unidade: "kg",
        porHectare: 600,
        precoReferencia: 3.5,
      },
      {
        nome: "Ureia (cobertura)",
        unidade: "kg",
        porHectare: 100,
        precoReferencia: 3.2,
      },
      {
        nome: "Herbicida (Diuron)",
        unidade: "kg",
        porHectare: 2.5,
        precoReferencia: 28,
      },
    ],
    calendario: [
      { etapa: "Preparo profundo do solo", quando: "30 a 60 dias antes" },
      { etapa: "Sulcação + adubo de base", quando: "Época recomendada" },
      { etapa: "Plantio das mudas", quando: "Outubro a Novembro" },
      { etapa: "Herbicida pré-emergente", quando: "Até 15 dias após plantio" },
      { etapa: "Adubação de cobertura", quando: "3 a 4 meses após plantio" },
      { etapa: "Colheita", quando: "12 a 18 meses — brix acima de 18°" },
    ],
  },
};

export const listaCulturas = Object.keys(culturas);