import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import styles from "./style.module.css";
import api from "../../../services/api";

// ═════════════════════════════════════════════════════════════════
// 📌 MAPEAMENTOS DA API
// ═════════════════════════════════════════════════════════════════

const prioridadeApiMap = {
  1: "Baixa",
  2: "Média",
  3: "Alta",
};

const setorApiMap = {
  1: "Administrativo",
  2: "Financeiro",
  3: "Operacional",
  4: "Atendimento",
  5: "Limpeza",
  6: "Estoque",
  7: "Logística",
};

const statusClasses = {
  Pendente: styles.statusPendente,
  "Em andamento": styles.statusAndamento,
};

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
          tarefa.estimativaMinutos,
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

      const tarefasFormatadas = todosTarefas
        .filter((t) => Number(t.atr_status ?? 0) === 0)
        .map((tarefa) => {
          const { dataCriacao, horaCriacao } = formatarDataHora(
            tarefa.tar_data_criacao,
          );

          return {
            id: tarefa.tar_id,
            titulo: tarefa.tar_titulo || "-",
            prioridade:
              prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",
            setor:
              tarefa.set_nome ||
              setorApiMap[Number(tarefa.tar_setor_id)] ||
              `Setor #${tarefa.tar_setor_id}`,
            criadoPor:
              tarefa.usu_nome ||
              tarefa.user_nome ||
              `Usuário #${tarefa.tar_criado_por}`,
            descricao: tarefa.tar_descricao || "Sem descrição",
            dataCriacao,
            horaCriacao,
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
      const msg = err.response?.data?.mensagem || "Não foi possível carregar as tarefas. Tente novamente.";
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
      user?.id || user?.funcionario_id || user?.usuario_id || user?.id_funcionario;

    if (!funcionarioId) {
      const msg = "Não foi possível identificar o usuário logado. Faça login novamente.";
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

      setTarefasDisponiveis((prev) => prev.filter((t) => t.id !== tarefaId));

      if (tarefaSelecionada?.id === tarefaId) {
        setTarefaSelecionada(null);
      }

      // show visual success
      setSuccessMessage("Tarefa aceita com sucesso.");
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setSuccessMessage(""), 4000);
      await fetchTarefas(false);
    } catch (err) {
      console.error(
        "Erro ao aceitar tarefa:",
        err.response?.data || err.message,
      );

      const msg = err.response?.data?.mensagem || "Erro ao aceitar tarefa. Tente novamente mais tarde.";
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
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboard}>
        {/* CABEÇALHO DA PÁGINA */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <h1 className={styles.title}>Tarefas Disponíveis</h1>
            <p className={styles.subtitle}>
              Visualize e aceite as tarefas pendentes para começar a trabalhar.
              Após aceitar, elas aparecerão em "Minhas Tarefas em Andamento".
            </p>
          </div>

          {/* CARDS DE RESUMO */}
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>Disponíveis</span>
              <strong>{contagem.total}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span>Mostradas</span>
              <strong>{contagem.filtradas}</strong>
            </article>
          </div>
        </div>

        {/* SEÇÃO PRINCIPAL */}
        <section className={styles.section}>

          {/* FILTROS */}
          <div className={styles.filtrosContainer}>
            <div className={styles.filtroGroup}>
              <label className={styles.filtroLabel}> Buscar por título</label>
              <input
                type="text"
                placeholder="Digite o título da tarefa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <div className={styles.filtroLinha}>
              <div className={styles.filtroGroup}>
                <label className={styles.filtroLabel}> Setor</label>
                <select
                  value={filtroSetor}
                  onChange={(e) => setFiltroSetor(e.target.value)}
                >
                  <option value="">Todos os setores</option>
                  {setoresUnicos.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.filtroGroup}>
                <label className={styles.filtroLabel}> Prioridade</label>
                <select
                  value={filtroPrioridade}
                  onChange={(e) => setFiltroPrioridade(e.target.value)}
                >
                  <option value="">Todas as prioridades</option>
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
            </div>

            {(busca || filtroSetor || filtroPrioridade) && (
              <button
                onClick={limparFiltros}
                style={{
                  marginTop: "auto",
                  padding: "0.8rem 1.2rem",
                  borderRadius: "0.8rem",
                  border: "none",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1.35rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "var(--border-default)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "var(--bg-surface)";
                }}
              >
                ✕ Limpar filtros
              </button>
            )}
          </div>

          {/* TABELA OU MENSAGENS */}

          {/* FEEDBACK VISUAL: sucess/error banners */}
          {(successMessage || errorMessage) && (
            <div className={styles.alertsWrapper}>
              {successMessage && (
                <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
                  <div className={styles.alertIcon} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className={styles.alertContent}>{successMessage}</div>
                  <button
                    className={styles.alertClose}
                    onClick={() => {
                      setSuccessMessage("");
                      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
                    }}
                    aria-label="Fechar mensagem de sucesso"
                  >
                    ✕
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                  <div className={styles.alertIcon} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className={styles.alertContent}>{errorMessage}</div>
                  <button
                    className={styles.alertClose}
                    onClick={() => {
                      setErrorMessage("");
                      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
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
              <div className={styles.emptyStateIcon}>📭</div>
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
              <div className={`${styles.tableWrapper} ${styles.desktopOnly}`}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th className={styles.textCenter}>Prioridade</th>
                      <th className={styles.textCenter}>Setor</th>
                      <th className={styles.textCenter}>Criado por</th>
                      <th className={styles.textCenter}>Data</th>
                      <th className={styles.textCenter}>Hora</th>
                      <th className={styles.textCenter}>Descrição</th>
                      <th className={styles.textCenter}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tarefasFiltradas.map((tarefa) => (
                      <tr key={tarefa.id}>
                        <td title={tarefa.titulo}>
                          <strong>{tarefa.titulo}</strong>
                        </td>
                        <td className={styles.textCenter}>
                          <PrioridadeBadge prioridade={tarefa.prioridade} />
                        </td>
                        <td className={styles.textCenter}>{tarefa.setor}</td>
                        <td className={styles.textCenter}>{tarefa.criadoPor}</td>
                        <td className={styles.textCenter}>
                          {tarefa.dataCriacao}
                        </td>
                        <td className={styles.textCenter}>
                          {tarefa.horaCriacao}
                        </td>
                        <td>
                          <button
                            onClick={() => setTarefaSelecionada(tarefa)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--primary)",
                              cursor: "pointer",
                              fontWeight: "600",
                              textDecoration: "underline",
                              fontSize: "1.35rem",
                            }}
                          >
                            Ler mais →
                          </button>
                        </td>
                        <td className={styles.actionCell}>
                          <button
                            className={`${styles.btnAccept} ${aceitandoId === tarefa.id ? styles.loading : ""
                              }`}
                            onClick={() => aceitarTarefa(tarefa.id)}
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: CARDS */}
              <div
                className={`${styles.mobileCardsContainer} ${styles.mobileOnly}`}
              >
                {tarefasFiltradas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={`${styles.card} ${styles.mobileCard}`}
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
                          className={`${styles.btnAccept} ${aceitandoId === tarefa.id ? styles.loading : ""
                            }`}
                          onClick={() => aceitarTarefa(tarefa.id)}
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
        </section>

      </div>

      {/* MODAL: LER DESCRIÇÃO COMPLETA */}
      {tarefaSelecionada && (
        <>
          <div
            className={styles.modalOverlay}
            onClick={() => setTarefaSelecionada(null)}
          />
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{tarefaSelecionada.titulo}</h3>
              <button
                className={styles.closeButton}
                onClick={() => setTarefaSelecionada(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label>Descrição Completa:</label>
                <p>{tarefaSelecionada.descricao}</p>
              </div>

              <div className={styles.modalGrid}>
                <div className={styles.modalField}>
                  <label>Prioridade:</label>
                  <PrioridadeBadge prioridade={tarefaSelecionada.prioridade} />
                </div>
                <div className={styles.modalField}>
                  <label>Setor:</label>
                  <p>{tarefaSelecionada.setor}</p>
                </div>
                <div className={styles.modalField}>
                  <label>Criado por:</label>
                  <p>{tarefaSelecionada.criadoPor}</p>
                </div>
                <div className={styles.modalField}>
                  <label>Data:</label>
                  <p>{tarefaSelecionada.dataCriacao}</p>
                </div>
                <div className={styles.modalField}>
                  <label>Hora:</label>
                  <p>{tarefaSelecionada.horaCriacao}</p>
                </div>
                <div className={styles.modalField}>
                  <label>Estimativa</label>
                  <p>
                    {formatarEstimativa(
                      tarefaSelecionada.tar_estimativa_minutos
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnModalClose}
                onClick={() => setTarefaSelecionada(null)}
              >
                Fechar
              </button>
              <button
                className={`${styles.btnAccept} ${aceitandoId === tarefaSelecionada.id ? styles.loading : ""
                  }`}
                onClick={() => {
                  aceitarTarefa(tarefaSelecionada.id);
                  setTarefaSelecionada(null);
                }}
                disabled={aceitandoId !== null}
              >
                {aceitandoId === tarefaSelecionada.id
                  ? "✓ Aceitando..."
                  : "✓ Aceitar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
