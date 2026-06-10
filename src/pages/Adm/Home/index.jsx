import { useState, useMemo, useEffect, useRef } from "react";
import styles from "./style.module.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Modal from "../../../components/Modal";
import DataTable from "../../../components/ui/DataTable";
import api from "../../../services/api";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../context/AuthContext";

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
  const [taskParaExcluir, setTaskParaExcluir] = useState(null);
  const [menuAtivo, setMenuAtivo] = useState("tarefas");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  function avisarCampo(campo, mensagem) {
    showToast(`${campo}: ${mensagem}`, "warning");
  }

  const primeiraCargaRef = useRef(true);
  const ultimaChaveTarefasRef = useRef("");

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
    7: "RH",
    8: "Recepção",
    9: "Caixa",
    10: "HortiFruti",
    11: "Açougue",
    12: "Padaria",
    13: "Frios",
    14: "Mercearia",
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
    RH: 7,
    Recepção: 8,
    Caixa: 9,
    HortiFruti: 10,
    Açougue: 11,
    Padaria: 12,
    Frios: 13,
    Mercearia: 14,
  };

  const statusApiMap = {
    0: "Pendente",
    1: "Em andamento",
    2: "Concluída",
    3: "Cancelada",
  };

  const statusToApiMap = {
    Pendente: 0,
    "Em andamento": 1,
    Concluída: 2,
    Cancelada: 3,
  };

  function buildTarefaFotoUrl(fotoNome) {
    if (!fotoNome || typeof fotoNome !== "string") return null;
    const nomeLimpo = fotoNome.trim();
    if (!nomeLimpo) return null;

    if (/^https?:\/\//i.test(nomeLimpo)) {
      return nomeLimpo.replace(
        /^https?:\/\/(10\.67\.23\.47:3333)/i,
        "http://localhost:3333",
      );
    }

    if (/^\/public\/tarefas\//i.test(nomeLimpo)) {
      return `http://localhost:3333${nomeLimpo}`;
    }

    return `http://localhost:3333/uploads/tarefas/${encodeURIComponent(nomeLimpo)}`;
  }

  function isValidImageUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const parsed = new URL(url);
      return /\.(jpe?g|png|gif|webp|bmp|avif|svg)$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  const columns = [
    {
      key: "tarefaId",
      label: "ID",
      align: "center",
    },
    {
      key: "titulo",
      label: "Título",
      sortable: true,
      render: (row) => <span title={row.titulo}>{row.titulo}</span>,
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
          className={`${styles.badge} ${styles[prioridadeMap[row.prioridade]]}`}
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
      key: "estimativaFormatada",
      label: "Estimativa",
      align: "center",
    },
    {
      key: "horaCriacao",
      label: "Hora",
      align: "center",
    },
    {
      key: "dataCriacao",
      label: "Data",
      align: "center",
      sortable: true,
    },
  ];

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

    if (valor < 1440) {
      const horas = Math.floor(valor / 60);
      const minutosRestantes = valor % 60;

      if (minutosRestantes === 0) {
        return `${horas}h`;
      }

      return `${horas}h ${minutosRestantes}min`;
    }

    const dias = Math.floor(valor / 1440);
    const restoDepoisDias = valor % 1440;
    const horas = Math.floor(restoDepoisDias / 60);
    const minutosRestantes = restoDepoisDias % 60;

    let texto = `${dias}d`;

    if (horas > 0) {
      texto += ` ${horas}h`;
    }

    if (minutosRestantes > 0) {
      texto += ` ${minutosRestantes}min`;
    }

    return texto;
  }

  function converterEstimativaParaMinutos(valor, unidade) {
    const numero = Number(valor);

    if (!numero || Number.isNaN(numero) || numero <= 0) {
      return 0;
    }

    if (unidade === "horas") {
      return numero * 60;
    }

    if (unidade === "dias") {
      return numero * 24 * 60;
    }

    return numero;
  }

  const LIMITE_ESTIMATIVA_MINUTOS = 7 * 24 * 60;

  function converterMinutosParaUnidade(minutos, unidade) {
    const valor = Number(minutos);

    if (!valor || Number.isNaN(valor)) {
      return "";
    }

    let convertido = valor;

    if (unidade === "horas") {
      convertido = valor / 60;
    }

    if (unidade === "dias") {
      convertido = valor / 1440;
    }

    return Number.isInteger(convertido)
      ? convertido
      : Number(convertido.toFixed(2));
  }

  function validarLimiteEstimativa(minutos) {
    return minutos <= LIMITE_ESTIMATIVA_MINUTOS;
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

  function gerarChaveTarefas(lista) {
    return lista
      .map((tarefa) =>
        [
          tarefa.id,
          tarefa.tarefaId,
          tarefa.titulo,
          tarefa.status,
          tarefa.prioridade,
          tarefa.setor,
          tarefa.criadoPor,
          tarefa.estimativaMinutos,
          tarefa.estimativaFormatada,
          tarefa.dataCriacao,
          tarefa.horaCriacao,
          tarefa.descricao,
          tarefa.foto,
        ].join("::"),
      )
      .join("||");
  }

  const fetchDados = async () => {
    try {
      if (primeiraCargaRef.current) {
        setLoading(true);
      }

      setError(null);

      const mapaFuncionarios = await buscarFuncionariosMap();

      const [tarefasResponse, fotosResponse] = await Promise.all([
        api.get("/tarefas"),
        api.get("/tarefaFotos"),
      ]);

      const todasTarefas = tarefasResponse.data?.dados || [];
      const todasFotos = fotosResponse.data?.dados || [];

      const fotosPorTarefaId = todasFotos.reduce((acc, foto) => {
        const tarefaId = Number(foto.fot_tarefa_id);
        if (!acc[tarefaId]) acc[tarefaId] = [];
        acc[tarefaId].push(foto);
        return acc;
      }, {});

      console.log("tarefas", todasTarefas);
      console.log("fotos", todasFotos);

      const tarefasFormatadas = todasTarefas.map((tarefa) => {
        const { dataCriacao, horaCriacao } = formatarDataHora(
          tarefa.tar_data_criacao,
        );

        const fotosDaTarefa = fotosPorTarefaId[Number(tarefa.tar_id)] || [];
        const fotoDaTarefa =
          fotosDaTarefa
            .slice()
            .sort(
              (a, b) =>
                new Date(b.fot_data_envio).getTime() -
                new Date(a.fot_data_envio).getTime(),
            )[0] || null;

        const nomeFoto = tarefa.fot_nome || fotoDaTarefa?.fot_nome;

        return {
          id: tarefa.tar_id,
          tarefaId: tarefa.tar_id,

          titulo: tarefa.tar_titulo || "-",

          foto: buildTarefaFotoUrl(nomeFoto),

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

      const novaChave = gerarChaveTarefas(tarefasFormatadas);

      if (novaChave !== ultimaChaveTarefasRef.current) {
        ultimaChaveTarefasRef.current = novaChave;

        const scrollAtual = window.scrollY;

        setTasksState(tarefasFormatadas);

        requestAnimationFrame(() => {
          window.scrollTo(0, scrollAtual);
        });
      }
    } catch (err) {
      console.error(
        "Erro completo ao buscar dados:",
        err.response?.data || err,
      );

      if (primeiraCargaRef.current) {
        setError(
          err.response?.data?.mensagem ||
            err.response?.data?.dados ||
            err.message ||
            "Não foi possível carregar as tarefas.",
        );
      }
    } finally {
      if (primeiraCargaRef.current) {
        setLoading(false);
        primeiraCargaRef.current = false;
      }
    }
  };

  useEffect(() => {
    fetchDados();

    const interval = setInterval(() => {
      fetchDados();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [selectedTask]);

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
    estimativaValor: "",
    estimativaUnidade: "minutos",
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

  function handleSort(key) {
    if (key === "titulo") {
      setOrdemTitulo((prev) => {
        if (prev === null) return "az";
        if (prev === "az") return "za";
        return null;
      });

      setOrdemData(null);
      return;
    }

    if (key === "dataCriacao") {
      setOrdemData((prev) => {
        if (prev === null) return "recente";
        if (prev === "recente") return "antigo";
        return null;
      });

      setOrdemTitulo(null);
    }
  }

  function getSortDirection(key) {
    if (key === "titulo") return ordemTitulo;
    if (key === "dataCriacao") return ordemData;

    return null;
  }

  async function excluirTask(id) {
    try {
      await api.delete(`/tarefas/${id}`);

      await fetchDados();

      setSelectedTask(null);
      setTaskParaExcluir(null);

      showToast("Tarefa excluída com sucesso.", "success");
    } catch (err) {
      console.error(
        "Erro ao excluir tarefa:",
        err.response?.data || err.message,
      );

      showToast(
        err.response?.data?.dados ||
          err.response?.data?.mensagem ||
          "Erro ao excluir tarefa. Verifique os dados informados.",
        "error",
      );
    }
  }

  function abrirEdicao(task) {
    if (task.status === "Concluída") {
      showToast(
        "Tarefa concluída: esta tarefa não pode mais ser editada.",
        "warning",
      );
      return;
    }

    setSelectedTask(null);

    setEditTask({
      ...task,
      estimativaValor: task.estimativaMinutos || "",
      estimativaUnidade: "minutos",
      estimativaMinutosBase: Number(task.estimativaMinutos) || 0,
    });
  }

  async function salvarEdicao() {
    if (!editTask.titulo.trim()) {
      avisarCampo("Título", "informe o nome da tarefa.");
      return;
    }

    if (!editTask.descricao.trim()) {
      avisarCampo("Descrição", "informe o que precisa ser feito na tarefa.");
      return;
    }

    const setorId = setorToApiMap[editTask.setor];
    const prioridade = prioridadeToApiMap[editTask.prioridade];
    const status = statusToApiMap[editTask.status];

    if (!setorId) {
      avisarCampo("Setor", "selecione um setor válido.");
      return;
    }

    if (!prioridade) {
      avisarCampo("Prioridade", "selecione uma prioridade válida.");
      return;
    }

    if (status === undefined) {
      avisarCampo("Status", "selecione um status válido.");
      return;
    }

    const estimativaEmMinutos = converterEstimativaParaMinutos(
      editTask.estimativaValor,
      editTask.estimativaUnidade,
    );

    if (!estimativaEmMinutos) {
      avisarCampo("Estimativa", "informe um tempo maior que zero.");
      return;
    }

    if (!validarLimiteEstimativa(estimativaEmMinutos)) {
      avisarCampo("Estimativa", "o prazo máximo permitido é de 7 dias.");
      return;
    }

    try {
      const payload = {
        titulo: editTask.titulo.trim(),
        descricao: editTask.descricao.trim(),
        prioridade,
        setorId,
        criadoPor:
          user?.funcionarioId ||
          user?.func_id ||
          user?.id ||
          user?.usuario_id ||
          user?.id_funcionario ||
          1,
        estimativaMinutos: estimativaEmMinutos,
        status,
        funcionarioId:
          user?.funcionarioId ||
          user?.func_id ||
          user?.id ||
          user?.usuario_id ||
          user?.id_funcionario ||
          1,
      };

      await api.patch(`/tarefas/${editTask.tarefaId}`, payload);

      await fetchDados();

      setEditTask(null);

      showToast("Tarefa atualizada com sucesso.", "success");
    } catch (err) {
      console.error(
        "Erro ao editar tarefa:",
        err.response?.data || err.message,
      );

      showToast(
        err.response?.data?.dados ||
          err.response?.data?.mensagem ||
          "Erro ao editar tarefa. Verifique os dados informados.",
        "error",
      );
    }
  }

  async function criarTask(close) {
    if (!novaTask.titulo.trim()) {
      avisarCampo("Título", "informe o nome da tarefa.");
      return;
    }

    if (!novaTask.descricao.trim()) {
      avisarCampo("Descrição", "informe o que precisa ser feito na tarefa.");
      return;
    }

    const setorId = setorToApiMap[novaTask.setor];

    if (!setorId) {
      avisarCampo("Setor", "selecione um setor válido.");
      return;
    }

    const prioridade = prioridadeToApiMap[novaTask.prioridade];

    if (!prioridade) {
      avisarCampo("Prioridade", "selecione uma prioridade válida.");
      return;
    }

    const status = statusToApiMap[novaTask.status];

    if (status === undefined) {
      avisarCampo("Status", "selecione um status válido.");
      return;
    }

    const estimativaEmMinutos = converterEstimativaParaMinutos(
      novaTask.estimativaValor,
      novaTask.estimativaUnidade,
    );

    if (!estimativaEmMinutos) {
      avisarCampo("Estimativa", "informe um tempo maior que zero.");
      return;
    }

    if (!validarLimiteEstimativa(estimativaEmMinutos)) {
      avisarCampo("Estimativa", "o prazo máximo permitido é de 7 dias.");
      return;
    }

    try {
      const payload = {
        titulo: novaTask.titulo.trim(),
        descricao: novaTask.descricao.trim(),
        prioridade,
        setorId,
        criadoPor:
          user?.funcionarioId ||
          user?.func_id ||
          user?.id ||
          user?.usuario_id ||
          user?.id_funcionario ||
          1,
        estimativaMinutos: estimativaEmMinutos,
        status,
        funcionarioId:
          user?.funcionarioId ||
          user?.func_id ||
          user?.id ||
          user?.usuario_id ||
          user?.id_funcionario ||
          1,
      };

      await api.post("/tarefas", payload);
      await fetchDados();

      showToast("Tarefa criada com sucesso.", "success");

      if (typeof close === "function") {
        close(() => {
          setNovaTask({
            titulo: "",
            setor: "Administrativo",
            prioridade: "Média",
            status: "Pendente",
            estimativaValor: "",
            estimativaUnidade: "minutos",
            descricao: "",
          });
        });
      } else {
        setCreateTaskOpen(false);
      }
    } catch (err) {
      showToast(
        err.response?.data?.mensagem ||
          err.response?.data?.dados ||
          "Erro ao criar tarefa. Verifique os dados informados.",
        "error",
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
    "RH",
    "Recepção",
    "Atendimento",
    "Caixa",
    "Estoque",
    "HortiFruti",
    "Açougue",
    "Padaria",
    "Frios",
    "Mercearia",
    "Limpeza",
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
        <div className={styles.desktopOnly}>
          <DataTable
            columns={columns}
            data={lista}
            rowKey="id"
            onRowClick={setSelectedTask}
            sortKey={ordemTitulo ? "titulo" : ordemData ? "dataCriacao" : null}
            sortDirection={ordemTitulo || ordemData}
            onSort={handleSort}
            emptyMessage="Nenhuma tarefa encontrada"
            variant="tarefas"
          />
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
            actions={(close) => (
              <>
                <button className={styles.btnClose} onClick={() => close()}>
                  Fechar
                </button>

                {selectedTask.status !== "Concluída" && (
                  <button
                    className={styles.btnPrimary}
                    onClick={() => {
                      const tarefa = selectedTask;

                      close(() => {
                        setEditTask({
                          ...tarefa,
                          estimativaValor: tarefa.estimativaMinutos || "",
                          estimativaUnidade: "minutos",
                          estimativaMinutosBase:
                            Number(tarefa.estimativaMinutos) || 0,
                        });
                      });
                    }}
                  >
                    Editar
                  </button>
                )}

                <button
                  className={styles.btnDanger}
                  onClick={() => {
                    const tarefa = selectedTask;

                    close(() => {
                      setTaskParaExcluir(tarefa);
                    });
                  }}
                >
                  Excluir
                </button>
              </>
            )}
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

            {isValidImageUrl(selectedTask?.foto) && !imageError ? (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <strong>Imagem:</strong>

                <div>
                  <img
                    src={selectedTask.foto}
                    alt="Foto da tarefa"
                    onError={() => setImageError(true)}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "250px",
                      borderRadius: "8px",
                      marginTop: "10px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ marginTop: "15px", textAlign: "center" }}>
                <strong>Imagem:</strong>

                <div style={{ marginTop: "8px" }}>
                  <p style={{ color: "#666", fontStyle: "italic" }}>
                    {selectedTask?.foto && imageError
                      ? "Não foi possível carregar a imagem."
                      : "Nenhuma imagem disponível para esta tarefa."}
                  </p>
                </div>
              </div>
            )}
          </Modal>
        )}

        {taskParaExcluir && (
          <Modal
            title="Excluir tarefa"
            onClose={() => setTaskParaExcluir(null)}
            variant="between"
            actions={(close) => (
              <>
                <button className={styles.btnSecondary} onClick={() => close()}>
                  Cancelar
                </button>

                <button
                  className={styles.btnDanger}
                  onClick={() => excluirTask(taskParaExcluir.id)}
                >
                  Sim, excluir
                </button>
              </>
            )}
          >
            <div className={styles.deleteConfirmBox}>
              <div className={styles.deleteIcon}>!</div>

              <div>
                <h3>Confirmar exclusão</h3>

                <p>
                  A tarefa <strong>{taskParaExcluir.titulo}</strong> será
                  removida do sistema.
                </p>

                <span>Essa ação não poderá ser desfeita.</span>
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

                <button className={styles.btnPrimary} onClick={salvarEdicao}>
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
                <label>Estimativa</label>
                <input
                  type="number"
                  min="1"
                  max={
                    editTask.estimativaUnidade === "dias"
                      ? 7
                      : editTask.estimativaUnidade === "horas"
                        ? 168
                        : 10080
                  }
                  value={editTask.estimativaValor}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      estimativaValor: e.target.value,
                    })
                  }
                  placeholder="Ex: 2"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Unidade</label>
                <select
                  value={editTask.estimativaUnidade}
                  onChange={(e) => {
                    const novaUnidade = e.target.value;

                    const minutosAtuais = converterEstimativaParaMinutos(
                      editTask.estimativaValor,
                      editTask.estimativaUnidade,
                    );

                    setEditTask({
                      ...editTask,
                      estimativaUnidade: novaUnidade,
                      estimativaValor: converterMinutosParaUnidade(
                        minutosAtuais,
                        novaUnidade,
                      ),
                      estimativaMinutosBase: minutosAtuais,
                    });
                  }}
                >
                  <option value="minutos">Minutos</option>
                  <option value="horas">Horas</option>
                  <option value="dias">Dias</option>
                </select>
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
            actions={(close) => (
              <>
                <button
                  className={styles.btnDanger}
                  onClick={() => {
                    close(() => {
                      setNovaTask({
                        titulo: "",
                        setor: "Administrativo",
                        prioridade: "Média",
                        status: "Pendente",
                        estimativaValor: "",
                        estimativaUnidade: "minutos",
                        descricao: "",
                      });
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
                      estimativaValor: "",
                      estimativaUnidade: "minutos",
                      descricao: "",
                    })
                  }
                >
                  Limpar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={() => criarTask(close)}
                >
                  Criar
                </button>
              </>
            )}
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

              {/* ESTIMATIVA */}
              <div className={styles.formGroup}>
                <label>Estimativa</label>
                <input
                  type="number"
                  min="1"
                  max={
                    novaTask.estimativaUnidade === "dias"
                      ? 7
                      : novaTask.estimativaUnidade === "horas"
                        ? 168
                        : 10080
                  }
                  value={novaTask.estimativaValor}
                  onChange={(e) =>
                    setNovaTask({
                      ...novaTask,
                      estimativaValor: e.target.value,
                    })
                  }
                  placeholder="Ex: 2"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Unidade</label>
                <select
                  value={novaTask.estimativaUnidade}
                  onChange={(e) => {
                    const novaUnidade = e.target.value;

                    const minutosAtuais = converterEstimativaParaMinutos(
                      novaTask.estimativaValor,
                      novaTask.estimativaUnidade,
                    );

                    setNovaTask({
                      ...novaTask,
                      estimativaUnidade: novaUnidade,
                      estimativaValor: converterMinutosParaUnidade(
                        minutosAtuais,
                        novaUnidade,
                      ),
                    });
                  }}
                >
                  <option value="minutos">Minutos</option>
                  <option value="horas">Horas</option>
                  <option value="dias">Dias</option>
                </select>
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
