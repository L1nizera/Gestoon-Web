import { useMemo, useState } from "react";
import { tasks } from "../../data/Tasks";
import styles from "../Home/style.module.css";

const funcionariosMock = [
  { id: 1, nome: "João Silva", cargo: "Supervisor", dataCriacao: "10/03/2026" },
  { id: 2, nome: "Maria Souza", cargo: "Caixa", dataCriacao: "22/02/2026" },
  {
    id: 3,
    nome: "Carlos Mendes",
    cargo: "Motorista",
    dataCriacao: "05/01/2026",
  },
  { id: 4, nome: "Ana Oliveira", cargo: "Analista", dataCriacao: "18/03/2026" },
  { id: 5, nome: "Bruno Rocha", cargo: "Auxiliar", dataCriacao: "30/01/2026" },
  { id: 6, nome: "Fernanda Lima", cargo: "Gerente", dataCriacao: "12/02/2026" },
  {
    id: 7,
    nome: "Ricardo Alves",
    cargo: "Repositor",
    dataCriacao: "25/03/2026",
  },
  {
    id: 8,
    nome: "Juliana Costa",
    cargo: "Atendente",
    dataCriacao: "08/01/2026",
  },
  {
    id: 9,
    nome: "Paulo Henrique",
    cargo: "Coordenador",
    dataCriacao: "14/02/2026",
  },
  {
    id: 10,
    nome: "Camila Santos",
    cargo: "Auxiliar de Limpeza",
    dataCriacao: "27/03/2026",
  },
];

function Relatorios() {
  const [nomeFiltro, setNomeFiltro] = useState("");
  const [cargoFiltro, setCargoFiltro] = useState("");
  const [dataFiltro, setDataFiltro] = useState("");
  const [ordemNome, setOrdemNome] = useState(null);
  const cargos = [...new Set(funcionariosMock.map((f) => f.cargo))];

  const listaFiltrada = useMemo(() => {
    return funcionariosMock
      .map((funcionario) => {
        const funcionarioPrimeiroNome = funcionario.nome.split(" ")[0];

        const tarefasFuncionario = tasks.filter(
          (tarefa) => tarefa.criadoPor === funcionarioPrimeiroNome,
        );

        const concluidas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status === "Concluída",
        ).length;

        const naoConcluidas = tarefasFuncionario.filter(
          (tarefa) => tarefa.status !== "Concluída",
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
        if (!ordemNome) return 0;

        return ordemNome === "az"
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome);
      });
  }, [nomeFiltro, cargoFiltro, dataFiltro, ordemNome]);

  function limparFiltros() {
    setNomeFiltro("");
    setCargoFiltro("");
    setDataFiltro("");
  }

  function handleExport() {
    alert(
      "Exportar relatório: funcionalidade visual pronta para integração futura.",
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardContainer}>
        {/* HEADER */}
        <h1>Relatório de Funcionários</h1>

        <div className={styles.topActions}>
          <input
            className={styles.busca}
            placeholder="Buscar funcionário..."
            value={nomeFiltro}
            onChange={(e) => setNomeFiltro(e.target.value)}
          />
        </div>

        {/* FILTROS */}
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
            <small>Data:</small>
            <input
              type="date"
              value={dataFiltro}
              onChange={(e) => setDataFiltro(e.target.value)}
            />
          </div>
        </div>
        
        {/* AÇÕES */}
        <div className={styles.acoes}>
          <button className={styles.btnSecondary} onClick={limparFiltros}>
            Limpar Filtros
          </button>

          <span>{listaFiltrada.length} encontrados</span>
        </div>

        {/* TABELA */}
        <div className={`${styles.tabelaContainer} ${styles.desktopOnly}`}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th
                  onClick={() =>
                    setOrdemNome((prev) => {
                      if (prev === null) return "az";
                      if (prev === "az") return "za";
                      return null;
                    })
                  }
                >
                  Nome{" "}
                  {ordemNome === "az" ? "↑" : ordemNome === "za" ? "↓" : ""}
                </th>
                <th className={styles.textCenter}>Cargo</th>
                <th className={styles.textCenter}>Data</th>
                <th className={styles.textCenter}>Concluídas</th>
                <th className={styles.textCenter}>Pendentes</th>
              </tr>
            </thead>

            <tbody>
              {listaFiltrada.length > 0 ? (
                listaFiltrada.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome}</td>
                    <td className={styles.textCenter}>{f.cargo}</td>
                    <td className={styles.textCenter}>{f.dataCriacao}</td>
                    <td className={styles.textCenter}>{f.concluidas}</td>
                    <td className={styles.textCenter}>{f.naoConcluidas}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.textCenter}>
                    Nenhum resultado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footerActions}>
          <button className={styles.exportBtn} onClick={handleExport}>
            Exportar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
