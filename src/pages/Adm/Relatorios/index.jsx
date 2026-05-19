import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../../services/api";

import PageLayout from "../../../components/ui/PageLayout";
import PageCard from "../../../components/ui/PageCard";
import SearchInput from "../../../components/ui/SearchInput";
import FilterPanel from "../../../components/ui/FilterPanel";
import PageActions from "../../../components/ui/PageActions";
import Button from "../../../components/ui/Button";
import DataTable from "../../../components/ui/DataTable";

function Relatorios() {
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");

  const [ordemNome, setOrdemNome] = useState(null);
  const [ordemData, setOrdemData] = useState(null);
  const [ordemRelatorio, setOrdemRelatorio] = useState("");

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
    return [...new Set(funcionarios.map((func) => func.cargo))];
  }, [funcionarios]);

  const setores = useMemo(() => {
    return [...new Set(funcionarios.map((func) => func.setor))];
  }, [funcionarios]);

  function handleSort(key) {
    if (key === "nome") {
      setOrdemNome((prev) => {
        if (prev === null) return "az";
        if (prev === "az") return "za";
        return null;
      });

      setOrdemData(null);
      return;
    }

    if (key === "dataCriacao") {
      setOrdemData((prev) => {
        if (prev === null) return "recente";
        if (prev === "recente") return "antigo";
        return null;
      });

      setOrdemNome(null);
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
        if (ordemRelatorio === "nome-az") {
          return a.nome.localeCompare(b.nome);
        }

        if (ordemRelatorio === "nome-za") {
          return b.nome.localeCompare(a.nome);
        }

        if (ordemRelatorio === "concluidas-maior") {
          return b.concluidas - a.concluidas;
        }

        if (ordemRelatorio === "canceladas-maior") {
          return b.canceladas - a.canceladas;
        }

        if (ordemRelatorio === "andamento-maior") {
          return b.emAndamento - a.emAndamento;
        }

        if (ordemRelatorio === "total-maior") {
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
    ordemRelatorio,
  ]);

  function limparFiltros() {
    setNomeFiltro("");
    setCargoFiltro("");
    setSetorFiltro("");
    setDataFiltro("");
    setOrdemNome(null);
    setOrdemData(null);
    setOrdemRelatorio("");
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
    },

    {
      key: "concluidas",
      label: "Concluídas",
      align: "center",
    },

    {
      key: "canceladas",
      label: "Canceladas",
      align: "center",
    },

    {
      key: "total",
      label: "Total",
      align: "center",
    },
  ];

  return (
    <PageLayout>
      <PageCard>
        <h1>Relatório de Funcionários</h1>

        <SearchInput
          placeholder="Buscar funcionário..."
          value={nomeFiltro}
          onChange={setNomeFiltro}
        />

        <FilterPanel>
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

          <div>
            <small>Ordenar:</small>
            <select
              value={ordemRelatorio}
              onChange={(e) => {
                setOrdemRelatorio(e.target.value);
                setOrdemNome(null);
                setOrdemData(null);
              }}
            >
              <option value="">Padrão</option>
              <option value="nome-az">Nome A-Z</option>
              <option value="nome-za">Nome Z-A</option>
              <option value="concluidas-maior">Mais concluídas</option>
              <option value="canceladas-maior">Mais canceladas</option>
              <option value="andamento-maior">Mais em andamento</option>
              <option value="total-maior">Mais tarefas no total</option>
            </select>
          </div>
          
        </FilterPanel>

        <PageActions
          left={
            <Button variant="secondary" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          }
          right={<span>{listaFiltrada.length} encontrados</span>}
        />

        {loading && <p>Carregando relatório...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && (
          <DataTable
            columns={columns}
            data={listaFiltrada}
            sortKey={ordemNome ? "nome" : ordemData ? "dataCriacao" : null}
            sortDirection={ordemNome || ordemData}
            onSort={handleSort}
            emptyMessage="Nenhum resultado encontrado"
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "1.5rem",
          }}
        >
          <Button variant="primary" onClick={handleExport}>
            Exportar Relatório
          </Button>
        </div>
      </PageCard>
    </PageLayout>
  );
}

export default Relatorios;
