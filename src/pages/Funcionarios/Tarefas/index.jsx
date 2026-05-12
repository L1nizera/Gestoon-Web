import { useState, useMemo, useEffect } from "react";
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

  /**
   * Busca tarefas da API e filtra apenas as pendentes
   */
  async function fetchTarefas() {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/tarefas");
      const todosTarefas = response.data.dados || [];

      // Filtrar apenas tarefas com status Pendente (0)
      const tarefasFormatadas = todosTarefas
        .filter((t) => Number(t.atr_status) === 0)
        .map((tarefa) => {
          const { dataCriacao, horaCriacao } = formatarDataHora(
            tarefa.tar_data_criacao,
          );

          return {
            id: tarefa.tar_id,
            titulo: tarefa.tar_titulo || "-",
            prioridade: prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",
            setor:
              tarefa.set_nome ||
              setorApiMap[Number(tarefa.tar_setor_id)] ||
              `Setor #${tarefa.tar_setor_id}`,
            criadoPor: tarefa.user_nome || `Usuário #${tarefa.tar_criado_por}`,
            descricao: tarefa.tar_descricao || "Sem descrição",
            dataCriacao,
            horaCriacao,
            tar_id: tarefa.tar_id,
          };
        });

      setTarefasDisponiveis(tarefasFormatadas);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err.message);
      setError("Não foi possível carregar as tarefas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Aceita uma tarefa e atualiza o status para "Em andamento" (1)
   */
  async function aceitarTarefa(tarefaId) {
    try {
      setAceitandoId(tarefaId);

      // Enviar para API (PUT ou PATCH para atualizar status)
      await api.put(`/tarefas/${tarefaId}`, {
        status: 1, // 1 = Em andamento
      });

      // Remover da lista local imediatamente
      setTarefasDisponiveis((prev) => prev.filter((t) => t.id !== tarefaId));
    } catch (err) {
      console.error("Erro ao aceitar tarefa:", err.message);
      alert("Erro ao aceitar tarefa. Tente novamente.");
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
    fetchTarefas();
  }, []);

  // ───── COMPUTADOS ─────

  /**
   * Filtrar tarefas conforme busca e seletores
   */
  const tarefasFiltradas = useMemo(() => {
    return tarefasDisponiveis.filter((tarefa) => {
      const matchBusca = tarefa.titulo.toLowerCase().includes(busca.toLowerCase());
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
      {/* CABEÇALHO DA PÁGINA */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <h1 className={styles.title}>Tarefas Disponíveis</h1>
          <p className={styles.subtitle}>
            Visualize e aceite as tarefas pendentes para começar a trabalhar. Após aceitar,
            elas aparecerão em "Minhas Tarefas em Andamento".
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
        {/* CABEÇALHO DA SEÇÃO COM FILTROS */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderContent}>
            <h2>Filtros</h2>
            <p>Procure tarefas por título, setor e nível de prioridade.</p>
          </div>
        </div>

        {/* FILTROS */}
        <div className={styles.filtrosContainer}>
          <div className={styles.filtroGroup}>
            <label className={styles.filtroLabel}>🔍 Buscar por título</label>
            <input
              type="text"
              placeholder="Digite o título da tarefa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className={styles.filtroGroup}>
            <label className={styles.filtroLabel}>🏢 Setor</label>
            <select value={filtroSetor} onChange={(e) => setFiltroSetor(e.target.value)}>
              <option value="">Todos os setores</option>
              {setoresUnicos.map((setor) => (
                <option key={setor} value={setor}>
                  {setor}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filtroGroup}>
            <label className={styles.filtroLabel}>⚡ Prioridade</label>
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
            <div className={styles.tableWrapper}>
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
                      <td className={styles.textCenter}>{tarefa.dataCriacao}</td>
                      <td className={styles.textCenter}>{tarefa.horaCriacao}</td>
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
                          className={`${styles.btnAccept} ${
                            aceitandoId === tarefa.id ? styles.loading : ""
                          }`}
                          onClick={() => aceitarTarefa(tarefa.id)}
                          disabled={aceitandoId !== null}
                          title={
                            aceitandoId === tarefa.id
                              ? "Processando..."
                              : "Clique para aceitar esta tarefa"
                          }
                        >
                          {aceitandoId === tarefa.id ? "✓ Aceitando..." : "✓ Aceitar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE: CARDS */}
            <div className={styles.mobileCardsContainer}>
              {tarefasFiltradas.map((tarefa) => (
                <div key={tarefa.id} className={styles.mobileCard}>
                  {/* CABEÇALHO DO CARD */}
                  <div className={styles.mobileCardHeader}>
                    <strong>{tarefa.titulo}</strong>
                    <PrioridadeBadge prioridade={tarefa.prioridade} />
                  </div>

                  {/* CORPO DO CARD */}
                  <div className={styles.mobileCardBody}>
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

                  {/* RODAPÉ DO CARD */}
                  <div className={styles.mobileCardFooter}>
                    <span>{tarefa.dataCriacao}</span>
                    <span>{tarefa.horaCriacao}</span>
                  </div>

                  {/* AÇÕES DO CARD */}
                  <div className={styles.mobileCardActions}>
                    <button
                      className={`${styles.btnAccept} ${
                        aceitandoId === tarefa.id ? styles.loading : ""
                      }`}
                      onClick={() => aceitarTarefa(tarefa.id)}
                      disabled={aceitandoId !== null}
                      title={
                        aceitandoId === tarefa.id
                          ? "Processando..."
                          : "Clique para aceitar esta tarefa"
                      }
                    >
                      {aceitandoId === tarefa.id ? "✓ Aceitando..." : "✓ Aceitar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

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
                className={`${styles.btnAccept} ${
                  aceitandoId === tarefaSelecionada.id ? styles.loading : ""
                }`}
                onClick={() => {
                  aceitarTarefa(tarefaSelecionada.id);
                  setTarefaSelecionada(null);
                }}
                disabled={aceitandoId !== null}
              >
                {aceitandoId === tarefaSelecionada.id ? "✓ Aceitando..." : "✓ Aceitar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
