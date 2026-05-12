import { useState, useMemo } from "react";
import styles from "./style.module.css";
import { tasks } from "../../../data/Tasks";

const statusClasses = {
  Pendente: styles.statusPendente,
  "Em andamento": styles.statusAndamento,
  "Concluída": styles.statusConcluida,
  "Cancelada": styles.statusCancelada,
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${statusClasses[status] || ""}`}>
      {status}
    </span>
  );
}

export default function Historico() {
  const [taskList, setTaskList] = useState(tasks);

  const historyTasks = useMemo(
    () => taskList.filter((task) => task.status === "Concluída" || task.status === "Cancelada"),
    [taskList],
  );

  const counts = useMemo(() => {
    return taskList.reduce(
      (acc, task) => {
        if (task.status === "Concluída") acc.concluida += 1;
        if (task.status === "Cancelada") acc.cancelada += 1;
        return acc;
      },
      { concluida: 0, cancelada: 0 },
    );
  }, [taskList]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Histórico de Tarefas</h1>
          <p className={styles.subtitle}>
            Registros finais das tarefas já concluídas ou canceladas.
          </p>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Concluídas</span>
            <strong>{counts.concluida}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Canceladas</span>
            <strong>{counts.cancelada}</strong>
          </article>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Histórico</h2>
            <p>Registros finais das tarefas já concluídas ou canceladas.</p>
          </div>
          <span className={styles.sectionBadge}>{historyTasks.length} registros</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Título</th>
                <th className={styles.textCenter}>Status</th>
                <th className={styles.textCenter}>Prioridade</th>
                <th className={styles.textCenter}>Setor</th>
                <th className={styles.textCenter}>Data</th>
                <th className={styles.textCenter}>Hora</th>
                <th className={styles.textCenter}>Criado por</th>
                <th className={styles.textCenter}>Descrição</th>
                <th className={styles.textCenter}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historyTasks.map((task) => (
                <tr key={task.id} className={styles.row}>
                  <td>{task.titulo}</td>
                  <td className={styles.textCenter}>
                    <StatusBadge status={task.status} />
                  </td>
                  <td className={styles.textCenter}>{task.prioridade}</td>
                  <td className={styles.textCenter}>{task.setor}</td>
                  <td className={styles.textCenter}>{task.dataCriacao}</td>
                  <td className={styles.textCenter}>{task.horaCriacao}</td>
                  <td className={styles.textCenter}>{task.criadoPor}</td>
                  <td className={styles.textCenter}>{task.descricao}</td>
                  <td className={styles.flexCenter}>
                    <span className={styles.emptyAction}>-</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {historyTasks.length === 0 && (
            <div className={styles.emptyState}>Nenhum registro de histórico encontrado.</div>
          )}
        </div>
      </section>
    </div>
  );
}