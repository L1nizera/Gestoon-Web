import { useState, useMemo, useEffect } from "react";
import styles from "../Home/style.module.css";
import jsPDF from "jspdf";
import Modal from "../../../components/Modal/Modal";
import autoTable from "jspdf-autotable";
import DataTable from "../../../components/ui/DataTable";
import api from "../../../services/api";

function Funcionarios() {
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

  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: "",
    email: "",
    setor: "Administrativo",
    cargo: "Gerente",
    ativo: true,

    // dados de acesso ao sistema
    login: "",
    senha: "",
  });

  const setores = [
    "Administrativo",
    "Financeiro",
    "Operacional",
    "Atendimento",
    "Limpeza",
    "Estoque",
    "Logística",
  ];

  const setorApiMap = {
    1: "Administrativo",
    2: "Financeiro",
    3: "Operacional",
    4: "Atendimento",
    5: "Limpeza",
    6: "Estoque",
    7: "Logística",
  };

  const cargoApiMap = {
    1: "Gerente",
    2: "Supervisor",
    3: "Caixa",
    4: "Repositor",
    5: "Auxiliar de Limpeza",
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

  const cargoToApiMap = {
    Gerente: 1,
    Supervisor: 2,
    Caixa: 3,
    Repositor: 4,
    "Auxiliar de Limpeza": 5,
  };

  const cargos = [
    "Gerente",
    "Supervisor",
    "Caixa",
    "Repositor",
    "Auxiliar de Limpeza",
  ];

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
    setSelected(null);
    setEditFuncionario({ ...funcionario });
  }

  async function salvarEdicaoFuncionario() {
    if (!editFuncionario.nome.trim()) {
      alert("O nome do funcionário é obrigatório.");
      return;
    }

    if (!validarEmail(editFuncionario.email)) {
      alert("Email inválido.");
      return;
    }

    const setorId =
      setorToApiMap[editFuncionario.setor] || editFuncionario.setorId;

    const cargoId =
      cargoToApiMap[editFuncionario.cargo] || editFuncionario.cargoId;

    if (!setorId) {
      alert(`Setor inválido: ${editFuncionario.setor}`);
      return;
    }

    if (!cargoId) {
      alert(`Cargo inválido: ${editFuncionario.cargo}`);
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
    } catch (err) {
      const erroApi = err.response?.data;

      console.error("Erro ao editar funcionário:", erroApi || err.message);

      alert(
        erroApi?.mensagem ||
          (typeof erroApi?.dados === "string"
            ? erroApi.dados
            : JSON.stringify(erroApi?.dados, null, 2)) ||
          "Erro ao editar funcionário. Verifique a API.",
      );
    }
  }

  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function criarFuncionario() {
    if (!novoFuncionario.nome.trim()) {
      alert("O nome do funcionário é obrigatório.");
      return;
    }

    if (!validarEmail(novoFuncionario.email)) {
      alert("Email inválido.");
      return;
    }

    if (!novoFuncionario.login.trim()) {
      alert("O login de acesso é obrigatório.");
      return;
    }

    if (!novoFuncionario.senha.trim()) {
      alert("A senha de acesso é obrigatória.");
      return;
    }

    if (novoFuncionario.senha.length < 4) {
      alert("A senha deve ter pelo menos 4 caracteres.");
      return;
    }

    const setorId = setorToApiMap[novoFuncionario.setor];
    const cargoId = cargoToApiMap[novoFuncionario.cargo];

    if (!setorId) {
      alert("Setor inválido.");
      return;
    }

    if (!cargoId) {
      alert("Cargo inválido.");
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
        alert(
          "Funcionário criado, mas não foi possível obter o ID para criar o usuário.",
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
        cargo: "Gerente",
        ativo: true,
        login: "",
        senha: "",
      });

      setCreateFuncionarioOpen(false);
    } catch (err) {
      console.error(
        "Erro ao cadastrar funcionário:",
        err.response?.data || err.message,
      );

      alert(
        err.response?.data?.dados ||
          err.response?.data?.mensagem ||
          "Erro ao cadastrar funcionário. Verifique a API.",
      );
    }
  }

  const fetchDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/funcionarios");

      console.log("Funcionários vindos da API:", response.data?.dados);

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

      setFuncionarios(funcionariosFormatados);
    } catch (err) {
      console.error("Erro na requisição:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
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
          <DataTable
            columns={columns}
            data={lista}
            rowKey="id"
            onRowClick={setSelected}
            sortKey={ordemNome ? "nome" : ordemData ? "dataCriacao" : null}
            sortDirection={getSortDirection(ordemNome ? "nome" : "dataCriacao")}
            onSort={handleSort}
            emptyMessage="Nenhum funcionário encontrado"
          />
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
                      cargo: "Gerente",
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
                  onChange={(e) =>
                    setNovoFuncionario({
                      ...novoFuncionario,
                      setor: e.target.value,
                    })
                  }
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
                  {cargos.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
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
                  onChange={(e) =>
                    setEditFuncionario({
                      ...editFuncionario,
                      setor: e.target.value,
                    })
                  }
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
                  {cargos.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargo}
                    </option>
                  ))}
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
