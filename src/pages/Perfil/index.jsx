import { useState } from "react";
import styles from "./style.module.css";

export default function Perfil() {
  const [foto, setFoto] = useState(null);

  // 🔹 Dados fictícios (simulando API)
  const usuario = {
    nome: "João Silva",
    setor: "Financeiro",
    cargo: "Gerente",
    email: "joao.silva@email.com"
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(URL.createObjectURL(file));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Perfil do Usuário</h1>

        <div className={styles.content}>
          
          {/* FOTO */}
          <div className={styles.fotoSection}>
            {foto ? (
              <img src={foto} alt="Foto" className={styles.foto} />
            ) : (
              <div className={styles.fotoPlaceholder}>Sem Foto</div>
            )}

            {/* input escondido */}
            <input
              type="file"
              id="uploadFoto"
              onChange={handleFotoChange}
              style={{ display: "none" }}
            />

            {/* botão visível */}
            <button
              className={styles.btnFoto}
              onClick={() =>
                document.getElementById("uploadFoto").click()
              }
            >
              Adicionar Foto
            </button>
          </div>

          {/* INFORMAÇÕES */}
          <div className={styles.infoSection}>
            <div className={styles.infoGroup}>
              <span>Nome</span>
              <p>{usuario.nome}</p>
            </div>

            <div className={styles.infoGroup}>
              <span>Setor</span>
              <p>{usuario.setor}</p>
            </div>

            <div className={styles.infoGroup}>
              <span>Cargo</span>
              <p>{usuario.cargo}</p>
            </div>

            <div className={styles.infoGroup}>
              <span>Email</span>
              <p>{usuario.email}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}