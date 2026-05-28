import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import LandingHeader from "../../components/LandingHeader";
import styles from "./style.module.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <LandingHeader />
      <header id="inicio" className={styles.hero}>
        <div className={styles.heroCard}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Gestão e colaboração</span>
            <h1 className={styles.title}>
              Há uma maneira melhor de organizar o trabalho da sua equipe.
            </h1>
            <p className={styles.subtitle}>
              O Gestoon une controle de tarefas, gestão de equipes e relatórios
              em uma única plataforma com interface moderna e intuitiva.
            </p>
            {/* <div className={styles.ctaRow}>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Fazer Login
              </Button>
            </div> */}
          </div>

          <div className={styles.heroIllustration}>
            <div className={styles.illustrationBlock} />
            <div className={styles.illustrationInfo}>
              <div className={styles.infoCard}>
                <strong>12x</strong>
                <span>mais agilidade</span>
              </div>
              <div className={styles.infoCardAlt}>
                <strong>Relatórios</strong>
                <span>PDF e acompanhamento em tempo real</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section id="sobre" className={styles.about}>
          <h2>Sobre nós</h2>
          <p>
            O Gestoon foi criado para quem precisa entregar tarefas com clareza,
            visibilidade e menos retrabalho. Administre atividades, acompanhe
            resultados e mantenha sua equipe alinhada.
          </p>
        </section>

        <section id="funcionalidades" className={styles.features}>
          <h2>Funcionalidades</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <h3>Controle de Tarefas</h3>
              <p>Organize, atribua e acompanhe o progresso das atividades.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Relatórios</h3>
              <p>Extraia relatórios PDF para análises e auditorias rápidas.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Perfis e Permissões</h3>
              <p>Administre acessos e funcionalidades por perfil de usuário.</p>
            </div>
          </div>
        </section>

        <section id="beneficios" className={styles.benefits}>
          <h2>Benefícios</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.featureCard}>
              <h3>Velocidade de operação</h3>
              <p>Reduza o tempo gasto com a gestão manual de tarefas.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Visão clara</h3>
              <p>Monitore status, prioridades e responsáveis em um só lugar.</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Integração simples</h3>
              <p>
                Use dados em tempo real para decisões mais rápidas e seguras.
              </p>
            </div>
          </div>
        </section>

        <section id="contato" className={styles.contact}>
          <h2>Contato</h2>
          <p>
            Fale conosco para saber como o Gestoon pode transformar a rotina da
            sua equipe.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} Gestoon. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
