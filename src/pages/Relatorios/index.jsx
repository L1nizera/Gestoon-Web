import { useMemo, useState } from "react";
import { tasks } from "../../data/Tasks";

import PageLayout from "../../components/ui/PageLayout";
import PageCard from "../../components/ui/PageCard";
import SearchInput from "../../components/ui/SearchInput";
import FilterPanel from "../../components/ui/FilterPanel";
import PageActions from "../../components/ui/PageActions";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";

const funcionariosMock = [
  { id: 1, nome: "João Silva", cargo: "Supervisor", dataCriacao: "10/03/2026" },
  { id: 2, nome: "Maria Souza", cargo: "Caixa", dataCriacao: "22/02/2026" },
  { id: 3, nome: "Carlos Mendes", cargo: "Motorista", dataCriacao: "05/01/2026" },
  { id: 4, nome: "Ana Oliveira", cargo: "Analista", dataCriacao: "18/03/2026" },
  { id: 5, nome: "Bruno Rocha", cargo: "Auxiliar", dataCriacao: "30/01/2026" },
  { id: 6, nome: "Fernanda Lima", cargo: "Gerente", dataCriacao: "12/02/2026" },
  { id: 7, nome: "Ricardo Alves", cargo: "Repositor", dataCriacao: "25/03/2026" },
  { id: 8, nome: "Juliana Costa", cargo: "Atendente", dataCriacao: "08/01/2026" },
  { id: 9, nome: "Paulo Henrique", cargo: "Coordenador", dataCriacao: "14/02/2026" },
  { id: 10, nome: "Camila Santos", cargo: "Auxiliar de Limpeza", dataCriacao: "27/03/2026" },
];

function Relatorios() {
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [ordemNome, setOrdemNome] = useState(null);
  const [ordemData, setOrdemData] = useState(null);

  const cargos = [...new Set(funcionariosMock.map((f) => f.cargo))];

  function handleSort(key) {
    if (key === "nome") {
      setOrdemNome((prev) => {
        if (prev === null) return "az";
        if (prev === "az") return "za";
        return null;
      });

      setOrdemData(null);
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
    return funcionariosMock
      .map((funcionario) => {
        const primeiroNome = funcionario.nome.split(" ")[0];

        const tarefasFuncionario = tasks.filter(
          (tarefa) => tarefa.criadoPor === primeiroNome
        );

        const concluidas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status === "Concluída"
        ).length;

        const naoConcluidas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status !== "Concluída"
        ).length;

        return {
          ...funcionario,
          concluidas,
          naoConcluidas,
        };
      })
      .filter((funcionario) => {
        const nomeMatch = funcionario.nome
          .toLowerCase()
          .includes(nomeFiltro.toLowerCase());

        const cargoMatch = cargoFiltro
          ? funcionario.cargo === cargoFiltro
          : true;

        let dataMatch = true;

        if (dataFiltro) {
          const [dia, mes, ano] = funcionario.dataCriacao.split("/");
          const dataFuncionario = new Date(`${ano}-${mes}-${dia}`);
          const dataBusca = new Date(dataFiltro);

          dataMatch = dataFuncionario.getTime() === dataBusca.getTime();
        }

        return nomeMatch && cargoMatch && dataMatch;
      })
      .sort((a, b) => {
        let resultado = 0;

        if (ordemNome) {
          resultado =
            ordemNome === "az"
              ? a.nome.localeCompare(b.nome)
              : b.nome.localeCompare(a.nome);
        }

        if (resultado === 0 && ordemData) {
          const [dA, mA, yA] = a.dataCriacao.split("/");
          const [dB, mB, yB] = b.dataCriacao.split("/");

          const dataA = new Date(`${yA}-${mA}-${dA}`);
          const dataB = new Date(`${yB}-${mB}-${dB}`);

          resultado = ordemData === "recente" ? dataB - dataA : dataA - dataB;
        }

        return resultado;
      });
  }, [nomeFiltro, cargoFiltro, dataFiltro, ordemNome, ordemData]);

  function limparFiltros() {
    setNomeFiltro("");
    setCargoFiltro("");
    setDataFiltro("");
    setOrdemNome(null);
    setOrdemData(null);
  }

  function handleExport() {
    alert("Exportar relatório: funcionalidade visual pronta para integração futura.");
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
      key: "dataCriacao",
      label: "Data",
      align: "center",
      sortable: true,
    },
    {
      key: "concluidas",
      label: "Concluídas",
      align: "center",
    },
    {
      key: "naoConcluidas",
      label: "Pendentes",
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
            <small>Data:</small>
            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
          </div>
        </FilterPanel>

        <PageActions
          left={
            <Button variant="danger" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          }
          center={<span>{listaFiltrada.length} encontrados</span>}
        />

        <DataTable
          columns={columns}
          data={listaFiltrada}
          sortKey={ordemNome ? "nome" : ordemData ? "dataCriacao" : null}
          sortDirection={ordemNome || ordemData}
          onSort={handleSort}
          emptyMessage="Nenhum resultado encontrado"
        />

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