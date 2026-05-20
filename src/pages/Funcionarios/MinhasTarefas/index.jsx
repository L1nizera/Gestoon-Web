import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import styles from "../../Adm/Home/style.module.css";
import DataTable from "../../../components/ui/DataTable";
import Modal from "../../../components/Modal/Modal";
import { useToast } from "../../../components/ui/Toast";

const prioridadeApiMap = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

const statusMap = {
  Pendente: "statusPendente",
  "Em andamento": "statusAndamento",
  Concluída: "statusConcluida",
  Cancelada: "statusCancelada",
};

const prioridadeMap = {
  Alta: "prioridadeAlta",
  Média: "prioridadeMedia",
  Baixa: "prioridadeBaixa",
};

const columns = [
  {
    key: "titulo",
    label: "Título",
    render: (row) => <span title={row.titulo}>{row.titulo}</span>,
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    render: (row) => (
      <span
        className={`${styles.badge} ${styles[statusMap[row.status]] || styles.statusPendente
          }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "prioridade",
    label: "Prioridade",
    align: "center",
    render: (row) => (
      <span
        className={`${styles.badge} ${styles[prioridadeMap[row.prioridade]] || styles.prioridadeMedia
          }`}
      >
        {row.prioridade}
      </span>
    ),
  },
  {
    key: "setor",
    label: "Setor",
    align: "center",
  },
  {
    key: "criadoPor",
    label: "Criado por",
    align: "center",
  },
  {
    key: "dataCriacao",
    label: "Data",
    align: "center",
  },
  {
    key: "horaCriacao",
    label: "Hora",
    align: "center",
  },
  {
    key: "descricao",
    label: "Descrição",
    render: (row) => <span title={row.descricao}>{row.descricao}</span>,
  },
];

export default function MinhasTarefas() {
  const [taskList, setTaskList] = useState([]);
  const { user } = useAuth();

  const { showToast } = useToast();

  const [selectedTask, setSelectedTask] = useState(null);
  const [fotoTarefa, setFotoTarefa] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  useEffect(() => {
    carregarMinhasTarefas();
  }, []);

  function handleFotoChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setFotoTarefa(file);
    setPreviewFoto(URL.createObjectURL(file));
  }

  async function confirmarTarefa() {
    if (!selectedTask) return;

    try {
      const payload = {
        titulo: selectedTask.titulo,
        descricao: selectedTask.descricao,
        prioridade: selectedTask.prioridadeId,
        setorId: selectedTask.setorId,
        criadoPor: 1,
        estimativaMinutos: selectedTask.estimativaMinutos,
        status: 2,
        funcionarioId: selectedTask.funcionarioId,
      };

      await api.patch(`/tarefas/${selectedTask.id}`, payload);

      await carregarMinhasTarefas();

      setSelectedTask(null);
      setFotoTarefa(null);
      setPreviewFoto(null);

      showToast("Tarefa confirmada com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao confirmar tarefa:", error.response?.data || error);

      showToast(
        error.response?.data?.mensagem ||
        error.response?.data?.dados ||
        "Erro ao confirmar tarefa.",
        "error",
      );
    }
  }

  async function cancelarTarefa() {
    if (!selectedTask) return;

    try {
      const payload = {
        titulo: selectedTask.titulo,
        descricao: selectedTask.descricao,
        prioridade: selectedTask.prioridadeId,
        setorId: selectedTask.setorId,
        criadoPor: 1,
        estimativaMinutos: selectedTask.estimativaMinutos,
        status: 3,
        funcionarioId: selectedTask.funcionarioId,
      };

      await api.patch(`/tarefas/${selectedTask.id}`, payload);

      await carregarMinhasTarefas();

      setSelectedTask(null);
      setFotoTarefa(null);
      setPreviewFoto(null);

      showToast("Tarefa cancelada com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao cancelar tarefa:", error.response?.data || error);

      showToast(
        error.response?.data?.mensagem ||
        error.response?.data?.dados ||
        "Erro ao cancelar tarefa.",
        "error",
      );
    }
  }

  const carregarMinhasTarefas = async () => {
    try {
      const response = await api.get("/tarefas");
      const todas = response.data.dados || [];

      const minhas = todas

        .filter(
          (t) =>
            Number(t.atr_funcionario_id) === Number(user.funcionarioId) &&
            Number(t.atr_status) !== 0
        )
        .map((tarefa) => {
          console.log("USER:", user);
          console.log("TAREFAS:", todas);

          const data = new Date(tarefa.tar_data_criacao);

          return {
            id: tarefa.tar_id,
            titulo: tarefa.tar_titulo,

            status:
              Number(tarefa.atr_status) === 1
                ? "Em andamento"
                : Number(tarefa.atr_status) === 2
                  ? "Concluída"
                  : "Cancelada",

            statusNumero: Number(tarefa.atr_status),

            prioridade: prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",
            prioridadeId: Number(tarefa.tar_prioridade),

            setor: tarefa.set_nome || "-",
            setorId: Number(tarefa.tar_setor_id),

            criadoPor: tarefa.usu_nome || "-",
            funcionarioId: Number(tarefa.atr_funcionario_id),

            descricao: tarefa.tar_descricao || "-",
            estimativaMinutos: Number(tarefa.tar_estimativa_minutos) || 0,

            dataCriacao: data.toLocaleDateString("pt-BR"),
            horaCriacao: data.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),

            foto: tarefa.tar_foto || tarefa.atr_foto || null,
          };
        });

      setTaskList(minhas);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
    }
  };

  const minhasTarefas = useMemo(
    () =>
      taskList.filter(
        (task) =>
          task.status === "Em andamento" ||
          task.status === "Concluída" ||
          task.status === "Cancelada"
      ),
    [taskList]
  );

  const counts = useMemo(() => {
    return taskList.reduce(
      (acc, task) => {
        if (task.status === "Em andamento") acc.andamento += 1;
        if (task.status === "Concluída") acc.concluida += 1;
        if (task.status === "Cancelada") acc.cancelada += 1;
        return acc;
      },
      { andamento: 0, concluida: 0, cancelada: 0 }
    );
  }, [taskList]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardContainer}>
        <h1>Minhas Tarefas</h1>

        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Acompanhe suas tarefas em andamento, concluídas e canceladas.
        </p>

        <div className={styles.resumo}>
          <div>Em andamento: {counts.andamento}</div>
          <div>Concluídas: {counts.concluida}</div>
          <div>Canceladas: {counts.cancelada}</div>
          <div>Total: {minhasTarefas.length}</div>
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} disabled>
            Minhas tarefas
          </button>

          <span>{minhasTarefas.length} registros</span>
        </div>

        <DataTable
          columns={columns}
          data={minhasTarefas}
          rowKey="id"
          onRowClick={(task) => {
            setSelectedTask(task);
            setFotoTarefa(null);
            setPreviewFoto(task.foto || null);
          }}
          emptyMessage="Nenhuma tarefa encontrada."
          variant="minhasTarefas"
        />

        {selectedTask && (
          <Modal
            title={selectedTask.titulo}
            onClose={() => {
              setSelectedTask(null);
              setFotoTarefa(null);
              setPreviewFoto(null);
            }}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnClose}
                  onClick={() => {
                    setSelectedTask(null);
                    setFotoTarefa(null);
                    setPreviewFoto(null);
                  }}
                >
                  Fechar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={confirmarTarefa}
                  disabled={selectedTask.status === "Concluída"}
                >
                  Confirmar
                </button>

                <button
                  className={styles.btnDanger}
                  onClick={cancelarTarefa}
                  disabled={selectedTask.status === "Cancelada"}
                >
                  Cancelar
                </button>
              </>
            }
          >
            <div className={styles.modalGrid}>
              <div>
                <strong>Status:</strong>
                <span
                  className={`${styles.badge} ${styles[statusMap[selectedTask.status]] || styles.statusPendente
                    }`}
                >
                  {selectedTask.status}
                </span>
              </div>

              <div>
                <strong>Prioridade:</strong>
                <span
                  className={`${styles.badge} ${styles[prioridadeMap[selectedTask.prioridade]] ||
                    styles.prioridadeMedia
                    }`}
                >
                  {selectedTask.prioridade}
                </span>
              </div>

              <div>
                <strong>Setor:</strong>
                <p>{selectedTask.setor}</p>
              </div>

              <div>
                <strong>Criado por:</strong>
                <p>{selectedTask.criadoPor}</p>
              </div>

              <div>
                <strong>Data:</strong>
                <p>{selectedTask.dataCriacao}</p>
              </div>

              <div>
                <strong>Hora:</strong>
                <p>{selectedTask.horaCriacao}</p>
              </div>
            </div>

            <div className={styles.descricaoArea}>
              <strong>Descrição:</strong>

              <div className={styles.descricaoBox}>
                <p>{selectedTask.descricao || "Sem descrição"}</p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Foto da tarefa</label>

              <input type="file" accept="image/*" onChange={handleFotoChange} />
            </div>

            {previewFoto && (
              <div className={styles.descricaoArea}>
                <strong>Pré-visualização:</strong>

                <div className={styles.descricaoBox}>
                  <img
                    src={previewFoto}
                    alt="Foto da tarefa"
                    style={{
                      width: "100%",
                      maxHeight: "260px",
                      objectFit: "contain",
                      borderRadius: "0.8rem",
                    }}
                  />
                </div>
              </div>
            )}
          </Modal>
        )}

      </div>
    </div>
  );
}