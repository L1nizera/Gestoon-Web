import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import styles from "../../Adm/Home/style.module.css";
import localStyles from "./style.module.css";
import api from "../../../services/api";
import Modal from "../../../components/Modal/index.jsx";
import DataTable from "../../../components/ui/DataTable";

// ═════════════════════════════════════════════════════════════════
// 📌 MAPEAMENTOS DA API
// ═════════════════════════════════════════════════════════════════

const prioridadeApiMap = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

const statusMap = {
  Pendente: "statusPendente",
};

const statusClasses = {
  Pendente: styles.statusPendente,
  "Em andamento": styles.statusAndamento,
};

const columns = [
  {
    key: "titulo",
    label: "Título",
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
    render: (row) => <PrioridadeBadge prioridade={row.prioridade} />,
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
    key: "estimativaFormatada",
    label: "Estimativa",
    align: "center",
  },
];

// ═════════════════════════════════════════════════════════════════
// 🔧 COMPONENTES MENORES
// ═════════════════════════════════════════════════════════════════

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${statusClasses[status] || ""}`}>
      {status}
    </span>
  );
}

function PrioridadeBadge({ prioridade }) {
  const classMap = {
    Alta: styles.prioridadeAlta,
    Média: styles.prioridadeMedia,
    Baixa: styles.prioridadeBaixa,
  };
  return (
    <span className={`${styles.badge} ${classMap[prioridade] || ""}`}>
      {prioridade}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════
// 📋 PÁGINA PRINCIPAL: TAREFAS DISPONÍVEIS
// ═════════════════════════════════════════════════════════════════

export default function Tarefas() {
  // ───── STATES ─────
  const [tarefasDisponiveis, setTarefasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aceitandoId, setAceitandoId] = useState(null);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [removendoId, setRemovendoId] = useState(null);

  const { user } = useAuth();
  const tarefasKeyRef = useRef("");

  const successTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // ───── FILTROS ─────
  const [busca, setBusca] = useState("");
  const [filtroSetor, setFiltroSetor] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");

  // ───── FUNÇÕES AUXILIARES ─────

  /**
   * Formata data ISO para formato Brasil
   */
  function formatarDataHora(dataISO) {
    if (!dataISO) {
      return { dataCriacao: "-", horaCriacao: "-" };
    }

    const data = new Date(dataISO);

    return {
      dataCriacao: data.toLocaleDateString("pt-BR"),
      horaCriacao: data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }

  // 👇 COLE A NOVA FUNÇÃO AQUI
  function formatarEstimativa(minutos) {
    if (!minutos || minutos <= 0) {
      return "Não informada";
    }

    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas > 0 && minutosRestantes > 0) {
      return `${horas}h ${minutosRestantes}min`;
    }

    if (horas > 0) {
      return `${horas}h`;
    }

    return `${minutos} minutos`;
  }

  function gerarChaveTarefas(lista) {
    return lista
      .map((tarefa) =>
        [
          tarefa.id,
          tarefa.titulo,
          tarefa.prioridade,
          tarefa.setor,
          tarefa.criadoPor,
          tarefa.descricao,
          tarefa.dataCriacao,
          tarefa.horaCriacao,
          tarefa.tar_estimativa_minutos,
        ].join("-"),
      )
      .join("|");
  }

  /**
   * Busca tarefas da API e filtra apenas as pendentes
   */
  async function fetchTarefas(mostrarLoading = false) {
    try {
      if (mostrarLoading) {
        setLoading(true);
      }

      setError(null);

      const response = await api.get("/tarefas");
      const todosTarefas = response.data.dados || [];

      const setorFuncionario = user?.func_setor_id;

      const tarefasFormatadas = todosTarefas
        .filter((t) => {
          const tarefaPendente = Number(t.atr_status ?? 0) === 0;

          const mesmoSetor = Number(t.tar_setor_id) === Number(user?.setorId);

          return tarefaPendente && mesmoSetor;
        })
        .map((tarefa) => {
          const { dataCriacao, horaCriacao } = formatarDataHora(
            tarefa.tar_data_criacao,
          );

          return {
            id: tarefa.tar_id,
            titulo: tarefa.tar_titulo || "-",
            status: "Pendente",
            prioridade:
              prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",
            setor: tarefa.set_nome || "Sem setor",
            criadoPor:
              tarefa.usu_nome ||
              tarefa.user_nome ||
              `Usuário #${tarefa.tar_criado_por}`,
            descricao: tarefa.tar_descricao || "Sem descrição",
            dataCriacao,
            horaCriacao,
            estimativaFormatada: formatarEstimativa(
              tarefa.tar_estimativa_minutos,
            ),
            tar_id: tarefa.tar_id,
            tar_estimativa_minutos: tarefa.tar_estimativa_minutos,
          };
        });

      const novaChave = gerarChaveTarefas(tarefasFormatadas);

      if (novaChave !== tarefasKeyRef.current) {
        tarefasKeyRef.current = novaChave;
        setTarefasDisponiveis(tarefasFormatadas);
      }
    } catch (err) {
      console.error(
        "Erro ao buscar tarefas:",
        err.response?.data || err.message,
      );
      setError("Não foi possível carregar as tarefas. Tente novamente.");
      // show visual error message
      const msg =
        err.response?.data?.mensagem ||
        "Não foi possível carregar as tarefas. Tente novamente.";
      setErrorMessage(msg);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      if (mostrarLoading) {
        setLoading(false);
      }
    }
  }

  /**
   * Aceita uma tarefa e atualiza o status para "Em andamento" (1)
   */
  async function aceitarTarefa(tarefaId) {
    const funcionarioId =
      user?.id ||
      user?.funcionario_id ||
      user?.usuario_id ||
      user?.id_funcionario;

    if (!funcionarioId) {
      const msg =
        "Não foi possível identificar o usuário logado. Faça login novamente.";
      setErrorMessage(msg);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setErrorMessage(""), 5000);
      return;
    }

    try {
      setAceitandoId(tarefaId);

      await api.put(`/tarefas/aceitar/${tarefaId}`, {
        funcionario_id: funcionarioId,
      });

      setRemovendoId(tarefaId);

      setTimeout(() => {
        setTarefasDisponiveis((prev) => prev.filter((t) => t.id !== tarefaId));
      }, 400);

      if (tarefaSelecionada?.id === tarefaId) {
        setTarefaSelecionada(null);
      }

      // show visual success
      await fetchTarefas(false);
    } catch (err) {
      console.error(
        "Erro ao aceitar tarefa:",
        err.response?.data || err.message,
      );

      const msg =
        err.response?.data?.mensagem ||
        "Erro ao aceitar tarefa. Tente novamente mais tarde.";
      setErrorMessage(msg);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => setErrorMessage(""), 5000);

      await fetchTarefas(false);
    } finally {
      setAceitandoId(null);
    }
  }

  /**
   * Limpar todos os filtros
   */
  function limparFiltros() {
    setBusca("");
    setFiltroSetor("");
    setFiltroPrioridade("");
  }

  // ───── EFEITOS ─────
  useEffect(() => {
    fetchTarefas(true);

    const interval = setInterval(() => {
      fetchTarefas(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // limpar timeouts de mensagens quando o componente desmonta
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);
  // ───── COMPUTADOS ─────

  /**
   * Filtrar tarefas conforme busca e seletores
   */
  const tarefasFiltradas = useMemo(() => {
    return tarefasDisponiveis.filter((tarefa) => {
      const matchBusca = tarefa.titulo
        .toLowerCase()
        .includes(busca.toLowerCase());
      const matchSetor = filtroSetor === "" || tarefa.setor === filtroSetor;
      const matchPrioridade =
        filtroPrioridade === "" || tarefa.prioridade === filtroPrioridade;

      return matchBusca && matchSetor && matchPrioridade;
    });
  }, [tarefasDisponiveis, busca, filtroSetor, filtroPrioridade]);

  /**
   * Contar tarefas
   */
  const contagem = useMemo(() => {
    return {
      total: tarefasDisponiveis.length,
      filtradas: tarefasFiltradas.length,
    };
  }, [tarefasDisponiveis, tarefasFiltradas]);

  /**
   * Lista de setores únicos para dropdown
   */
  const setoresUnicos = useMemo(() => {
    return [...new Set(tarefasDisponiveis.map((t) => t.setor))].sort();
  }, [tarefasDisponiveis]);

  // ═════════════════════════════════════════════════════════════════
  // 🎨 RENDERIZAÇÃO
  // ═════════════════════════════════════════════════════════════════

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardContainer}>
        {/* CABEÇALHO DA PÁGINA */}
        <h1>Tarefas Disponíveis</h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          Visualize e aceite tarefas disponíveis para seu setor.
        </p>

        <div className={styles.resumo}>
          <div>Tarefas Pendentes: {contagem.total}</div>
        </div>

        {/* SEÇÃO PRINCIPAL */}
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
            <small>Setor</small>

            <select
              value={filtroSetor}
              onChange={(e) => setFiltroSetor(e.target.value)}
            >
              <option value="">Todos</option>

              {setoresUnicos.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <small>Prioridade</small>

            <select
              value={filtroPrioridade}
              onChange={(e) => setFiltroPrioridade(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
            </select>
          </div>
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} onClick={limparFiltros}>
            Limpar filtros
          </button>
        </div>

        {/* FEEDBACK VISUAL: sucess/error banners */}
        {(successMessage || errorMessage) && (
          <div className={styles.alertsWrapper}>
            {successMessage && (
              <div
                className={`${styles.alert} ${styles.alertSuccess}`}
                role="status"
              >
                <div className={styles.alertIcon} aria-hidden>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className={styles.alertContent}>{successMessage}</div>
                <button
                  className={styles.alertClose}
                  onClick={() => {
                    setSuccessMessage("");
                    if (successTimeoutRef.current)
                      clearTimeout(successTimeoutRef.current);
                  }}
                  aria-label="Fechar mensagem de sucesso"
                >
                  ✕
                </button>
              </div>
            )}

            {errorMessage && (
              <div
                className={`${styles.alert} ${styles.alertError}`}
                role="alert"
              >
                <div className={styles.alertIcon} aria-hidden>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17h.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className={styles.alertContent}>{errorMessage}</div>
                <button
                  className={styles.alertClose}
                  onClick={() => {
                    setErrorMessage("");
                    if (errorTimeoutRef.current)
                      clearTimeout(errorTimeoutRef.current);
                  }}
                  aria-label="Fechar mensagem de erro"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          // LOADING
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p style={{ marginTop: "1rem" }}>Carregando tarefas...</p>
          </div>
        ) : error ? (
          // ERRO
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>⚠️</div>
            <p>{error}</p>
            <button
              onClick={fetchTarefas}
              style={{
                marginTop: "1rem",
                padding: "0.8rem 1.6rem",
                borderRadius: "0.8rem",
                border: "none",
                background: "var(--primary)",
                color: "var(--color-white)",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1.35rem",
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : tarefasFiltradas.length === 0 ? (
          // VAZIO
          <div className={styles.emptyState}>
            <p>
              {busca || filtroSetor || filtroPrioridade
                ? "Nenhuma tarefa encontrada com estes filtros."
                : "Nenhuma tarefa disponível no momento."}
            </p>
            {(busca || filtroSetor || filtroPrioridade) && (
              <button
                onClick={limparFiltros}
                style={{
                  marginTop: "1rem",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "0.8rem",
                  border: "none",
                  background: "var(--primary)",
                  color: "var(--color-white)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1.35rem",
                }}
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP: TABELA */}
            <div className={localStyles.hideOnMobile}>
              <DataTable
                columns={columns}
                data={tarefasFiltradas}
                rowKey="id"
                onRowClick={setTarefaSelecionada}
                rowClassName={(row) =>
                  removendoId === row.id ? localStyles.removendo : ""
                }
                emptyMessage="Nenhuma tarefa encontrada."
              />
            </div>

            {/* MOBILE: CARDS */}
            <div className={localStyles.showOnMobile}>
              {tarefasFiltradas.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className={`
                  ${styles.card}
                  ${styles.mobileCard}
                  ${removendoId === tarefa.id ? localStyles.removendo : ""}
                `}
                  onClick={() => setTarefaSelecionada(tarefa)}
                >
                  {/* CABEÇALHO DO CARD */}
                  <div className={styles.cardHeader}>
                    <strong>{tarefa.titulo}</strong>
                    <PrioridadeBadge prioridade={tarefa.prioridade} />
                  </div>

                  {/* CORPO DO CARD */}
                  <div className={styles.cardBody}>
                    <p>
                      <strong>Setor:</strong> {tarefa.setor}
                    </p>
                    <p>
                      <strong>Criado por:</strong> {tarefa.criadoPor}
                    </p>
                    <p>
                      <strong>Descrição:</strong> {tarefa.descricao}
                    </p>
                  </div>

                  <div className={styles.mobileCardFooter}>
                    <div className={styles.cardFooter}>
                      <span>{tarefa.dataCriacao}</span>
                      <span>{tarefa.horaCriacao}</span>
                    </div>

                    <div className={styles.mobileCardActions}>
                      <button
                        className={`${styles.btnAccept} ${
                          aceitandoId === tarefa.id ? styles.loading : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          aceitarTarefa(tarefa.id);
                        }}
                        disabled={aceitandoId !== null}
                        title={
                          aceitandoId === tarefa.id
                            ? "Processando..."
                            : "Clique para aceitar esta tarefa"
                        }
                      >
                        {aceitandoId === tarefa.id
                          ? "✓ Aceitando..."
                          : "✓ Aceitar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL: DETALHES DA TAREFA */}
      {tarefaSelecionada && (
        <Modal
          title={tarefaSelecionada.titulo}
          onClose={() => setTarefaSelecionada(null)}
          variant="between"
          actions={
            <>
              <button
                className={styles.btnClose}
                onClick={() => setTarefaSelecionada(null)}
              >
                Fechar
              </button>

              <button
                className={styles.btnPrimary}
                onClick={() => aceitarTarefa(tarefaSelecionada.id)}
              >
                {aceitandoId === tarefaSelecionada.id ? "Aceitar" : "Aceitar"}
              </button>
            </>
          }
        >
          <div className={styles.modalGrid}>
            <div>
              <strong>Prioridade:</strong>

              <PrioridadeBadge prioridade={tarefaSelecionada.prioridade} />
            </div>

            <div>
              <strong>Setor:</strong>
              <p>{tarefaSelecionada.setor}</p>
            </div>

            <div>
              <strong>Criado por:</strong>
              <p>{tarefaSelecionada.criadoPor}</p>
            </div>

            <div>
              <strong>Data:</strong>
              <p>{tarefaSelecionada.dataCriacao}</p>
            </div>

            <div>
              <strong>Estimativa:</strong>
              <p>
                {formatarEstimativa(tarefaSelecionada.tar_estimativa_minutos)}
              </p>
            </div>
          </div>

          <div className={styles.descricaoArea}>
            <strong>Descrição:</strong>

            <div className={styles.descricaoBox}>
              <p>{tarefaSelecionada.descricao}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
