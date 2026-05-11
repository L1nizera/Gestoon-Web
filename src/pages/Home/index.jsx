import { useState, useMemo, useEffect } from "react";
import styles from "./style.module.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../components/Modal/Modal";
import api from "../../services/api";

function Home() {
  const [funcionariosMap, setFuncionariosMap] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [ordemData, setOrdemData] = useState("recente"); // "recente" | "antigo"
  const [setorFiltro, setSetorFiltro] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [ordemTitulo, setOrdemTitulo] = useState(null); // "az" | "za"
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [tasksState, setTasksState] = useState([]);
  const [editTask, setEditTask] = useState(null);
  const [menuAtivo, setMenuAtivo] = useState("tarefas");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const prioridadeToApiMap = {
    Baixa: 1,
    Média: 2,
    Alta: 3,
  };

  const setorToApiMap = {
    Administrativo: 1,
    Financeiro: 2,
    Operacional: 3,
    Atendimento: 4,
    Limpeza: 5,
    Estoque: 6,
    Logística: 7,
  };

  const statusApiMap = {
    0: "Pendente",
    1: "Em andamento",
    2: "Concluída",
    3: "Cancelada",
  };

  function formatarStatus(status) {
    const statusNumero = Number(status);

    if (Number.isNaN(statusNumero)) {
      return "Pendente";
    }

    return statusApiMap[statusNumero] || "Pendente";
  }

  function formatarDataHora(dataISO) {
    if (!dataISO) {
      return {
        dataCriacao: "-",
        horaCriacao: "-",
      };
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

  function formatarData(dataISO) {
    if (!dataISO) return "-";

    const data = new Date(dataISO);

    if (Number.isNaN(data.getTime())) return "-";

    return data.toLocaleDateString("pt-BR");
  }

  function formatarCriadoPor(idUsuario) {
    if (!idUsuario) return "-";

    return `Usuário #${idUsuario}`;
  }

  function formatarEstimativa(minutos) {
    const valor = Number(minutos);

    if (!valor || Number.isNaN(valor)) return "-";

    if (valor < 60) {
      return `${valor} min`;
    }

    const horas = Math.floor(valor / 60);
    const minutosRestantes = valor % 60;

    if (minutosRestantes === 0) {
      return `${horas}h`;
    }

    return `${horas}h ${minutosRestantes}min`;
  }

  async function buscarFuncionariosMap() {
    const response = await api.get("/funcionarios");

    const funcionarios = response.data.dados || response.data;

    const mapa = {};

    funcionarios.forEach((funcionario) => {
      mapa[funcionario.func_id] = funcionario.func_nome;
    });

    return mapa;
  }

  const fetchDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const mapaFuncionarios = await buscarFuncionariosMap();

      const response = await api.get("/tarefas");

      const tarefasFormatadas = response.data.dados.map((tarefa) => {
        const { dataCriacao, horaCriacao } = formatarDataHora(
          tarefa.tar_data_criacao,
        );

        return {
          id: tarefa.tar_id,
          tarefaId: tarefa.tar_id,

          titulo: tarefa.tar_titulo || "-",

          status: formatarStatus(tarefa.atr_status),

          prioridade:
            prioridadeApiMap[Number(tarefa.tar_prioridade)] || "Média",

          setor:
            tarefa.set_nome ||
            setorApiMap[Number(tarefa.tar_setor_id)] ||
            `Setor #${tarefa.tar_setor_id}`,

          criadoPor:
            mapaFuncionarios[Number(tarefa.tar_criado_por)] ||
            `Funcionário #${tarefa.tar_criado_por}`,

          estimativaMinutos: tarefa.tar_estimativa_minutos ?? "",
          estimativaFormatada: formatarEstimativa(
            tarefa.tar_estimativa_minutos,
          ),

          dataCriacao,
          horaCriacao,

          descricao: tarefa.tar_descricao || "Sem descrição",
        };
      });

      setTasksState(tarefasFormatadas);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err.message);
      setError("Não foi possível carregar as tarefas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  // if (loading && tarefas.length === 0) return <p>Carregando dados...</p>;
  // if (error) return <p style={{ color: 'red' }}>{error}</p>;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== MODAL CRIAR =====
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const [novaTask, setNovaTask] = useState({
    titulo: "",
    setor: "Administrativo",
    prioridade: "Média",
    status: "Pendente",
    estimativaMinutos: "",
    descricao: "",
  });

  // ===== Botão Limpar Filtro =====

  function limparFiltros() {
    setFiltro("Todos");
    setBusca("");
    setDataInicio("");
    setDataFim("");
    setSetorFiltro("");
    setMesFiltro("");
    setOrdemData(null);
    setOrdemTitulo(null);
  }

  function excluirTask(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    const novaLista = tasksState.filter((t) => t.id !== id);
    setTasksState(novaLista);
    setSelectedTask(null);
  }

  function abrirEdicao(task) {
    setSelectedTask(null); // fecha o modal atual
    setEditTask({ ...task });
  }

  function salvarEdicao() {
    setTasksState((prev) =>
      prev.map((t) =>
        t.id === editTask.id
          ? {
              ...editTask,
              estimativaFormatada: formatarEstimativa(
                editTask.estimativaMinutos,
              ),
            }
          : t,
      ),
    );

    setEditTask(null);
  }

  async function criarTask() {
    if (!novaTask.titulo.trim()) return;

    try {
      const payload = {
        titulo: novaTask.titulo,
        descricao: novaTask.descricao,
        prioridade: prioridadeToApiMap[novaTask.prioridade],
        setorId: setorToApiMap[novaTask.setor],
        criadoPor: 1,
        estimativaMinutos: Number(novaTask.estimativaMinutos),
        status: 0,
        funcionarioId: 1,
      };

      console.log("Setor escolhido:", novaTask.setor);
      console.log("Setor convertido:", setorToApiMap[novaTask.setor]);
      console.log("Payload enviado:", payload);

      await api.post("/tarefas", payload);
      await fetchDados();

      
      setNovaTask({
        titulo: "",
        setor: "Administrativo",
        prioridade: "Média",
        status: "Pendente",
        estimativaMinutos: "",
        descricao: "",
      });

      setCreateTaskOpen(false);
    } catch (err) {
      console.error("Erro ao criar tarefa:", err.response?.data || err.message);

      alert(
        err.response?.data?.dados ||
          err.response?.data?.mensagem ||
          "Erro ao criar tarefa. Verifique a API.",
      );
    }
  }

  // ===== Exportar PDF =====
  function exportarPDF() {
    const doc = new jsPDF();
    const dadosExport = lista; // usa exatamente o que está filtrado

    // ===== TÍTULO =====
    doc.setFontSize(18);
    doc.text("Relatório de Tarefas - Gestoon", 14, 15);

    // ===== DATA =====
    const hoje = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Gerado em: ${hoje}`, 14, 22);

    // ===== PREPARAR DADOS =====
    const dados = dadosExport.map((t) => [
      t.tarefaId,
      t.titulo,
      t.status,
      t.prioridade,
      t.setor,
      t.criadoPor,
      t.estimativaFormatada,
      t.dataCriacao,
      t.horaCriacao,
      t.descricao || "-",
    ]);

    // ===== TABELA =====
    autoTable(doc, {
      startY: 30,
      head: [
        [
          "ID",
          "Título",
          "Status",
          "Prioridade",
          "Setor",
          "Criado por",
          "Estimativa",
          "Data",
          "Hora",
          "Descrição",
        ],
      ],
      body: dados,

      styles: {
        fontSize: 8,
        lineColor: [200, 200, 200], // cor da linha
        lineWidth: 0.1, // espessura
      },

      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        lineWidth: 0.2,
      },

      theme: "grid",
    });

    // ===== SALVAR =====
    doc.save("relatorio_tarefas.pdf");
  }

  // ===== MAPS =====
  const statusMap = {
    Pendente: "statusPendente",
    "Em andamento": "statusAndamento",
    Concluída: "statusConcluida",
    Cancelada: "statusCancelada",
  };

  const setores = [
    "Administrativo",
    "Financeiro",
    "Operacional",
    "Atendimento",
    "Limpeza",
    "Estoque",
    "Logística",
  ];

  const prioridadeMap = {
    Alta: "prioridadeAlta",
    Média: "prioridadeMedia",
    Baixa: "prioridadeBaixa",
  };

  // ===== FILTRO + BUSCA =====

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const lista = useMemo(() => {
    let lista = [...tasksState];

    // filtro status
    if (filtro !== "Todos") {
      lista = lista.filter((t) => t.status === filtro);
    }

    // busca
    if (busca) {
      lista = lista.filter((t) =>
        t.titulo.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    // data
    if (dataInicio || dataFim) {
      lista = lista.filter((t) => {
        const [dia, mes, ano] = t.dataCriacao.split("/");
        const dataTask = new Date(`${ano}-${mes}-${dia}`);

        const inicio = dataInicio ? new Date(dataInicio) : null;
        const fim = dataFim ? new Date(dataFim) : null;

        if (inicio && fim) return dataTask >= inicio && dataTask <= fim;
        if (inicio && !fim) return dataTask.getTime() === inicio.getTime();
        if (!inicio && fim) return dataTask <= fim;

        return true;
      });
    }

    // setor
    if (setorFiltro) {
      lista = lista.filter((t) => t.setor === setorFiltro);
    }

    // mês
    if (mesFiltro) {
      lista = lista.filter((t) => {
        const [, mes] = t.dataCriacao.split("/");
        return mes === mesFiltro;
      });
    }

    // ordenação
    lista.sort((a, b) => {
      let resultado = 0;

      if (ordemData) {
        const [dA, mA, yA] = a.dataCriacao.split("/");
        const [dB, mB, yB] = b.dataCriacao.split("/");

        const dataA = new Date(`${yA}-${mA}-${dA}`);
        const dataB = new Date(`${yB}-${mB}-${dB}`);

        resultado = ordemData === "recente" ? dataB - dataA : dataA - dataB;
      }

      if (resultado === 0 && ordemTitulo) {
        resultado =
          ordemTitulo === "az"
            ? a.titulo.localeCompare(b.titulo)
            : b.titulo.localeCompare(a.titulo);
      }

      return resultado;
    });

    return lista;
  }, [
    tasksState,
    filtro,
    busca,
    dataInicio,
    dataFim,
    setorFiltro,
    mesFiltro,
    ordemData,
    ordemTitulo,
  ]);

  // ===== RESUMO =====
  const total = tasksState.length;

  const pendentes = tasksState.filter((t) => t.status === "Pendente").length;
  const andamento = tasksState.filter(
    (t) => t.status === "Em andamento",
  ).length;
  const concluidas = tasksState.filter((t) => t.status === "Concluída").length;
  const canceladas = tasksState.filter((t) => t.status === "Cancelada").length;

  const dataGrafico = useMemo(
    () => [
      { name: "Pendentes", value: pendentes },
      { name: "Em andamento", value: andamento },
      { name: "Concluídas", value: concluidas },
      { name: "Canceladas", value: canceladas },
    ],
    [pendentes, andamento, concluidas, canceladas],
  );

  const dataGraficoFiltrado = useMemo(
    () => dataGrafico.filter((item) => item.value > 0),
    [dataGrafico],
  );

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.cardContainer}>
          <p>Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.cardContainer}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardContainer}>
        {/* ===== MENU TOPO ===== */}

        <h1>Tarefas</h1>

        {/* ===== RESUMO ===== */}
        <div className={styles.resumo}>
          <div>Total: {total}</div>
          <div>Pendentes: {pendentes}</div>
          <div>Em andamento: {andamento}</div>
          <div>Concluídas: {concluidas}</div>
          <div>Canceladas: {canceladas}</div>
        </div>

        {/* ===== BUSCA ===== */}
        <div className={styles.topActions}>
          <input
            placeholder="Buscar tarefa..."
            className={styles.busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* ==== DATA ==== */}
        <div className={styles.filtrosAvancados}>
          <div>
            <div>
              <label>Período: </label>

              <div className={styles.periodoInputs}>
                <div>
                  <small>De: </small>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                <div>
                  <small>Até: </small>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <small className={styles.meses}>Meses: </small>
            <select
              className={styles.filtroSelect}
              value={mesFiltro}
              onChange={(e) => setMesFiltro(e.target.value)}
            >
              <option value="">Todos os meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          {/* SETOR */}
          <div>
            <small>Setor:</small>
            <select
              value={setorFiltro}
              onChange={(e) => setSetorFiltro(e.target.value)}
            >
              <option value="">Todos</option>

              {setores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== FILTROS ===== */}
        <div className={styles.filtros}>
          <button
            className={filtro === "Todos" ? styles.ativo : ""}
            onClick={() => setFiltro("Todos")}
          >
            Todos
          </button>

          <button
            className={filtro === "Pendente" ? styles.ativo : ""}
            onClick={() => setFiltro("Pendente")}
          >
            Pendentes
          </button>

          <button
            className={filtro === "Em andamento" ? styles.ativo : ""}
            onClick={() => setFiltro("Em andamento")}
          >
            Em andamento
          </button>

          <button
            className={filtro === "Concluída" ? styles.ativo : ""}
            onClick={() => setFiltro("Concluída")}
          >
            Concluídas
          </button>

          <button
            className={filtro === "Cancelada" ? styles.ativo : ""}
            onClick={() => setFiltro("Cancelada")}
          >
            Canceladas
          </button>
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} onClick={limparFiltros}>
            Limpar Filtros
          </button>

          <button
            className={styles.criarBtn}
            onClick={() => setCreateTaskOpen(true)}
          >
            Criar Tarefa
          </button>
        </div>

        {/* ===== DESKTOP (TABELA) ===== */}
        <div className={`${styles.tabelaContainer} ${styles.desktopOnly}`}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>ID</th>

                <th
                  className={`${styles.thSortable} ${ordemTitulo ? styles.colunaAtiva : ""}`}
                  onClick={() =>
                    setOrdemTitulo((prev) => {
                      if (prev === null) return "az";
                      if (prev === "az") return "za";
                      return null;
                    })
                  }
                >
                  Título{" "}
                  {ordemTitulo === "az" ? "↑" : ordemTitulo === "za" ? "↓" : ""}
                </th>

                <th>Status</th>
                <th>Prioridade</th>
                <th>Setor</th>
                <th>Criado por</th>
                <th>Estimativa</th>
                <th>Hora</th>

                <th
                  className={`${styles.thSortable} ${styles.textCenter} ${
                    ordemData ? styles.colunaAtiva : ""
                  }`}
                  onClick={() =>
                    setOrdemData((prev) => {
                      if (prev === null) return "recente";
                      if (prev === "recente") return "antigo";
                      return null;
                    })
                  }
                >
                  Data{" "}
                  {ordemData === "recente"
                    ? "↑"
                    : ordemData === "antigo"
                      ? "↓"
                      : ""}
                </th>
              </tr>
            </thead>

            <tbody>
              {lista.map((task) => (
                <tr
                  key={task.id}
                  onClick={(e) => {
                    if (e.target.tagName === "BUTTON") return;
                    setSelectedTask(task);
                  }}
                >
                  <td>{task.tarefaId}</td>

                  <td>{task.titulo}</td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        styles[statusMap[task.status]] || styles.statusPendente
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`${styles.badge} ${
                        styles[prioridadeMap[task.prioridade]]
                      }`}
                    >
                      {task.prioridade}
                    </span>
                  </td>

                  <td>{task.setor}</td>
                  <td>{task.criadoPor}</td>
                  <td>{task.estimativaFormatada}</td>
                  <td>{task.horaCriacao}</td>
                  <td>{task.dataCriacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== MOBILE (CARDS) ===== */}
        <div className={styles.mobileOnly}>
          {lista.map((task) => (
            <div
              key={task.id}
              className={styles.card}
              onClick={() => setSelectedTask(task)}
            >
              {/* HEADER */}
              <div className={styles.cardHeader}>
                <h1>{task.titulo}</h1>

                <span
                  className={`${styles.badge} ${styles[statusMap[task.status]]}`}
                >
                  {task.status}
                </span>
              </div>

              {/* BODY */}
              <div className={styles.cardBody}>
                <p>
                  <strong>Prioridade:</strong>{" "}
                  <span
                    className={`${styles.badge} ${styles[prioridadeMap[task.prioridade]]}`}
                  >
                    {task.prioridade}
                  </span>
                </p>

                <p>
                  <strong>Setor:</strong> {task.setor}
                </p>
                <p>
                  <strong>Criado por:</strong> {task.criadoPor}
                </p>

                <p>
                  <strong>Estimativa:</strong> {task.estimativaFormatada}
                </p>

                <div className={styles.cardFooter}>
                  <span>{task.horaCriacao}</span>
                  <span>{task.dataCriacao}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ===== MODAL ===== */}
        {selectedTask && (
          <Modal
            title={selectedTask.titulo}
            variant="between"
            onClose={() => setSelectedTask(null)}
            actions={
              <>
                <button
                  className={styles.btnClose}
                  onClick={() => setSelectedTask(null)}
                >
                  Fechar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={() => abrirEdicao(selectedTask)}
                >
                  Editar
                </button>

                <button
                  className={styles.btnDanger}
                  onClick={() => excluirTask(selectedTask.id)}
                >
                  Excluir
                </button>
              </>
            }
          >
            <div className={styles.modalGrid}>
              <div>
                <strong>ID:</strong>
                <p>{selectedTask.tarefaId}</p>
              </div>

              <div>
                <strong>Prioridade:</strong>
                <span
                  className={`${styles.badge} ${
                    styles[prioridadeMap[selectedTask.prioridade]]
                  }`}
                >
                  {selectedTask.prioridade}
                </span>
              </div>

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
                <strong>Setor:</strong>
                <p>{selectedTask.setor}</p>
              </div>

              <div>
                <strong>Criado por:</strong>
                <p>{selectedTask.criadoPor}</p>
              </div>

              <div>
                <strong>Estimativa:</strong>
                <p>{selectedTask.estimativaFormatada}</p>
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
          </Modal>
        )}

        {/* ===== MODAL EDITAR ===== */}
        {editTask && (
          <Modal
            title="Editar Tarefa"
            onClose={() => setEditTask(null)}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setEditTask(null)}
                >
                  Cancelar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={salvarEdicao}
                  disabled={!editTask.titulo}
                >
                  Salvar
                </button>
              </>
            }
          >
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Título</label>
                <input
                  type="text"
                  value={editTask.titulo}
                  onChange={(e) =>
                    setEditTask({ ...editTask, titulo: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Setor</label>
                <select
                  value={editTask.setor}
                  onChange={(e) =>
                    setEditTask({ ...editTask, setor: e.target.value })
                  }
                >
                  {setores.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={editTask.status}
                  onChange={(e) =>
                    setEditTask({ ...editTask, status: e.target.value })
                  }
                >
                  <option>Pendente</option>
                  <option>Em andamento</option>
                  <option>Concluída</option>
                  <option>Cancelada</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Prioridade</label>
                <select
                  value={editTask.prioridade}
                  onChange={(e) =>
                    setEditTask({ ...editTask, prioridade: e.target.value })
                  }
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Criado por</label>
                <input type="text" value={editTask.criadoPor} disabled />
              </div>

              <div className={styles.formGroup}>
                <label>Estimativa em minutos</label>
                <input
                  type="number"
                  min="1"
                  value={editTask.estimativaMinutos}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      estimativaMinutos: e.target.value,
                      estimativaFormatada: formatarEstimativa(e.target.value),
                    })
                  }
                />
              </div>

              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Descrição</label>
                <textarea
                  rows={4}
                  value={editTask.descricao}
                  onChange={(e) =>
                    setEditTask({ ...editTask, descricao: e.target.value })
                  }
                />
              </div>
            </div>
          </Modal>
        )}

        {/* ===== MODAL CRIAR ===== */}
        {createTaskOpen && (
          <Modal
            title="Criar Tarefa"
            onClose={() => setCreateTaskOpen(false)}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnDanger}
                  onClick={() => {
                    setCreateTaskOpen(false);
                    setNovaTask({
                      titulo: "",
                      setor: "Administrativo",
                      prioridade: "Média",
                      status: "Pendente",
                      estimativaMinutos: "",
                      descricao: "",
                    });
                  }}
                >
                  Fechar
                </button>

                <button
                  className={styles.btnSecondary}
                  onClick={() =>
                    setNovaTask({
                      titulo: "",
                      setor: "Administrativo",
                      prioridade: "Média",
                      status: "Pendente",
                      estimativaMinutos: "",
                      descricao: "",
                    })
                  }
                >
                  Limpar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={criarTask}
                  disabled={!novaTask.titulo}
                >
                  Criar
                </button>
              </>
            }
          >
            <div className={styles.formGrid}>
              {/* TÍTULO */}
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Título</label>
                <input
                  type="text"
                  value={novaTask.titulo}
                  onChange={(e) =>
                    setNovaTask({ ...novaTask, titulo: e.target.value })
                  }
                  placeholder="Digite o título..."
                />
              </div>

              {/* SETOR */}
              <div className={styles.formGroup}>
                <label>Setor</label>
                <select
                  value={novaTask.setor}
                  onChange={(e) =>
                    setNovaTask({ ...novaTask, setor: e.target.value })
                  }
                >
                  {setores.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* STATUS */}
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={novaTask.status}
                  onChange={(e) =>
                    setNovaTask({ ...novaTask, status: e.target.value })
                  }
                >
                  <option>Pendente</option>
                  <option>Em andamento</option>
                  <option>Concluída</option>
                  <option>Cancelada</option>
                </select>
              </div>

              {/* PRIORIDADE */}
              <div className={styles.formGroup}>
                <label>Prioridade</label>
                <select
                  value={novaTask.prioridade}
                  onChange={(e) =>
                    setNovaTask({ ...novaTask, prioridade: e.target.value })
                  }
                >
                  <option>Alta</option>
                  <option>Média</option>
                  <option>Baixa</option>
                </select>
              </div>

              {/* Estimativa Minutos */}
              <div className={styles.formGroup}>
                <label>Estimativa em minutos</label>
                <input
                  type="number"
                  min="1"
                  value={novaTask.estimativaMinutos}
                  onChange={(e) =>
                    setNovaTask({
                      ...novaTask,
                      estimativaMinutos: e.target.value,
                    })
                  }
                  placeholder="Ex: 90"
                />
              </div>

              {/* DESCRIÇÃO */}
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Descrição</label>
                <textarea
                  rows={4}
                  value={novaTask.descricao}
                  onChange={(e) =>
                    setNovaTask({ ...novaTask, descricao: e.target.value })
                  }
                />
              </div>
            </div>
          </Modal>
        )}

        <div className={styles.footerActions}>
          <button className={styles.exportBtn} onClick={exportarPDF}>
            Exportar PDF
          </button>
        </div>

        {/* ==== Gráfico ==== */}
        <div className={styles.grafico}>
          <h2>Status das tarefas</h2>

          <ResponsiveContainer width="100%" height={isMobile ? 220 : 400}>
            <PieChart>
              <Pie
                data={dataGraficoFiltrado}
                dataKey="value"
                nameKey="name"
                outerRadius={isMobile ? 70 : 120}
                innerRadius={isMobile ? 30 : 50}
                activeShape={null}
                isAnimationActive={false}
                stroke="none"
                label={
                  isMobile
                    ? false
                    : ({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
                fontSize={isMobile ? 12 : 20}
              >
                {dataGraficoFiltrado.map((entry) => {
                  const colorMap = {
                    Pendentes: "#ef4444",
                    "Em andamento": "#f59e0b",
                    Concluídas: "#22c55e",
                    Canceladas: "#6b7280",
                  };

                  return <Cell key={entry.name} fill={colorMap[entry.name]} />;
                })}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {/* legenda manual */}
          <div className={styles.legenda}>
            {dataGraficoFiltrado.map((item) => {
              const colorMap = {
                Pendentes: "#ef4444",
                "Em andamento": "#f59e0b",
                Concluídas: "#22c55e",
                Canceladas: "#6b7280",
              };

              return (
                <div key={item.name}>
                  <span
                    className={styles.cor}
                    style={{ background: colorMap[item.name] }}
                  ></span>
                  {item.name} ({item.value})
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
