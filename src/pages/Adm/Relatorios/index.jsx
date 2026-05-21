import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../../services/api";

import PageLayout from "../../../components/ui/PageLayout";
import PageCard from "../../../components/ui/PageCard";
import styles from "../Home/style.module.css";
import DataTable from "../../../components/ui/DataTable";

function Relatorios() {
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");

  const [ordemNome, setOrdemNome] = useState(null);
  const [ordemData, setOrdemData] = useState(null);
  const [ordemMetrica, setOrdemMetrica] = useState("");

  const [funcionarios, setFuncionarios] = useState([]);
  const [tarefas, setTarefas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargoApiMap = {
    1: "Gerente",
    2: "Supervisor",
    3: "Caixa",
    4: "Repositor",
    5: "Auxiliar de Limpeza",
    6: "Auxiliar Administrativo",
    7: "Assistente Financeiro",
    8: "Analista Financeiro",
    9: "Auxiliar de RH",
    10: "Analista de RH",
    11: "Recepcionista",
    12: "Atendente de Recepção",
    13: "Atendente",
    14: "Operador de Atendimento",
    15: "Operador de Caixa",
    16: "Fiscal de Caixa",
    17: "Estoquista",
    18: "Conferente de Estoque",
    19: "Repositor de HortiFruti",
    20: "Auxiliar de HortiFruti",
    21: "Açougueiro",
    22: "Auxiliar de Açougue",
    23: "Padeiro",
    24: "Auxiliar de Padaria",
    25: "Balconista de Frios",
    26: "Auxiliar de Frios",
    27: "Repositor de Mercearia",
    28: "Auxiliar de Mercearia",
  };

  const setorApiMap = {
    1: "Administrativo",
    2: "Financeiro",
    3: "Operacional",
    4: "Atendimento",
    5: "Limpeza",
    6: "Estoque",
    7: "RH",
    8: "Recepção",
    9: "Caixa",
    10: "HortiFruti",
    11: "Açougue",
    12: "Padaria",
    13: "Frios",
    14: "Mercearia",
  };

  function parseDateValue(value) {
    if (!value) {
      return {
        data: "-",
        iso: "",
      };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return {
        data: "-",
        iso: "",
      };
    }

    return {
      data: date.toLocaleDateString("pt-BR"),
      iso: date.toISOString(),
    };
  }

  function normalizarStatus(status) {
    const numero = Number(status);

    if (numero === 0) return "Pendente";
    if (numero === 1) return "Em andamento";
    if (numero === 2) return "Concluída";
    if (numero === 3) return "Cancelada";

    return "Pendente";
  }

  useEffect(() => {
    async function fetchDados() {
      try {
        setLoading(true);
        setError(null);

        const [funcionariosResponse, tarefasResponse] = await Promise.all([
          api.get("/funcionarios"),
          api.get("/tarefas"),
        ]);

        const funcionariosFormatados = (
          funcionariosResponse.data?.dados || []
        ).map((funcionario) => {
          const date = parseDateValue(funcionario.func_data_criacao);

          return {
            id: Number(funcionario.func_id),
            nome: funcionario.func_nome || "-",

            cargoId: Number(funcionario.func_crg_id),
            cargo:
              cargoApiMap[Number(funcionario.func_crg_id)] ||
              `Cargo #${funcionario.func_crg_id}`,

            setorId: Number(funcionario.func_setor_id),
            setor:
              setorApiMap[Number(funcionario.func_setor_id)] ||
              `Setor #${funcionario.func_setor_id}`,

            dataCriacao: date.data,
            dataCriacaoISO: date.iso,
          };
        });

        const tarefasFormatadas = (tarefasResponse.data?.dados || []).map(
          (tarefa) => ({
            id: Number(tarefa.tar_id),
            funcionarioId: Number(tarefa.atr_funcionario_id),
            setorId: Number(tarefa.tar_setor_id),
            setor:
              tarefa.set_nome ||
              setorApiMap[Number(tarefa.tar_setor_id)] ||
              `Setor #${tarefa.tar_setor_id}`,
            status: normalizarStatus(tarefa.atr_status),
          }),
        );

        setFuncionarios(funcionariosFormatados);
        setTarefas(tarefasFormatadas);
      } catch (err) {
        console.error("Erro ao carregar relatório:", err.response?.data || err);

        setError(
          err.response?.data?.mensagem ||
          "Não foi possível carregar o relatório.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, []);

  const cargos = useMemo(() => {
    return Object.values(cargoApiMap);
  }, []);

  const setores = useMemo(() => {
    return [
      "Administrativo",
      "Financeiro",
      "RH",
      "Recepção",
      "Atendimento",
      "Caixa",
      "Estoque",
      "HortiFruti",
      "Açougue",
      "Padaria",
      "Frios",
      "Mercearia",
      "Limpeza",
    ];
  }, []);

  function handleSort(key) {
    if (key === "nome") {
      setOrdemNome((prev) => {
        if (prev === null) return "az";
        if (prev === "az") return "za";
        return null;
      });

      setOrdemData(null);
      setOrdemMetrica("");
      return;
    }

    if (key === "dataCriacao") {
      setOrdemData((prev) => {
        if (prev === null) return "recente";
        if (prev === "recente") return "antigo";
        return null;
      });

      setOrdemNome(null);
      setOrdemMetrica("");
      return;
    }

    if (
      key === "emAndamento" ||
      key === "concluidas" ||
      key === "canceladas" ||
      key === "total"
    ) {
      setOrdemMetrica((prev) => (prev === key ? "" : key));

      setOrdemNome(null);
      setOrdemData(null);
    }
  }

  const listaFiltrada = useMemo(() => {
    return funcionarios
      .map((funcionario) => {
        let tarefasFuncionario = tarefas.filter(
          (tarefa) => tarefa.funcionarioId === funcionario.id,
        );

        if (setorFiltro) {
          tarefasFuncionario = tarefasFuncionario.filter(
            (tarefa) => tarefa.setor === setorFiltro,
          );
        }

        const emAndamento = tarefasFuncionario.filter(
          (tarefa) => tarefa.status === "Em andamento",
        ).length;

        const concluidas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status === "Concluída",
        ).length;

        const canceladas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status === "Cancelada",
        ).length;

        const total = emAndamento + concluidas + canceladas;

        return {
          ...funcionario,
          emAndamento,
          concluidas,
          canceladas,
          total,
        };
      })

      .filter((funcionario) => {
        const nomeMatch = funcionario.nome
          .toLowerCase()
          .includes(nomeFiltro.toLowerCase());

        const cargoMatch = cargoFiltro
          ? funcionario.cargo === cargoFiltro
          : true;

        const setorMatch = setorFiltro
          ? funcionario.setor === setorFiltro || funcionario.total > 0
          : true;

        let dataMatch = true;

        if (dataFiltro) {
          const dataFuncionario = funcionario.dataCriacaoISO
            ? funcionario.dataCriacaoISO.slice(0, 10)
            : "";

          dataMatch = dataFuncionario === dataFiltro;
        }

        return nomeMatch && cargoMatch && setorMatch && dataMatch;
      })

      .sort((a, b) => {
        if (ordemMetrica === "emAndamento") {
          return b.emAndamento - a.emAndamento;
        }

        if (ordemMetrica === "concluidas") {
          return b.concluidas - a.concluidas;
        }

        if (ordemMetrica === "canceladas") {
          return b.canceladas - a.canceladas;
        }

        if (ordemMetrica === "total") {
          return b.total - a.total;
        }

        let resultado = 0;

        if (ordemNome) {
          resultado =
            ordemNome === "az"
              ? a.nome.localeCompare(b.nome)
              : b.nome.localeCompare(a.nome);
        }

        if (resultado === 0 && ordemData) {
          const dataA = new Date(a.dataCriacaoISO);
          const dataB = new Date(b.dataCriacaoISO);

          resultado = ordemData === "recente" ? dataB - dataA : dataA - dataB;
        }

        return resultado;
      });

  }, [
    funcionarios,
    tarefas,
    nomeFiltro,
    cargoFiltro,
    setorFiltro,
    dataFiltro,
    ordemNome,
    ordemData,
    ordemMetrica,
  ]);

  function limparFiltros() {
    setNomeFiltro("");
    setCargoFiltro("");
    setSetorFiltro("");
    setDataFiltro("");
    setOrdemNome(null);
    setOrdemData(null);
    setOrdemMetrica("");
  }

  function handleExport() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Funcionários - Gestoon", 14, 15);

    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [
        [
          "Nome",
          "Cargo",
          "Setor",
          "Data",
          "Em andamento",
          "Concluídas",
          "Canceladas",
          "Total",
        ],
      ],
      body: listaFiltrada.map((item) => [
        item.nome,
        item.cargo,
        item.setor,
        item.dataCriacao,
        item.emAndamento,
        item.concluidas,
        item.canceladas,
        item.total,
      ]),
      styles: {
        fontSize: 8,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        lineWidth: 0.2,
      },
      theme: "grid",
    });

    doc.save("relatorio_funcionarios.pdf");
  }

  const columns = [
    {
      key: "nome",
      label: "Nome",
      sortable: true,
    },
    {
      key: "cargo",
      label: "Cargo",
      align: "center",
    },
    {
      key: "setor",
      label: "Setor",
      align: "center",
    },
    {
      key: "dataCriacao",
      label: "Data",
      align: "center",
      sortable: true,
    },
    {
      key: "emAndamento",
      label: "Em andamento",
      align: "center",
      sortable: true,
    },
    {
      key: "concluidas",
      label: "Concluídas",
      align: "center",
      sortable: true,
    },
    {
      key: "canceladas",
      label: "Canceladas",
      align: "center",
      sortable: true,
    },
    {
      key: "total",
      label: "Total",
      align: "center",
      sortable: true,
    },
  ];

  return (
    <PageLayout>
      <PageCard>
        <h1>Relatório de Funcionários</h1>

        <div className={styles.topActions}>
          <input
            className={styles.busca}
            placeholder="Buscar funcionário..."
            value={nomeFiltro}
            onChange={(e) => setNomeFiltro(e.target.value)}
          />
        </div>

        <div className={styles.filtrosAvancados}>
          <div>
            <small>Cargo:</small>

            <select
              value={cargoFiltro}
              onChange={(e) => setCargoFiltro(e.target.value)}
            >
              <option value="">Todos</option>

              {cargos.map((cargo) => (
                <option key={cargo} value={cargo}>
                  {cargo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <small>Setor:</small>

            <select
              value={setorFiltro}
              onChange={(e) => setSetorFiltro(e.target.value)}
            >
              <option value="">Todos</option>

              {setores.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <small>Data:</small>

            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filtros}>
          <button
            className={ordemMetrica === "emAndamento" ? styles.ativo : ""}
            onClick={() => {
              setOrdemMetrica((prev) =>
                prev === "emAndamento" ? "" : "emAndamento"
              );
              setOrdemNome(null);
              setOrdemData(null);
            }}
          >
            Em andamento
          </button>

          <button
            className={ordemMetrica === "concluidas" ? styles.ativo : ""}
            onClick={() => {
              setOrdemMetrica((prev) =>
                prev === "concluidas" ? "" : "concluidas"
              );
              setOrdemNome(null);
              setOrdemData(null);
            }}
          >
            Concluídas
          </button>

          <button
            className={ordemMetrica === "canceladas" ? styles.ativo : ""}
            onClick={() => {
              setOrdemMetrica((prev) =>
                prev === "canceladas" ? "" : "canceladas"
              );
              setOrdemNome(null);
              setOrdemData(null);
            }}
          >
            Canceladas
          </button>

          <button
            className={ordemMetrica === "total" ? styles.ativo : ""}
            onClick={() => {
              setOrdemMetrica((prev) => (prev === "total" ? "" : "total"));
              setOrdemNome(null);
              setOrdemData(null);
            }}
          >
            Total
          </button>
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} onClick={limparFiltros}>
            Limpar Filtros
          </button>

          <span>{listaFiltrada.length} encontrados</span>
        </div>

        {loading && <p>Carregando relatório...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <DataTable
            columns={columns}
            data={listaFiltrada}
            sortKey={
              ordemNome
                ? "nome"
                : ordemData
                  ? "dataCriacao"
                  : ordemMetrica || null
            }
            sortDirection={ordemNome || ordemData || (ordemMetrica ? "maior" : null)}
            onSort={handleSort}
            emptyMessage="Nenhum resultado encontrado"
            variant="relatorios"
          />
        )}

        <div className={styles.footerActions}>
          <button className={styles.exportBtn} onClick={handleExport}>
            Exportar PDF
          </button>
        </div>
      </PageCard>
    </PageLayout>
  );
}



export default Relatorios;
