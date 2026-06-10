import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import styles from "../../Adm/Home/style.module.css";
import localStyles from "./style.module.css";
import DataTable from "../../../components/ui/DataTable";
import Modal from "../../../components/Modal/index.jsx";
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

const statusOptions = ["Em andamento", "Concluída", "Cancelada"];
const prioridadeOptions = ["Alta", "Média", "Baixa"];

const columns = [
  {
    key: "titulo",
    label: "Título",
    render: (row) => (
      <span
        className={styles.linkTitulo}
        onClick={(e) => {
          e.stopPropagation();
          setTarefaSelecionada(row);
        }}
      >
        {row.titulo}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    align: "center",
    render: (row) => (
      <span
        className={`${styles.badge} ${
          styles[statusMap[row.status]] || styles.statusPendente
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
        className={`${styles.badge} ${
          styles[prioridadeMap[row.prioridade]] || styles.prioridadeMedia
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
];

function resolverUrlFoto(fotNome) {
  if (!fotNome) return null;

  if (fotNome.startsWith("http://") || fotNome.startsWith("https://")) {
    return fotNome;
  }

  return `http://localhost:3333/uploads/tarefas/${fotNome}`;
}

export default function MinhasTarefas() {
  const [taskList, setTaskList] = useState([]);
  const { user } = useAuth();

  const { showToast } = useToast();

  const [selectedTask, setSelectedTask] = useState(null);
  const [fotoTarefa, setFotoTarefa] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [descricaoFoto, setDescricaoFoto] = useState("");
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");

  useEffect(() => {
    carregarMinhasTarefas();
  }, []);

  function handleTaskSelect(task) {
    setSelectedTask(task);
    setFotoTarefa(null);
    setPreviewFoto(task.foto || null);
    setDescricaoFoto(task.fotoDescricao || "");
  }

  function limparModal() {
    setSelectedTask(null);
    setFotoTarefa(null);
    setPreviewFoto(null);
    setDescricaoFoto("");
  }

  function handleFotoChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    setFotoTarefa(file);
    setPreviewFoto(URL.createObjectURL(file));
  }

  async function enviarFotoTarefa(tarefaId) {
    if (!fotoTarefa) return;

    const formData = new FormData();

    formData.append("tarefa", tarefaId);
    formData.append("descricao", descricaoFoto.trim());
    formData.append("img", fotoTarefa);

    const response = await api.post("/tarefaFotos", formData);

    console.log("Foto enviada:", response.data);
  }

  function validarFotoAntesDeFinalizar() {
    if (fotoTarefa && !descricaoFoto.trim()) {
      showToast(
        "Descrição da foto: informe uma descrição antes de confirmar ou cancelar a tarefa.",
        "warning",
      );
      return false;
    }

    return true;
  }

  async function confirmarTarefa() {
    if (!selectedTask) return;

    if (!validarFotoAntesDeFinalizar()) return;

    if (
      selectedTask.status === "Concluída" ||
      selectedTask.status === "Cancelada"
    ) {
      showToast(
        "Esta tarefa já foi finalizada e não pode ser alterada.",
        "warning",
      );
      return;
    }

    try {
      const payload = {
        titulo: selectedTask.titulo,
        descricao: selectedTask.descricao,
        prioridade: selectedTask.prioridadeId,
        setorId: selectedTask.setorId,
        criadoPor: selectedTask.criadoPorId,
        estimativaMinutos: selectedTask.estimativaMinutos,
        status: 2,
        funcionarioId: selectedTask.funcionarioId,
      };

      await api.patch(`/tarefas/${selectedTask.id}`, payload);

      if (fotoTarefa) {
        await enviarFotoTarefa(selectedTask.id);
      }

      await carregarMinhasTarefas();

      setSelectedTask(null);
      setFotoTarefa(null);
      setPreviewFoto(null);
      setDescricaoFoto("");

      showToast("Tarefa confirmada com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao confirmar tarefa:", error.response?.data || error);

      showToast(
        error.response?.data?.mensagem ||
          error.response?.data?.dados ||
          error.message ||
          "Erro ao confirmar tarefa.",
        "error",
      );
    }
  }

  async function cancelarTarefa() {
    if (!selectedTask) return;

    if (!validarFotoAntesDeFinalizar()) return;

    if (
      selectedTask.status === "Concluída" ||
      selectedTask.status === "Cancelada"
    ) {
      showToast(
        "Esta tarefa já foi finalizada e não pode ser alterada.",
        "warning",
      );
      return;
    }

    try {
      const payload = {
        titulo: selectedTask.titulo,
        descricao: selectedTask.descricao,
        prioridade: selectedTask.prioridadeId,
        setorId: selectedTask.setorId,
        criadoPor: selectedTask.criadoPorId,
        estimativaMinutos: selectedTask.estimativaMinutos,
        status: 3,
        funcionarioId: selectedTask.funcionarioId,
      };

      await api.patch(`/tarefas/${selectedTask.id}`, payload);

      if (fotoTarefa) {
        await enviarFotoTarefa(selectedTask.id);
      }

      await carregarMinhasTarefas();

      setSelectedTask(null);
      setFotoTarefa(null);
      setPreviewFoto(null);
      setDescricaoFoto("");

      showToast("Tarefa cancelada com sucesso.", "success");
    } catch (error) {
      console.error("Erro ao cancelar tarefa:", error.response?.data || error);

      showToast(
        error.response?.data?.mensagem ||
          error.response?.data?.dados ||
          error.message ||
          "Erro ao cancelar tarefa.",
        "error",
      );
    }
  }

  function tarefaFinalizada() {
    return (
      selectedTask?.status === "Concluída" ||
      selectedTask?.status === "Cancelada"
    );
  }

  const carregarMinhasTarefas = async () => {
    try {
      const [tarefasResponse, fotosResponse] = await Promise.all([
        api.get("/tarefas"),
        api.get("/tarefaFotos"),
      ]);

      const todas = tarefasResponse.data.dados || [];
      const fotos = fotosResponse.data.dados || [];

      console.log("USUARIO LOGADO:", user);
      console.log("TODAS AS TAREFAS:", todas);
      console.log("FOTOS:", fotos);

      const minhas = todas

        .filter(
          (t) =>
            Number(t.atr_funcionario_id) === Number(user.funcionarioId) &&
            Number(t.atr_status) !== 0,
        )
        .map((tarefa) => {
          console.log("USER:", user);
          console.log("TAREFAS:", todas);

          const data = new Date(tarefa.tar_data_criacao);

          const fotosDaTarefa = fotos
            .filter(
              (foto) => Number(foto.fot_tarefa_id) === Number(tarefa.tar_id),
            )
            .sort(
              (a, b) =>
                new Date(b.fot_data_envio).getTime() -
                new Date(a.fot_data_envio).getTime(),
            );

          const fotoDaTarefa = fotosDaTarefa[0] || null;

          console.log("FOTO DA TAREFA:", tarefa.tar_id, fotoDaTarefa);

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

            prioridade:
              prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",
            prioridadeId: Number(tarefa.tar_prioridade),

            setor: tarefa.set_nome || "-",
            setorId: Number(tarefa.tar_setor_id),

            criadoPor: tarefa.usu_nome || "-",
            criadoPorId: Number(tarefa.tar_criado_por),

            funcionarioId: Number(tarefa.atr_funcionario_id),

            descricao: tarefa.tar_descricao || "-",
            estimativaMinutos: Number(tarefa.tar_estimativa_minutos) || 0,

            dataCriacao: data.toLocaleDateString("pt-BR"),
            horaCriacao: data.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),

            foto: resolverUrlFoto(fotoDaTarefa?.fot_nome),
            fotoDescricao: fotoDaTarefa?.fot_descricao || "",
            temRegistroFoto: Boolean(fotoDaTarefa),
          };
        });

      console.log("MINHAS TAREFAS FILTRADAS:", minhas);

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
          task.status === "Cancelada",
      ),
    [taskList],
  );

  const setores = useMemo(
    () =>
      Array.from(
        new Set(taskList.map((task) => task.setor).filter(Boolean)),
      ).sort(),
    [taskList],
  );

  const filteredTarefas = useMemo(() => {
    let resultado = [...minhasTarefas];

    if (busca.trim()) {
      const texto = busca.trim().toLowerCase();
      resultado = resultado.filter(
        (task) =>
          task.titulo.toLowerCase().includes(texto) ||
          task.descricao.toLowerCase().includes(texto) ||
          task.criadoPor.toLowerCase().includes(texto) ||
          task.setor.toLowerCase().includes(texto),
      );
    }

    if (statusFiltro) {
      resultado = resultado.filter((task) => task.status === statusFiltro);
    }

    if (prioridadeFiltro) {
      resultado = resultado.filter(
        (task) => task.prioridade === prioridadeFiltro,
      );
    }

    if (setorFiltro) {
      resultado = resultado.filter((task) => task.setor === setorFiltro);
    }

    return resultado;
  }, [minhasTarefas, busca, statusFiltro, prioridadeFiltro, setorFiltro]);

  const limparFiltros = () => {
    setBusca("");
    setStatusFiltro("");
    setPrioridadeFiltro("");
    setSetorFiltro("");
  };

  const counts = useMemo(() => {
    return taskList.reduce(
      (acc, task) => {
        if (task.status === "Em andamento") acc.andamento += 1;
        if (task.status === "Concluída") acc.concluida += 1;
        if (task.status === "Cancelada") acc.cancelada += 1;
        return acc;
      },
      { andamento: 0, concluida: 0, cancelada: 0 },
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
          <div>Total: {filteredTarefas.length}</div>
        </div>

        <div className={styles.filtrosAvancados}>
          <div>
            <small>Buscar</small>
            <input
              className={styles.busca}
              type="text"
              placeholder="Buscar tarefa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div>
            <small>Status</small>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <small>Prioridade</small>
            <select
              value={prioridadeFiltro}
              onChange={(e) => setPrioridadeFiltro(e.target.value)}
            >
              <option value="">Todas</option>
              {prioridadeOptions.map((prioridade) => (
                <option key={prioridade} value={prioridade}>
                  {prioridade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <small>Setor</small>
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
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} onClick={limparFiltros}>
            Limpar filtros
          </button>

          <span>{filteredTarefas.length} registros</span>
        </div>

        <div className={localStyles.hideOnMobile}>
          <DataTable
            columns={columns}
            data={filteredTarefas}
            rowKey="id"
            onRowClick={handleTaskSelect}
            emptyMessage="Nenhuma tarefa encontrada."
            variant="minhasTarefas"
          />
        </div>

        <div className={localStyles.showOnMobile}>
          {filteredTarefas.length === 0 ? (
            <p className={styles.textCenter}>Nenhuma tarefa encontrada.</p>
          ) : (
            <div className={localStyles.cardList}>
              {filteredTarefas.map((task) => (
                <article
                  key={task.id}
                  className={`${styles.card} ${localStyles.taskCard}`}
                  onClick={() => handleTaskSelect(task)}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      handleTaskSelect(task);
                    }
                  }}
                >
                  <div className={styles.cardHeader}>
                    <div>
                      <h2>{task.titulo}</h2>
                      <p className={localStyles.taskMeta}>ID {task.id}</p>
                    </div>
                    <span
                      className={`${styles.badge} ${styles[statusMap[task.status]] || styles.statusPendente}`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <p className={localStyles.taskSubtitle}>{task.setor}</p>

                    <div className={localStyles.taskCardGrid}>
                      <div className={localStyles.taskField}>
                        <span className={localStyles.taskLabel}>
                          Prioridade
                        </span>
                        <span className={localStyles.taskValue}>
                          {task.prioridade}
                        </span>
                      </div>
                      <div className={localStyles.taskField}>
                        <span className={localStyles.taskLabel}>
                          Criado por
                        </span>
                        <span className={localStyles.taskValue}>
                          {task.criadoPor}
                        </span>
                      </div>
                    </div>

                    <div className={localStyles.taskCardGrid}>
                      <div className={localStyles.taskField}>
                        <span className={localStyles.taskLabel}>Data</span>
                        <span className={localStyles.taskValue}>
                          {task.dataCriacao}
                        </span>
                      </div>
                      <div className={localStyles.taskField}>
                        <span className={localStyles.taskLabel}>Hora</span>
                        <span className={localStyles.taskValue}>
                          {task.horaCriacao}
                        </span>
                      </div>
                    </div>

                    <div className={localStyles.taskDescription}>
                      <strong>Descrição</strong>
                      <p>{task.descricao || "Sem descrição"}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {selectedTask && (
          <Modal
            title={selectedTask.titulo}
            onClose={limparModal}
            variant="between"
            actions={
              <>
                <button className={styles.btnClose} onClick={limparModal}>
                  Fechar
                </button>

                {!tarefaFinalizada() && (
                  <>
                    <button
                      className={styles.btnPrimary}
                      onClick={confirmarTarefa}
                    >
                      Confirmar
                    </button>

                    <button
                      className={styles.btnDanger}
                      onClick={cancelarTarefa}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </>
            }
          >
            <div className={styles.modalGrid}>
              <div>
                <strong>Status:</strong>
                <span
                  className={`${styles.badge} ${
                    styles[statusMap[selectedTask.status]] ||
                    styles.statusPendente
                  }`}
                >
                  {selectedTask.status}
                </span>
              </div>

              <div>
                <strong>Prioridade:</strong>
                <span
                  className={`${styles.badge} ${
                    styles[prioridadeMap[selectedTask.prioridade]] ||
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

            {!tarefaFinalizada() && (
              <>
                <div className={styles.formGroup}>
                  <label>Foto da tarefa</label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.full}`}>
                  <label>Descrição da foto</label>

                  <textarea
                    rows={2}
                    value={descricaoFoto}
                    onChange={(e) => setDescricaoFoto(e.target.value)}
                    placeholder="Ex: Foto da área limpa, produto conferido, gôndola organizada..."
                  />
                </div>
              </>
            )}

            {tarefaFinalizada() && descricaoFoto && (
              <div className={styles.descricaoArea}>
                <strong>Descrição da foto:</strong>

                <div className={styles.descricaoBox}>
                  <p>{descricaoFoto}</p>
                </div>
              </div>
            )}

            {previewFoto && (
              <div className={styles.descricaoArea}>
                <strong>
                  {fotoTarefa ? "Pré-visualização local:" : "Foto salva:"}
                </strong>

                <div
                  className={styles.descricaoBox}
                  style={{
                    minHeight: "22rem",
                    maxHeight: "26rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={previewFoto}
                    alt="Foto da tarefa"
                    onError={() => setPreviewFoto(null)}
                    style={{
                      width: "100%",
                      height: "100%",
                      maxHeight: "24rem",
                      objectFit: "contain",
                      borderRadius: "0.8rem",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            )}

            {tarefaFinalizada() &&
              !previewFoto &&
              !selectedTask.temRegistroFoto && (
                <div className={styles.descricaoArea}>
                  <strong>Foto da tarefa:</strong>

                  <div className={styles.descricaoBox}>
                    <p>Nenhuma foto foi enviada para esta tarefa.</p>
                  </div>
                </div>
              )}

            {tarefaFinalizada() &&
              !previewFoto &&
              selectedTask.temRegistroFoto && (
                <div className={styles.descricaoArea}>
                  <strong>Foto da tarefa:</strong>

                  <div className={styles.descricaoBox}>
                    <p>
                      Existe um registro de foto para esta tarefa, mas o arquivo
                      da imagem não foi encontrado na pasta de uploads.
                    </p>
                  </div>
                </div>
              )}
          </Modal>
        )}
      </div>
    </div>
  );
}
