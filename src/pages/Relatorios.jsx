
import { useMemo, useState } from "react";
import { tasks } from "../data/Tasks";
import "../styles/relatorios.css";

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
        const nomeMatch = funcionario.nome.toLowerCase().includes(nomeFiltro.toLowerCase());
        const cargoMatch = funcionario.cargo.toLowerCase().includes(cargoFiltro.toLowerCase());

        let dataMatch = true;
        if (dataFiltro) {
          const [dia, mes, ano] = funcionario.dataCriacao.split("/");
          const dataFuncionario = new Date(`${ano}-${mes}-${dia}`);
          const dataBusca = new Date(dataFiltro);
          dataMatch = dataFuncionario.getTime() === dataBusca.getTime();
        }

        return nomeMatch && cargoMatch && dataMatch;
      });
  }, [nomeFiltro, cargoFiltro, dataFiltro]);

  function limparFiltros() {
    setNomeFiltro("");
    setCargoFiltro("");
    setDataFiltro("");
  }

  function handleExport() {
    alert("Exportar relatório: funcionalidade visual pronta para integração futura.");
  }

  return (
    <div className="relatorios-page">
      <div className="relatorios-header">
        <div>
          <p className="relatorios-label">Relatórios</p>
          <h1>Relatório de Funcionários</h1>
          <p className="relatorios-subtitle">
            Acompanhe o cadastro dos colaboradores, incluindo tarefas concluídas e não concluídas.
          </p>
        </div>

        <button className="relatorios-export-button" type="button" onClick={handleExport}>
          Exportar relatório
        </button>
      </div>

      <section className="relatorios-filtros">
        <div className="filtro-card">
          <label htmlFor="nomeFiltro">Nome</label>
          <input
            id="nomeFiltro"
            type="text"
            value={nomeFiltro}
            onChange={(event) => setNomeFiltro(event.target.value)}
            placeholder="Buscar por nome"
          />
        </div>

        <div className="filtro-card">
          <label htmlFor="cargoFiltro">Cargo</label>
          <input
            id="cargoFiltro"
            type="text"
            value={cargoFiltro}
            onChange={(event) => setCargoFiltro(event.target.value)}
            placeholder="Buscar por cargo"
          />
        </div>

        <div className="filtro-card">
          <label htmlFor="dataFiltro">Data de cadastro</label>
          <input
            id="dataFiltro"
            type="date"
            value={dataFiltro}
            onChange={(event) => setDataFiltro(event.target.value)}
          />
        </div>

        <div className="filtro-actions">
          <button type="button" className="btn-secondary" onClick={limparFiltros}>
            Limpar filtros
          </button>
          <span className="filtro-count">{listaFiltrada.length} funcionário(s) encontrados</span>
        </div>
      </section>

      <section className="relatorios-table-wrapper">
        <table className="relatorios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Data de cadastro</th>
              <th>Concluídas</th>
              <th>Não concluídas</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.length > 0 ? (
              listaFiltrada.map((funcionario) => (
                <tr key={funcionario.id}>
                  <td>{funcionario.nome}</td>
                  <td>{funcionario.cargo}</td>
                  <td>{funcionario.dataCriacao}</td>
                  <td>{funcionario.concluidas}</td>
                  <td>{funcionario.naoConcluidas}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="sem-resultados">
                  Nenhum funcionário encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Relatorios;
