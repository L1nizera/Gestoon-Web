import { useState, useMemo } from "react";
import styles from "./style.module.css";
import { tasks } from "../../data/Tasks";

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

function TaskActions({ task, onAccept, onComplete, onCancel }) {
  if (task.status === "Pendente") {
    return (
      <button className={styles.btnAccept} onClick={() => onAccept(task.id)}>
        Aceitar
      </button>
    );
  }

  if (task.status === "Em andamento") {
    return (
      <div className={styles.actionsGroup}>
        <button className={styles.btnComplete} onClick={() => onComplete(task.id)}>
          Concluir
        </button>
        <button className={styles.btnCancel} onClick={() => onCancel(task.id)}>
          Cancelar
        </button>
      </div>
    );
  }

  return <span className={styles.emptyAction}>-</span>;
}

export default function Tarefas() {
  const [taskList, setTaskList] = useState(tasks);

  const activeTasks = useMemo(
    () => taskList.filter((task) => task.status !== "Concluída" && task.status !== "Cancelada"),
    [taskList],
  );

  const counts = useMemo(() => {
    return taskList.reduce(
      (acc, task) => {
        if (task.status === "Pendente") acc.pendente += 1;
        if (task.status === "Em andamento") acc.andamento += 1;
        return acc;
      },
      { pendente: 0, andamento: 0 },
    );
  }, [taskList]);

  function updateStatus(taskId, nextStatus) {
    setTaskList((prev) =>
      prev.map((item) => (item.id === taskId ? { ...item, status: nextStatus } : item)),
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Painel de Tarefas</h1>
          <p className={styles.subtitle}>
            Acompanhe suas atividades do dia, atualize o andamento das tarefas e consulte
            o histórico de entregas.
          </p>
        </div>

        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span>Pendentes</span>
            <strong>{counts.pendente}</strong>
          </article>
          <article className={styles.summaryCard}>
            <span>Em andamento</span>
            <strong>{counts.andamento}</strong>
          </article>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Minhas Tarefas</h2>
            <p>Lista completa de tarefas com todas as colunas da tela Home e ações imediatas.</p>
          </div>
          <span className={styles.sectionBadge}>{activeTasks.length} tarefas ativas</span>
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
              {activeTasks.map((task) => (
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
                    <TaskActions
                      task={task}
                      onAccept={(id) => updateStatus(id, "Em andamento")}
                      onComplete={(id) => updateStatus(id, "Concluída")}
                      onCancel={(id) => updateStatus(id, "Cancelada")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {activeTasks.length === 0 && (
            <div className={styles.emptyState}>Nenhuma tarefa ativa encontrada.</div>
          )}
        </div>

        {/* ===== MOBILE (CARDS) ===== */}
        <div className={styles.cardsContainer}>
          {activeTasks.map((task) => (
            <div key={task.id} className={styles.card}>
              {/* HEADER */}
              <div className={styles.cardHeader}>
                <h1>{task.titulo}</h1>
                <StatusBadge status={task.status} />
              </div>

              {/* BODY */}
              <div className={styles.cardBody}>
                <p>
                  <strong>Prioridade:</strong> {task.prioridade}
                </p>
                <p>
                  <strong>Setor:</strong> {task.setor}
                </p>
                <p>
                  <strong>Criado por:</strong> {task.criadoPor}
                </p>
                <p>
                  <strong>Descrição:</strong> {task.descricao}
                </p>
              </div>

              {/* FOOTER */}
              <div className={styles.cardFooter}>
                <span>{task.dataCriacao}</span>
                <span>{task.horaCriacao}</span>
              </div>

              {/* ACTIONS */}
              <div className={styles.cardActions}>
                <TaskActions
                  task={task}
                  onAccept={(id) => updateStatus(id, "Em andamento")}
                  onComplete={(id) => updateStatus(id, "Concluída")}
                  onCancel={(id) => updateStatus(id, "Cancelada")}
                />
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <div className={styles.emptyState}>Nenhuma tarefa ativa encontrada.</div>
          )}
        </div>
      </section>
    </div>
  );
}
