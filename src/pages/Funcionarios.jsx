import { useState, useMemo } from "react";
import "../styles/home.css";
import jsPDF from "jspdf";
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

    const setores = [
        "Administrativo",
        "Financeiro",
        "Operacional",
        "Atendimento",
        "Limpeza",
        "Estoque",
        "Logística"
    ];

    // ===== FILTRO =====
    const lista = useMemo(() => {
        let lista = [...listaState];

        if (busca) {
            lista = lista.filter((f) =>
                f.nome.toLowerCase().includes(busca.toLowerCase())
            );
        }

        if (setorFiltro) {
            lista = lista.filter((f) => f.setor === setorFiltro);
        }

        if (ativoFiltro !== "") {
            lista = lista.filter((f) =>
                ativoFiltro === "true" ? f.ativo : !f.ativo
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

    function excluir(id) {
        if (!confirm("Excluir funcionário?")) return;
        setListaState(listaState.filter((f) => f.id !== id));
        setSelected(null);
    }

    function salvarEdicao() {
        setListaState((prev) =>
            prev.map((f) => (f.id === edit.id ? edit : f))
        );

        setEdit(null);
    }

    return (
        <div className="dashboard">
            <h1>Funcionários</h1>

            {/* BUSCA */}
            <div className="top-actions">
                <input
                    className="busca"
                    placeholder="Buscar funcionário..."
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            {/* FILTROS */}
            <div className="filtros-avancados">
                <div>
                    <small>Setor:</small>
                    <select onChange={(e) => setSetorFiltro(e.target.value)}>
                        <option value="">Todos</option>
                        {setores.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <small>Status:</small>
                    <select onChange={(e) => setAtivoFiltro(e.target.value)}>
                        <option value="">Todos</option>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>
            </div>

            <button className="cadastrar-btn" onClick={() => setCreateModal(true)}>
                Cadastrar +
            </button>

            {/* TABELA */}
            <div className="tabela-container">
                <table className="tabela">
                    <thead>
                        <tr>
                            <th
                                onClick={() =>
                                    setOrdemNome((prev) =>
                                        prev === "az" ? "za" : prev === "za" ? null : "az"
                                    )
                                }
                            >
                                Nome {ordemNome === "az" ? "↑" : ordemNome === "za" ? "↓" : ""}
                            </th>
                            <th>Email</th>
                            <th>Setor</th>
                            <th>Cargo</th>
                            <th>Status</th>
                            <th
                                onClick={() =>
                                    setOrdemData((prev) =>
                                        prev === "recente"
                                            ? "antigo"
                                            : prev === "antigo"
                                                ? null
                                                : "recente"
                                    )
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
                            <tr key={f.id} onClick={() => setSelected(f)}>
                                <td>{f.nome}</td>
                                <td>{f.email}</td>
                                <td>{f.setor}</td>
                                <td>{f.cargo}</td>
                                <td>
                                    <span
                                        className={`badge ${f.ativo ? "status-concluida" : "status-cancelada"
                                            }`}
                                    >
                                        {f.ativo ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td>{f.dataCriacao}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {selected && (
                <>
                    <div className="overlay" onClick={() => setSelected(null)} />

                    <div className="task-modal">
                        <h2>{selected.nome}</h2>
                        <p><strong>Email:</strong> {selected.email}</p>
                        <p><strong>Setor:</strong> {selected.setor}</p>
                        <p><strong>Cargo:</strong> {selected.cargo}</p>

                        <div className="modal-actions">
                            <button
                                className="btn-close"
                                onClick={() => setSelected(null)}
                            >
                                Fechar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setSelected(null);
                                    setEdit({ ...selected });
                                }}
                            >
                                Editar
                            </button>

                            <button
                                className="btn-danger"
                                onClick={() => excluir(selected.id)}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL CRIAR */}
            {createModal && (
                <>
                    <div className="overlay" onClick={() => setCreateModal(false)} />

                    <div className="task-modal">
                        <h2>Novo Funcionário</h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={novoFuncionario.nome}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, nome: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={novoFuncionario.email}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-group">
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

                            <div className="form-group">
                                <label>Cargo</label>
                                <input
                                    type="text"
                                    value={novoFuncionario.cargo}
                                    onChange={(e) =>
                                        setNovoFuncionario({ ...novoFuncionario, cargo: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-group">
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

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setCreateModal(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={criarFuncionario}
                                disabled={!novoFuncionario.nome || !novoFuncionario.email}
                            >
                                Criar
                            </button>
                        </div>
                    </div>
                </>
            )}

            {edit && (
                <>
                    <div className="overlay" onClick={() => setEdit(null)} />

                    <div className="task-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Editar Funcionário</h2>

                        <div className="form-grid">
                            {/* NOME */}
                            <div className="form-group">
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={edit.nome}
                                    onChange={(e) =>
                                        setEdit({ ...edit, nome: e.target.value })
                                    }
                                />
                            </div>

                            {/* EMAIL */}
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={edit.email}
                                    onChange={(e) =>
                                        setEdit({ ...edit, email: e.target.value })
                                    }
                                />
                            </div>

                            {/* SETOR */}
                            <div className="form-group">
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

                            {/* CARGO */}
                            <div className="form-group">
                                <label>Cargo</label>
                                <input
                                    type="text"
                                    value={edit.cargo}
                                    onChange={(e) =>
                                        setEdit({ ...edit, cargo: e.target.value })
                                    }
                                />
                            </div>

                            {/* STATUS */}
                            <div className="form-group">
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

                            {/* DATA (bloqueado) */}
                            <div className="form-group">
                                <label>Data de criação</label>
                                <input type="text" value={edit.dataCriacao} disabled />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setEdit(null)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-primary"
                                onClick={salvarEdicao}
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div className="footer-actions">
                <button className="export-btn" onClick={exportarPDF}>
                    Exportar PDF
                </button>
            </div>
        </div>
    );
}

export default Funcionarios;