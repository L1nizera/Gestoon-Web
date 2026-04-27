import { useState, useMemo } from "react";
import styles from "../Home/style.module.css";
import jsPDF from "jspdf";
import Modal from "../../components/Modal/Modal";
import autoTable from "jspdf-autotable";

// MOCK (igual você faz com tasks)
const funcionariosData = [
    {
        id: 1,
        nome: "João Silva",
        email: "joao@email.com",
        setor: "Estoque",
        cargo: "Supervisor",
        ativo: true,
        dataCriacao: "10/03/2026",
    },
    {
        id: 2,
        nome: "Maria Souza",
        email: "maria@email.com",
        setor: "Atendimento",
        cargo: "Caixa",
        ativo: false,
        dataCriacao: "22/02/2026",
    },
    {
        id: 3,
        nome: "Carlos Mendes",
        email: "carlos@email.com",
        setor: "Logística",
        cargo: "Motorista",
        ativo: true,
        dataCriacao: "05/01/2026",
    },
    {
        id: 4,
        nome: "Ana Oliveira",
        email: "ana@email.com",
        setor: "Financeiro",
        cargo: "Analista",
        ativo: true,
        dataCriacao: "18/03/2026",
    },
    {
        id: 5,
        nome: "Bruno Rocha",
        email: "bruno@email.com",
        setor: "Operacional",
        cargo: "Auxiliar",
        ativo: false,
        dataCriacao: "30/01/2026",
    },
    {
        id: 6,
        nome: "Fernanda Lima",
        email: "fernanda@email.com",
        setor: "Administrativo",
        cargo: "Gerente",
        ativo: true,
        dataCriacao: "12/02/2026",
    },
    {
        id: 7,
        nome: "Ricardo Alves",
        email: "ricardo@email.com",
        setor: "Estoque",
        cargo: "Repositor",
        ativo: true,
        dataCriacao: "25/03/2026",
    },
    {
        id: 8,
        nome: "Juliana Costa",
        email: "juliana@email.com",
        setor: "Atendimento",
        cargo: "Atendente",
        ativo: false,
        dataCriacao: "08/01/2026",
    },
    {
        id: 9,
        nome: "Paulo Henrique",
        email: "paulo@email.com",
        setor: "Logística",
        cargo: "Coordenador",
        ativo: true,
        dataCriacao: "14/02/2026",
    },
    {
        id: 10,
        nome: "Camila Santos",
        email: "camila@email.com",
        setor: "Limpeza",
        cargo: "Auxiliar de Limpeza",
        ativo: true,
        dataCriacao: "27/03/2026",
    },
];

