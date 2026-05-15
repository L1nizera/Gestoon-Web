import { useEffect, useState } from "react";
import styles from "./style.module.css";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function Perfil() {
  const [profile, setProfile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { logout, updateUser } = useAuth();

  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get("/usuario/me");
        setProfile(response.data.dados);
      } catch (err) {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          logout();
          window.location.href = "/";
          return;
        }

        setError(
          err.response?.data?.mensagem ||
            "Não foi possível carregar os dados do perfil.",
        );
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [logout]);

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("A imagem deve ter no máximo 5 MB.");
      return;
    }

    setUploadError(null);
    setFotoPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const response = await api.post("/usuario/foto", formData);
      const avatar = response.data.dados.avatar;

      setProfile((prev) => ({ ...prev, avatar }));
      updateUser?.({ avatar });
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        logout();
        window.location.href = "/";
        return;
      }

      setUploadError(
        err.response?.data?.mensagem ||
          "Não foi possível enviar a foto. Tente novamente.",
      );
    } finally {
      setUploading(false);
    }
  };

  const usuario = profile || {
    nome: "",
    setor: "",
    cargo: "",
    email: "",
    telefone: "",
    avatar: null,
  };

  const avatarUrl = fotoPreview || usuario.avatar || "";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Perfil do Usuário</h1>

        {loading ? (
          <div className={styles.loading}>Carregando dados do perfil...</div>
        ) : error ? (
          <div className={styles.error}>Erro: {error}</div>
        ) : (
          <div className={styles.content}>
            <div className={styles.fotoSection}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto" className={styles.foto} />
              ) : (
                <div className={styles.fotoPlaceholder}>Sem Foto</div>
              )}

              <input
                type="file"
                id="uploadFoto"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFotoChange}
                style={{ display: "none" }}
              />

              <button
                className={styles.btnFoto}
                onClick={() => document.getElementById("uploadFoto").click()}
                disabled={uploading}
              >
                {uploading ? "Enviando..." : "Alterar Foto"}
              </button>

              {uploadError ? (
                <div className={styles.uploadError}>{uploadError}</div>
              ) : null}
            </div>

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
              {usuario.telefone ? (
                <div className={styles.infoGroup}>
                  <span>Telefone</span>
                  <p>{usuario.telefone}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
