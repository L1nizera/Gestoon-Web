import { useState, useMemo, useEffect, useRef } from "react";
import styles from "../Home/style.module.css";
import localStyles from "./style.module.css";
import jsPDF from "jspdf";
import Modal from "../../../components/Modal/Modal";
import autoTable from "jspdf-autotable";
import DataTable from "../../../components/ui/DataTable";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../components/ui/Toast";

function Funcionarios() {
  const { user } = useAuth();

  const usuarioEhGerente = Number(user?.cargoId) === 1;
  const usuarioEhSupervisor = Number(user?.cargoId) === 2;
  const cargoInicialCriacao = usuarioEhGerente
    ? "Supervisor"
    : "Auxiliar Administrativo";

  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");
  const [ativoFiltro, setAtivoFiltro] = useState("");
  const [ordemNome, setOrdemNome] = useState(null);
  const [ordemData, setOrdemData] = useState(null);

  const [selected, setSelected] = useState(null);
  const [editFuncionario, setEditFuncionario] = useState(null);
  const [createFuncionarioOpen, setCreateFuncionarioOpen] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const primeiraCargaRef = useRef(true);
  const ultimaChaveFuncionariosRef = useRef("");

  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    email: "",
    setor: "Administrativo",
    cargo: cargoInicialCriacao,
    ativo: true,
    login: "",
    senha: "",
  });

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

  const cargoApiMap = {
    1: "Gerente",
    2: "Supervisor",
    3: "Caixa",
    4: "Repositor",
    5: "Auxiliar de Limpeza",

    6: "Auxiliar Administrativo",
    7: "Assistente Financeiro",
    8: "Analista Financeiro",
    9: "Auxiliar de RH",
    10: "Analista de RH",
    11: "Recepcionista",
    12: "Atendente de Recepção",
    13: "Atendente",
    14: "Operador de Atendimento",
    15: "Operador de Caixa",
    16: "Fiscal de Caixa",
    17: "Estoquista",
    18: "Conferente de Estoque",
    19: "Repositor de HortiFruti",
    20: "Auxiliar de HortiFruti",
    21: "Açougueiro",
    22: "Auxiliar de Açougue",
    23: "Padeiro",
    24: "Auxiliar de Padaria",
    25: "Balconista de Frios",
    26: "Auxiliar de Frios",
    27: "Repositor de Mercearia",
    28: "Auxiliar de Mercearia",
  };

  const cargosPorSetor = {
    Administrativo: ["Auxiliar Administrativo"],
    Financeiro: ["Assistente Financeiro", "Analista Financeiro"],
    RH: ["Auxiliar de RH", "Analista de RH"],
    Recepção: ["Recepcionista", "Atendente de Recepção"],
    Atendimento: ["Atendente", "Operador de Atendimento"],
    Caixa: ["Operador de Caixa", "Fiscal de Caixa"],
    Estoque: ["Estoquista", "Conferente de Estoque"],
    HortiFruti: ["Repositor de HortiFruti", "Auxiliar de HortiFruti"],
    Açougue: ["Açougueiro", "Auxiliar de Açougue"],
    Padaria: ["Padeiro", "Auxiliar de Padaria"],
    Frios: ["Balconista de Frios", "Auxiliar de Frios"],
    Mercearia: ["Repositor de Mercearia", "Auxiliar de Mercearia"],
    Limpeza: ["Auxiliar de Limpeza"],
  };

  function getCargosPermitidosPorSetor(setorSelecionado) {
    const cargosDoSetor = cargosPorSetor[setorSelecionado] || [];

    if (usuarioEhGerente) {
      if (setorSelecionado === "Administrativo") {
        return ["Supervisor", ...cargosDoSetor];
      }

      return cargosDoSetor;
    }

    return cargosDoSetor.filter((cargo) => cargo !== "Supervisor");
  }

  function getCargoInicial(setorSelecionado) {
    const cargosPermitidos = getCargosPermitidosPorSetor(setorSelecionado);

    return cargosPermitidos[0] || "";
  }

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

  const cargoToApiMap = {
    Gerente: 1,
    Supervisor: 2,
    Caixa: 3,
    Repositor: 4,
    "Auxiliar de Limpeza": 5,

    "Auxiliar Administrativo": 6,
    "Assistente Financeiro": 7,
    "Analista Financeiro": 8,
    "Auxiliar de RH": 9,
    "Analista de RH": 10,
    Recepcionista: 11,
    "Atendente de Recepção": 12,
    Atendente: 13,
    "Operador de Atendimento": 14,
    "Operador de Caixa": 15,
    "Fiscal de Caixa": 16,
    Estoquista: 17,
    "Conferente de Estoque": 18,
    "Repositor de HortiFruti": 19,
    "Auxiliar de HortiFruti": 20,
    Açougueiro: 21,
    "Auxiliar de Açougue": 22,
    Padeiro: 23,
    "Auxiliar de Padaria": 24,
    "Balconista de Frios": 25,
    "Auxiliar de Frios": 26,
    "Repositor de Mercearia": 27,
    "Auxiliar de Mercearia": 28,
  };

  const statusBadgeMap = {
    ativo: "statusConcluida",
    inativo: "statusCancelada",
    afastado: "statusAndamento",
  };

  function parseDateValue(value) {
    if (!value) {
      return {
        data: "-",
        hora: "-",
        iso: "",
      };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return {
        data: "-",
        hora: "-",
        iso: "",
      };
    }

    return {
      data: date.toLocaleDateString("pt-BR"),
      hora: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      iso: date.toISOString(),
    };
  }

  function normalizeBoolean(value) {
    if (value === true) return true;
    if (value === false) return false;

    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;

    // Caso o MySQL retorne BIT(1) como Buffer
    if (value && typeof value === "object" && Array.isArray(value.data)) {
      return Number(value.data[0]) === 1;
    }

    // Caso venha Uint8Array/Buffer direto
    if (value && typeof value === "object" && value[0] !== undefined) {
      return Number(value[0]) === 1;
    }

    if (typeof value === "string") {
      const normalized = value.toLowerCase().trim();

      if (normalized === "ativo" || normalized === "true") return true;
      if (normalized === "inativo" || normalized === "false") return false;
    }

    return false;
  }

  function formatStatus(value) {
    if (value === "afastado") return "Afastado";
    return normalizeBoolean(value) ? "Ativo" : "Inativo";
  }

  function getStatusBadgeClass(value) {
    const key = formatStatus(value).toLowerCase();
    return statusBadgeMap[key] || "statusCancelada";
  }

  const columns = [
    {
      key: "id",
      label: "ID",
      align: "center",
      sortable: true,
    },
    {
      key: "nome",
      label: "Nome",
      sortable: true,
      render: (row) => <span title={row.nome}>{row.nome}</span>,
    },
    {
      key: "email",
      label: "Email",
      align: "center",
      render: (row) => <span title={row.email}>{row.email}</span>,
    },
    {
      key: "setor",
      label: "Setor",
      align: "center",
    },
    {
      key: "cargo",
      label: "Cargo",
      align: "center",
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <span
          className={`${styles.badge} ${
            row.ativo ? styles.statusConcluida : styles.statusCancelada
          }`}
        >
          {row.ativo ? "Ativo" : "Inativo"}
        </span>
      ),
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

  function handleSort(key) {
    if (key === "nome") {
      setOrdemNome((prev) => {
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

      setOrdemNome(null);
    }
  }

  function getSortDirection(key) {
    if (key === "nome") return ordemNome;
    if (key === "dataCriacao") return ordemData;
    return null;
  }

  function abrirEdicaoFuncionario(funcionario) {
    if (funcionario.cargoId === 1) {
      showToast("Gerentes não podem ser editados pelo painel.", "warning");
      return;
    }

    setSelected(null);
    setEditFuncionario({ ...funcionario });
  }

  async function salvarEdicaoFuncionario() {
    if (!editFuncionario.nome.trim()) {
      avisarCampo("Nome", "informe o nome do funcionário.");
      return;
    }

    if (!editFuncionario.email.trim()) {
      avisarCampo("Email", "informe o email do funcionário.");
      return;
    }

    if (!validarEmail(editFuncionario.email)) {
      avisarCampo("Email", "informe um email válido.");
      return;
    }

    const setorId =
      setorToApiMap[editFuncionario.setor] || editFuncionario.setorId;

    const cargoId =
      cargoToApiMap[editFuncionario.cargo] || editFuncionario.cargoId;

    const cargosPermitidos = getCargosPermitidosPorSetor(editFuncionario.setor);

    if (!cargosPermitidos.includes(editFuncionario.cargo)) {
      showToast("Cargo inválido para o setor selecionado.", "warning");
      return;
    }

    if (cargoId === 1) {
      showToast(
        "Não é permitido alterar funcionário para Gerente pelo painel.",
        "warning",
      );
      return;
    }

    if (usuarioEhSupervisor && cargoId === 2) {
      showToast(
        "Supervisores não podem alterar funcionário para Supervisor.",
        "warning",
      );
      return;
    }

    if (!setorId) {
      showToast(`Setor inválido: ${editFuncionario.setor}`, "warning");
      return;
    }

    if (!cargoId) {
      showToast(`Cargo inválido: ${editFuncionario.cargo}`, "warning");
      return;
    }

    try {
      const payload = {
        nome: editFuncionario.nome,
        email: editFuncionario.email,
        setorId,
        cargoId,
        ativo: editFuncionario.ativo ? 1 : 0,
      };

      console.log("Payload edição funcionário:", payload);

      await api.patch(`/funcionarios/${editFuncionario.id}`, payload);

      await fetchDados();

      setEditFuncionario(null);

      showToast("Funcionário atualizado com sucesso.", "success");
    } catch (err) {
      console.error(
        "Erro ao editar funcionário:",
        err.response?.data || err.message,
      );

      showToast(normalizarMensagemErro(err), "error");
    }
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function normalizarMensagemErro(err) {
    const erroApi = err.response?.data;

    const partes = [erroApi?.mensagem, erroApi?.dados, err.message]
      .filter(Boolean)
      .map((item) => {
        if (typeof item === "string") return item;
        return JSON.stringify(item);
      });

    const mensagem = partes.join(" ");

    if (mensagem.includes("Duplicate entry")) {
      if (mensagem.includes("func_email")) {
        return "Email: já existe um funcionário cadastrado com esse email.";
      }

      if (mensagem.includes("usu_login")) {
        return "Login: já existe um usuário cadastrado com esse login.";
      }

      if (mensagem.includes("func_login")) {
        return "Login: já existe um funcionário usando esse login.";
      }

      return "Cadastro duplicado: já existe um registro com essas informações.";
    }

    if (mensagem.includes("cannot be null")) {
      return "Campos obrigatórios: preencha todos os dados necessários.";
    }

    if (mensagem.includes("Data too long")) {
      return "Campo inválido: algum texto informado está maior que o permitido.";
    }

    if (mensagem.includes("foreign key constraint")) {
      return "Vínculo inválido: setor, cargo ou usuário relacionado não foi encontrado.";
    }

    if (mensagem.includes("Erro ao cadastrar Funcionário")) {
      return "Erro ao cadastrar funcionário. Verifique se email, login, setor e cargo estão corretos.";
    }

    return mensagem || "Erro inesperado. Verifique os dados e tente novamente.";
  }

  function avisarCampo(campo, mensagem) {
    showToast(`${campo}: ${mensagem}`, "warning");
  }

  async function criarFuncionario() {
    if (!novoFuncionario.nome.trim()) {
      avisarCampo("Nome", "informe o nome do funcionário.");
      return;
    }

    if (!novoFuncionario.email.trim()) {
      avisarCampo("Email", "informe o email do funcionário.");
      return;
    }

    if (!validarEmail(novoFuncionario.email)) {
      avisarCampo("Email", "informe um email válido.");
      return;
    }

    if (!novoFuncionario.login.trim()) {
      avisarCampo("Login", "informe o login de acesso.");
      return;
    }

    if (!novoFuncionario.senha.trim()) {
      avisarCampo("Senha", "informe a senha de acesso.");
      return;
    }

    if (novoFuncionario.senha.length < 4) {
      avisarCampo("Senha", "use pelo menos 4 caracteres.");
      return;
    }

    const setorId = setorToApiMap[novoFuncionario.setor];
    const cargoId = cargoToApiMap[novoFuncionario.cargo];

    const cargosPermitidos = getCargosPermitidosPorSetor(novoFuncionario.setor);

    if (!cargosPermitidos.includes(novoFuncionario.cargo)) {
      showToast("Cargo inválido para o setor selecionado.", "warning");
      return;
    }

    if (cargoId === 1) {
      showToast(
        "Não é permitido criar perfil de Gerente pelo painel.",
        "warning",
      );
      return;
    }

    if (usuarioEhSupervisor && cargoId === 2) {
      showToast("Supervisores não podem criar outros supervisores.", "warning");
      return;
    }

    if (!setorId) {
      showToast("Setor inválido.", "warning");
      return;
    }

    if (!cargoId) {
      showToast("Cargo inválido.", "warning");
      return;
    }

    try {
      const payloadFuncionario = {
        nome: novoFuncionario.nome,
        email: novoFuncionario.email,
        setor: setorId,
        cargo: cargoId,
        ativo: novoFuncionario.ativo ? 1 : 0,
      };

      const responseFuncionario = await api.post(
        "/funcionarios",
        payloadFuncionario,
      );

      const funcionarioCriado = responseFuncionario.data.dados;

      const funcionarioId =
        funcionarioCriado.id ||
        funcionarioCriado.func_id ||
        funcionarioCriado.funcionario;

      if (!funcionarioId) {
        showToast(
          "Funcionário criado, mas não foi possível obter o ID para criar o usuário.",
          "warning",
        );
        return;
      }

      const payloadUsuario = {
        funcionario: funcionarioId,
        login: novoFuncionario.login,
        senha: novoFuncionario.senha,
        ativo: novoFuncionario.ativo ? 1 : 0,
      };

      await api.post("/usuarios", payloadUsuario);

      await fetchDados();

      setNovoFuncionario({
        nome: "",
        email: "",
        setor: "Administrativo",
        cargo: cargoInicialCriacao,
        ativo: true,
        login: "",
        senha: "",
      });

      setCreateFuncionarioOpen(false);

      showToast("Funcionário cadastrado com sucesso.", "success");
    } catch (err) {
      console.error(
        "Erro ao cadastrar funcionário:",
        err.response?.data || err.message,
      );

      showToast(normalizarMensagemErro(err), "error");
    }
  }

  function gerarChaveFuncionarios(lista) {
    return lista
      .map((func) =>
        [
          func.id,
          func.nome,
          func.email,
          func.setorId,
          func.cargoId,
          func.ativo,
          func.dataCriacao,
          func.horaCriacao,
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

      const response = await api.get("/funcionarios");

      const funcionariosFormatados = (response.data?.dados || []).map(
        (funcionario) => {
          const ativo = normalizeBoolean(funcionario.func_ativo);
          const date = parseDateValue(funcionario.func_data_criacao);

          return {
            id: funcionario.func_id,
            nome: funcionario.func_nome || "-",
            email: funcionario.func_email || "-",

            setorId: Number(funcionario.func_setor_id),
            cargoId: Number(funcionario.func_crg_id),

            setor:
              setorApiMap[Number(funcionario.func_setor_id)] ||
              `Setor #${funcionario.func_setor_id}`,

            cargo:
              cargoApiMap[Number(funcionario.func_crg_id)] ||
              `Cargo #${funcionario.func_crg_id}`,

            ativo,
            status: ativo ? "Ativo" : "Inativo",

            dataCriacao: date.data,
            horaCriacao: date.hora,
            dataCriacaoISO: date.iso,
          };
        },
      );

      const novaChave = gerarChaveFuncionarios(funcionariosFormatados);

      if (novaChave !== ultimaChaveFuncionariosRef.current) {
        ultimaChaveFuncionariosRef.current = novaChave;

        const scrollAtual = window.scrollY;

        setFuncionarios(funcionariosFormatados);

        requestAnimationFrame(() => {
          window.scrollTo(0, scrollAtual);
        });
      }
    } catch (err) {
      console.error("Erro na requisição:", err.response?.data || err.message);

      if (primeiraCargaRef.current) {
        setError("Não foi possível carregar os dados.");
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
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const lista = useMemo(() => {
    let resultado = [...funcionarios];

    if (busca) {
      resultado = resultado.filter((func) =>
        func.nome.toLowerCase().includes(busca.toLowerCase()),
      );
    }

    if (setorFiltro) {
      resultado = resultado.filter((func) => func.setor === setorFiltro);
    }

    if (ativoFiltro !== "") {
      const ativoValor = ativoFiltro === "true";

      resultado = resultado.filter((func) => func.ativo === ativoValor);
    }

    resultado.sort((a, b) => {
      let ordenacao = 0;

      if (ordemNome) {
        ordenacao =
          ordemNome === "az"
            ? a.nome.localeCompare(b.nome)
            : b.nome.localeCompare(a.nome);
      }

      if (ordenacao === 0 && ordemData) {
        const dataA = new Date(a.dataCriacaoISO);
        const dataB = new Date(b.dataCriacaoISO);

        ordenacao = ordemData === "recente" ? dataB - dataA : dataA - dataB;
      }

      return ordenacao;
    });

    return resultado;
  }, [funcionarios, busca, setorFiltro, ativoFiltro, ordemNome, ordemData]);

  function limparFiltros() {
    setBusca("");
    setSetorFiltro("");
    setAtivoFiltro("");
    setOrdemNome(null);
    setOrdemData(null);
  }

  function exportarPDF() {
    const doc = new jsPDF();

    const dados = lista.map((func) => [
      func.id,
      func.nome,
      func.email,
      func.setor,
      func.cargo,
      func.status,
      func.dataCriacao,
      func.horaCriacao,
    ]);

    autoTable(doc, {
      head: [
        ["ID", "Nome", "Email", "Setor", "Cargo", "Status", "Data", "Hora"],
      ],
      body: dados,
    });

    doc.save("funcionarios.pdf");
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.cardContainer}>
        <h1>Funcionários</h1>

        <div className={styles.topActions}>
          <input
            className={styles.busca}
            placeholder="Buscar funcionário..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className={styles.filtrosAvancados}>
          <div>
            <small>Setor:</small>

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

          <div>
            <small>Status:</small>

            <select
              value={ativoFiltro}
              onChange={(e) => setAtivoFiltro(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>
        </div>

        <div className={styles.acoes}>
          <button className={styles.limparBtn} onClick={limparFiltros}>
            Limpar Filtros
          </button>

          <button
            className={styles.criarBtn}
            onClick={() => setCreateFuncionarioOpen(true)}
          >
            Cadastrar Funcionário
          </button>
        </div>

        {loading ? (
          <p>Carregando funcionários...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <>
            <div className={localStyles.hideOnMobile}>
              <DataTable
                columns={columns}
                data={lista}
                rowKey="id"
                onRowClick={setSelected}
                sortKey={ordemNome ? "nome" : ordemData ? "dataCriacao" : null}
                sortDirection={getSortDirection(
                  ordemNome ? "nome" : "dataCriacao",
                )}
                onSort={handleSort}
                emptyMessage="Nenhum funcionário encontrado"
                variant="funcionarios"
              />
            </div>

            <div className={localStyles.showOnMobile}>
              {lista.length === 0 ? (
                <p className={styles.textCenter}>
                  Nenhum funcionário encontrado
                </p>
              ) : (
                <div className={localStyles.cardList}>
                  {lista.map((funcionario) => (
                    <article
                      key={funcionario.id}
                      className={`${styles.card} ${localStyles.employeeCard}`}
                      onClick={() => setSelected(funcionario)}
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          setSelected(funcionario);
                        }
                      }}
                    >
                      <div className={styles.cardHeader}>
                        <div>
                          <h2>{funcionario.nome}</h2>
                          <p className={localStyles.cardId}>
                            ID {funcionario.id}
                          </p>
                        </div>

                        <span
                          className={`${styles.badge} ${funcionario.ativo ? styles.statusConcluida : styles.statusCancelada}`}
                        >
                          {funcionario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className={styles.cardBody}>
                        <p className={localStyles.emailLine}>
                          {funcionario.email}
                        </p>

                        <div className={localStyles.cardGrid}>
                          <div className={localStyles.cardField}>
                            <span className={localStyles.cardLabel}>Setor</span>
                            <span className={localStyles.cardValue}>
                              {funcionario.setor}
                            </span>
                          </div>

                          <div className={localStyles.cardField}>
                            <span className={localStyles.cardLabel}>Cargo</span>
                            <span className={localStyles.cardValue}>
                              {funcionario.cargo}
                            </span>
                          </div>
                        </div>

                        <div className={localStyles.cardGrid}>
                          <div className={localStyles.cardField}>
                            <span className={localStyles.cardLabel}>Data</span>
                            <span className={localStyles.cardValue}>
                              {funcionario.dataCriacao}
                            </span>
                          </div>

                          <div className={localStyles.cardField}>
                            <span className={localStyles.cardLabel}>Hora</span>
                            <span className={localStyles.cardValue}>
                              {funcionario.horaCriacao}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {selected && (
          <Modal
            title={selected.nome}
            onClose={() => setSelected(null)}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnClose}
                  onClick={() => setSelected(null)}
                >
                  Fechar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={() => abrirEdicaoFuncionario(selected)}
                >
                  Editar
                </button>
              </>
            }
          >
            <div className={styles.modalGrid}>
              <div>
                <strong>Email:</strong>
                <p>{selected.email}</p>
              </div>

              <div>
                <strong>Setor:</strong>
                <p>{selected.setor}</p>
              </div>

              <div>
                <strong>Cargo:</strong>
                <p>{selected.cargo}</p>
              </div>

              <div>
                <strong>Status:</strong>

                <span
                  className={`${styles.badge} ${
                    selected.ativo
                      ? styles.statusConcluida
                      : styles.statusCancelada
                  }`}
                >
                  {selected.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div>
                <strong>Data de cadastro:</strong>
                <p>{selected.dataCriacao}</p>
              </div>
            </div>
          </Modal>
        )}

        {createFuncionarioOpen && (
          <Modal
            title="Cadastrar Funcionário"
            onClose={() => setCreateFuncionarioOpen(false)}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnDanger}
                  onClick={() => setCreateFuncionarioOpen(false)}
                >
                  Fechar
                </button>

                <button
                  className={styles.btnSecondary}
                  onClick={() =>
                    setNovoFuncionario({
                      nome: "",
                      email: "",
                      setor: "Administrativo",
                      cargo: cargoInicialCriacao,
                      ativo: true,
                      login: "",
                      senha: "",
                    })
                  }
                >
                  Limpar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={criarFuncionario}
                >
                  Cadastrar
                </button>
              </>
            }
          >
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Nome</label>
                <input
                  type="text"
                  value={novoFuncionario.nome}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      nome: e.target.value,
                    })
                  }
                  placeholder="Digite o nome..."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Email</label>
                <input
                  type="email"
                  value={novoFuncionario.email}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      email: e.target.value,
                    })
                  }
                  placeholder="Digite o email..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Login de acesso</label>
                <input
                  type="text"
                  value={novoFuncionario.login}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      login: e.target.value,
                    })
                  }
                  placeholder="Ex: Carlos, paulo2..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Senha de acesso</label>
                <input
                  type="password"
                  value={novoFuncionario.senha}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      senha: e.target.value,
                    })
                  }
                  placeholder="Digite uma senha..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Setor</label>
                <select
                  value={novoFuncionario.setor}
                  onChange={(e) => {
                    const novoSetor = e.target.value;

                    setNovoFuncionario({
                      ...novoFuncionario,
                      setor: novoSetor,
                      cargo: getCargoInicial(novoSetor),
                    });
                  }}
                >
                  {setores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Cargo</label>
                <select
                  value={novoFuncionario.cargo}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      cargo: e.target.value,
                    })
                  }
                >
                  {getCargosPermitidosPorSetor(novoFuncionario.setor).map(
                    (cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={novoFuncionario.ativo ? "1" : "0"}
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      ativo: e.target.value === "1",
                    })
                  }
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>
            </div>
          </Modal>
        )}

        {editFuncionario && (
          <Modal
            title="Editar Funcionário"
            onClose={() => setEditFuncionario(null)}
            variant="between"
            actions={
              <>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setEditFuncionario(null)}
                >
                  Cancelar
                </button>

                <button
                  className={styles.btnPrimary}
                  onClick={salvarEdicaoFuncionario}
                >
                  Salvar
                </button>
              </>
            }
          >
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Nome</label>
                <input
                  type="text"
                  value={editFuncionario.nome}
                  onChange={(e) =>
                    setEditFuncionario({
                      ...editFuncionario,
                      nome: e.target.value,
                    })
                  }
                />
              </div>

              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Email</label>
                <input
                  type="email"
                  value={editFuncionario.email}
                  onChange={(e) =>
                    setEditFuncionario({
                      ...editFuncionario,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Setor</label>
                <select
                  value={editFuncionario.setor}
                  onChange={(e) => {
                    const novoSetor = e.target.value;
                    const cargosPermitidos =
                      getCargosPermitidosPorSetor(novoSetor);

                    const cargoAtualAindaServe = cargosPermitidos.includes(
                      editFuncionario.cargo,
                    );

                    setEditFuncionario({
                      ...editFuncionario,
                      setor: novoSetor,
                      cargo: cargoAtualAindaServe
                        ? editFuncionario.cargo
                        : getCargoInicial(novoSetor),
                    });
                  }}
                >
                  {setores.map((setor) => (
                    <option key={setor} value={setor}>
                      {setor}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Cargo</label>
                <select
                  value={editFuncionario.cargo}
                  onChange={(e) =>
                    setEditFuncionario({
                      ...editFuncionario,
                      cargo: e.target.value,
                    })
                  }
                >
                  {getCargosPermitidosPorSetor(editFuncionario.setor).map(
                    (cargo) => (
                      <option key={cargo} value={cargo}>
                        {cargo}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={editFuncionario.ativo ? "1" : "0"}
                  onChange={(e) =>
                    setEditFuncionario({
                      ...editFuncionario,
                      ativo: e.target.value === "1",
                      status: e.target.value === "1" ? "Ativo" : "Inativo",
                    })
                  }
                >
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>ID</label>
                <input type="text" value={editFuncionario.id} disabled />
              </div>
            </div>
          </Modal>
        )}

        <div className={styles.footerActions}>
          <button className={styles.exportBtn} onClick={exportarPDF}>
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Funcionarios;
