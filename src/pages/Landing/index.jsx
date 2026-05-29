import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import LandingHeader from "../../components/LandingHeader";
import styles from "./style.module.css";
import PageTransition from "../../components/ui/PageTransition/index.jsx";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className={styles.container}>
        <LandingHeader />

        <main className={styles.main}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>
                Organize sua equipe com inteligência
              </h1>
              <p className={styles.subtitle}>
                Gestão de tarefas, equipes e relatórios em uma única plataforma
                moderna e intuitiva.
              </p>
              <div className={styles.ctaButtons}>
                <Button variant="primary" onClick={() => navigate("/login")}>
                  Começar Agora
                </Button>
                <Button variant="secondary">Saiba Mais</Button>
              </div>
            </div>

            <div className={styles.heroIllustration}>
              <div className={styles.dashboardPreview}>
                <div className={styles.previewHeader}>
                  <div className={styles.previewDot}></div>
                  <div className={styles.previewDot}></div>
                  <div className={styles.previewDot}></div>
                </div>
                <div className={styles.previewContent}>
                  <div className={styles.previewBar}></div>
                  <div className={styles.previewBar}></div>
                  <div className={styles.previewBar}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className={styles.benefits}>
            <div className={styles.benefitCard}>
              <h3>📋 Gestão de Equipes</h3>
              <p>Organize, atribua e acompanhe atividades com clareza total.</p>
            </div>
            <div className={styles.benefitCard}>
              <h3>✓ Controle de Tarefas</h3>
              <p>Prioridades claras e progresso em tempo real.</p>
            </div>
            <div className={styles.benefitCard}>
              <h3>📊 Relatórios</h3>
              <p>Extraia insights e tome decisões baseadas em dados.</p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>
            © {new Date().getFullYear()} Gestoon. Todos os direitos reservados.
          </p>
          <div className={styles.footerLinks}>
            <a href="#privacy">Privacidade</a>
            <a href="#terms">Termos</a>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
