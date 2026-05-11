import { useState, useMemo, useEffect } from "react";
import styles from "../Home/style.module.css";
import jsPDF from "jspdf";
import Modal from "../../components/Modal/Modal";
import autoTable from "jspdf-autotable";
import DataTable from "../../components/ui/DataTable";
import api from "../../services/api";

function Funcionarios() {
  const [busca, setBusca] = useState("");
  const [setorFiltro, setSetorFiltro] = useState("");
  const [ativoFiltro, setAtivoFiltro] = useState("");
  const [ordemNome, setOrdemNome] = useState(null);
  const [ordemData, setOrdemData] = useState(null);

  const [selected, setSelected] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    3: "Analista",
    4: "Auxiliar",
    5: "Caixa",
    6: "Motorista",
    7: "Repositor",
    8: "Atendente",
    9: "Coordenador",
    10: "Auxiliar de Limpeza",
  };

  const statusBadgeMap = {
    ativo: "statusConcluida",
    inativo: "statusCancelada",
    afastado: "statusAndamento",
  };

  function parseDateValue(value) {
    if (!value) return { formatted: "-", iso: "" };

    if (typeof value === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [day, month, year] = value.split("/");
      const date = new Date(`${year}-${month}-${day}`);

      if (!Number.isNaN(date.getTime())) {
        return {
          formatted: date.toLocaleDateString("pt-BR"),
          iso: date.toISOString(),
        };
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return { formatted: "-", iso: "" };
    }

    return {
      formatted: `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit",
        },
      )}`,
      iso: date.toISOString(),
    };
  }

  function normalizeBoolean(value) {
    return [true, 1, "1", "true", "Ativo", "ativo"].includes(value);
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
          className={`${styles.badge} ${styles[getStatusBadgeClass(row.ativo)]}`}
        >
          {formatStatus(row.ativo)}
        </span>
      ),
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

  const fetchDados = async () => {
    try {
      setLoading(true);
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

            setor:
              setorApiMap[Number(funcionario.func_setor_id)] ||
              `Setor #${funcionario.func_setor_id}`,

            cargo:
              cargoApiMap[Number(funcionario.func_crg_id)] ||
              `Cargo #${funcionario.func_crg_id}`,

            ativo,
            status: formatStatus(funcionario.func_ativo),

            dataCriacao: date.formatted,
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

      resultado = resultado.filter(
        (func) => func.ativo === ativoValor,
      );
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

        ordenacao =
          ordemData === "recente"
            ? dataB - dataA
            : dataA - dataB;
      }

      return ordenacao;
    });

    return resultado;
  }, [
    funcionarios,
    busca,
    setorFiltro,
    ativoFiltro,
    ordemNome,
    ordemData,
  ]);

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
      func.nome,
      func.email,
      func.setor,
      func.cargo,
      func.status,
      func.dataCriacao,
    ]);

    autoTable(doc, {
      head: [["Nome", "Email", "Setor", "Cargo", "Status", "Data"]],
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
          <button
            className={styles.limparBtn}
            onClick={limparFiltros}
          >
            Limpar Filtros
          </button>

          <button
            className={styles.criarBtn}
            onClick={() =>
              alert(
                "Cadastro de funcionário não está disponível nesta versão.",
              )
            }
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
            sortKey={
              ordemNome
                ? "nome"
                : ordemData
                  ? "dataCriacao"
                  : null
            }
            sortDirection={getSortDirection(
              ordemNome ? "nome" : "dataCriacao",
            )}
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
              <button
                className={styles.btnClose}
                onClick={() => setSelected(null)}
              >
                Fechar
              </button>
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
                  className={`${styles.badge} ${styles[getStatusBadgeClass(selected.ativo)]}`}
                >
                  {selected.status}
                </span>
              </div>
            </div>
          </Modal>
        )}

        <div className={styles.footerActions}>
          <button
            className={styles.exportBtn}
            onClick={exportarPDF}
          >
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default Funcionarios;