function Funcionarios() {
    const [busca, setBusca] = useState("");
    const [setorFiltro, setSetorFiltro] = useState("");
    const [ativoFiltro, setAtivoFiltro] = useState("");
    const [ordemNome, setOrdemNome] = useState(null);
    const [ordemData, setOrdemData] = useState(null);

    const [listaState, setListaState] = useState(funcionariosData);
    const [selected, setSelected] = useState(null);
    const [edit, setEdit] = useState(null);

    const [createModal, setCreateModal] = useState(false);

    const [novoFuncionario, setNovoFuncionario] = useState({
        nome: "",
        email: "",
        setor: "",
        cargo: "",
        ativo: true,
    });

    function limparFiltros() {
        setSetorFiltro("");
        setAtivoFiltro("");
    }

    const setores = [
        "Administrativo",
        "Financeiro",
        "Operacional",
        "Atendimento",
        "Limpeza",
        "Estoque",
        "Logística",
    ];

    // ===== FILTRO =====
    const lista = useMemo(() => {
        let lista = [...listaState];

        if (busca) {
            lista = lista.filter((f) =>
                f.nome.toLowerCase().includes(busca.toLowerCase()),
            );
        }

        if (setorFiltro) {
            lista = lista.filter((f) => f.setor === setorFiltro);
        }

        if (ativoFiltro !== "") {
            lista = lista.filter((f) =>
                ativoFiltro === "true" ? f.ativo : !f.ativo,
            );
        }

        lista.sort((a, b) => {
            let result = 0;

            if (ordemNome) {
                result =
                    ordemNome === "az"
                        ? a.nome.localeCompare(b.nome)
                        : b.nome.localeCompare(a.nome);
            }

            if (result === 0 && ordemData) {
                const [dA, mA, yA] = a.dataCriacao.split("/");
                const [dB, mB, yB] = b.dataCriacao.split("/");

                const dataA = new Date(`${yA}-${mA}-${dA}`);
                const dataB = new Date(`${yB}-${mB}-${dB}`);

                result = ordemData === "recente" ? dataB - dataA : dataA - dataB;
            }

            return result;
        });

        return lista;
    }, [listaState, busca, setorFiltro, ativoFiltro, ordemNome, ordemData]);

    // ===== PDF =====
    function exportarPDF() {
        const doc = new jsPDF();

        const dados = lista.map((f) => [
            f.nome,
            f.email,
            f.setor,
            f.cargo,
            f.ativo ? "Ativo" : "Inativo",
            f.dataCriacao,
        ]);

        autoTable(doc, {
            head: [["Nome", "Email", "Setor", "Cargo", "Status", "Data"]],
            body: dados,
        });

        doc.save("funcionarios.pdf");
    }
    const salvarEdicao = () => {
        if (!edit) return;

        setListaState((prev) =>
            prev.map((f) => (f.id === edit.id ? edit : f))
        );

        setEdit(null);
    };

    function criarFuncionario() {
        if (!novoFuncionario.nome || !novoFuncionario.email) return;

        const novo = {
            ...novoFuncionario,
            id: Date.now(),
            dataCriacao: new Date().toLocaleDateString(),
        };

        function validarEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        if (!validarEmail(novoFuncionario.email)) {
            alert("Email inválido");
            return;
        }

        setListaState((prev) => [...prev, novo]);

        setCreateModal(false);

        // limpa o form
        setNovoFuncionario({
            nome: "",
            email: "",
            setor: "",
            cargo: "",
            ativo: true,
        });
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.cardContainer}>
                <h1>Funcionários</h1>

                {/* BUSCA */}
                <div className={styles.topActions}>
                    <input
                        className={styles.busca}
                        placeholder="Buscar funcionário..."
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>


                {/* FILTROS */}
                <div className={styles.filtrosAvancados}>
                    <div>
                        <small>Setor:</small>
                        <select
                            value={setorFiltro}
                            onChange={(e) => setSetorFiltro(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {setores.map((s) => (
                                <option key={s}>{s}</option>
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
                        onClick={() => setCreateModal(true)}
                    >
                        Cadastrar Funcionário
                    </button>
                </div>

                {/* ===== DESKTOP (TABELA) ===== */}
                <div className={`${styles.tabelaContainer} ${styles.desktopOnly}`}>
                    <table className={styles.tabela}>
                        <thead>
                            <tr>
                                <th
                                    className={ordemNome ? styles.colunaAtiva : ""}
                                    onClick={() =>
                                        setOrdemNome((prev) => {
                                            if (prev === null) return "az";
                                            if (prev === "az") return "za";
                                            return null;
                                        })
                                    }
                                >
                                    Nome {ordemNome === "az" ? "↑" : ordemNome === "za" ? "↓" : ""}
                                </th>
                                <th className={styles.textCenter}>Email</th>
                                <th className={styles.textCenter}>Setor</th>
                                <th className={styles.textCenter}>Cargo</th>
                                <th className={styles.textCenter}>Status</th>
                                <th
                                    className={`${styles.textCenter} ${ordemData ? styles.colunaAtiva : ""}`}
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
                                        ? "↓"
                                        : ordemData === "antigo"
                                            ? "↑"
                                            : ""}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {lista.map((f) => (
                                <tr
                                    key={f.id}
                                    onClick={(e) => {
                                        if (e.target.tagName === "BUTTON") return;
                                        setSelected(f);
                                    }}
                                >
                                    <td>{f.nome}</td>
                                    <td className={styles.textCenter}>{f.email}</td>
                                    <td className={styles.textCenter}>{f.setor}</td>
                                    <td className={styles.textCenter}>{f.cargo}</td>
                                    <td className={styles.textCenter}>
                                        <span
                                            className={`${styles.badge} ${styles[f.ativo ? "statusConcluida" : "statusCancelada"]
                                                }`}
                                        >
                                            {f.ativo ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className={styles.textCenter}>{f.dataCriacao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ===== MOBILE (CARDS) ===== */}
                <div className={styles.mobileOnly}>
                    {lista.map((f) => (
                        <div
                            key={f.id}
                            className={styles.card}
                            onClick={() => setSelected(f)}
                        >
                            <div className={styles.cardHeader}>
                                <h2>{f.nome}</h2>
                                <span
                                    className={`${styles.badge} ${styles[f.ativo ? "statusConcluida" : "statusCancelada"]
                                        }`}
                                >
                                    {f.ativo ? "Ativo" : "Inativo"}
                                </span>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.modalGrid}>
                                    <div>
                                        <strong>Email</strong>
                                        <p>{f.email}</p>
                                    </div>

                                    <div>
                                        <strong>Setor</strong>
                                        <p>{f.setor}</p>
                                    </div>

                                    <div>
                                        <strong>Cargo</strong>
                                        <p>{f.cargo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MODAL */}
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
                                    onClick={() => {
                                        setEdit(selected);
                                        setSelected(null);
                                    }}
                                >
                                    Editar
                                </button>

                                <button
                                    className={styles.btnDanger}
                                    onClick={() => excluir(selected.id)}
                                >
                                    Excluir
                                </button>
                            </>
                        }
                    >

                        <div    className={styles.modalGrid}>
                            <p><strong>Email:</strong> {selected.email}</p>
                            <p><strong>Setor:</strong> {selected.setor}</p>
                            <p><strong>Cargo:</strong> {selected.cargo}</p>
                        </div>
                    </Modal>
                )}

                {/* MODAL CRIAR */}
                {createModal && (
                    <Modal
                        title="Novo Funcionário"
                        onClose={() => setCreateModal(false)}
                        variant="between"
                        actions={
                            <>
                                <button
                                    className={styles.btnDanger}
                                    onClick={() => setCreateModal(false)}
                                >
                                    Fechar
                                </button>

                                <button
                                    className={styles.btnSecondary}
                                    onClick={() =>
                                        setNovoFuncionario({
                                            nome: "",
                                            email: "",
                                            setor: "",
                                            cargo: "",
                                            ativo: true,
                                        })
                                    }
                                >
                                    Limpar
                                </button>

                                <button
                                    className={styles.btnPrimary}
                                    onClick={criarFuncionario}
                                >
                                    Criar
                                </button>
                            </>
                        }
                    >
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nome</label>
                                <input
                                    value={novoFuncionario.nome}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    value={novoFuncionario.email}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Setor</label>
                                <select
                                    value={novoFuncionario.setor}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, setor: e.target.value })
                                    }
                                >
                                    <option value="">Selecione</option>
                                    {setores.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Cargo</label>
                                <input
                                    value={novoFuncionario.cargo}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, cargo: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    value={novoFuncionario.ativo}
                                    onChange={(e) =>
                                        setNovoFuncionario({
                                            ...novoFuncionario,
                                            ativo: e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value={true}>Ativo</option>
                                    <option value={false}>Inativo</option>
                                </select>
                            </div>
                        </div>
                    </Modal>
                )}

                {edit && (
                    <Modal
                        title="Editar Funcionário"
                        onClose={() => setEdit(null)}
                        variant="between"
                        actions={
                            <>
                                <button
                                    className={styles.btnSecondary}
                                    onClick={() => setEdit(null)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    className={styles.btnPrimary}
                                    onClick={salvarEdicao}
                                >
                                    Salvar
                                </button>
                            </>
                        }
                    >
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Nome</label>
                                <input
                                    value={edit.nome}
                                    onChange={(e) =>
                                        setEdit({ ...edit, nome: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    value={edit.email}
                                    onChange={(e) =>
                                        setEdit({ ...edit, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Setor</label>
                                <select
                                    value={edit.setor}
                                    onChange={(e) =>
                                        setEdit({ ...edit, setor: e.target.value })
                                    }
                                >
                                    {setores.map((s) => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Cargo</label>
                                <input
                                    value={edit.cargo}
                                    onChange={(e) =>
                                        setEdit({ ...edit, cargo: e.target.value })
                                    }
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    value={edit.ativo}
                                    onChange={(e) =>
                                        setEdit({
                                            ...edit,
                                            ativo: e.target.value === "true",
                                        })
                                    }
                                >
                                    <option value={true}>Ativo</option>
                                    <option value={false}>Inativo</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Data de Criação</label>
                                <input
                                    value={edit.dataCriacao}
                                    disabled
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
            </div>
        </div >
    );
}

export default Funcionarios;
