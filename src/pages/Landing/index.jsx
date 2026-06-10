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
          <section id="inicio" className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>
                Gestoon — Gerenciamento de tarefas para equipes
              </h1>
              <p className={styles.subtitle}>
                Plataforma para planejar, atribuir e acompanhar tarefas em
                equipes, com visibilidade de progresso e relatórios práticos.
              </p>
              <p className={styles.academicNote}>
                Projeto de TCC: apresentação de um sistema de gerenciamento de
                tarefas desenvolvido para otimizar colaboração em equipes.
              </p>

              <ul className={styles.featureList}>
                <li>Controle de tarefas e fluxos de trabalho</li>
                <li>Gestão de equipes e atribuição de responsabilidades</li>
                <li>Relatórios e métricas para tomada de decisão</li>
              </ul>
              <div className={styles.ctaButtons}>
                <Button variant="primary" onClick={() => navigate("/login") }>
                  Começar agora
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    document.getElementById("demo")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                >
                  Ver demonstração
                </Button>
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
                  <img
                    src="/mockup.png"
                    alt="Mockup do Gestoon — captura de tela"
                    className={styles.mockupImage}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Demo Section (larger preview) */}
          <section id="demo" className={styles.demoSection}>
            <div className={styles.dashboardPreviewLarge}>
              <img src="/mockup.png" alt="Demo Gestoon" className={styles.mockupLarge} />
            </div>
          </section>

          {/* Benefits Section */}
          <section id="beneficios" className={styles.benefits}>
            <div className={styles.benefitCard}>
              <h3>Aumente a produtividade</h3>
              <p>Acelere entregas com fluxos claros e visibilidade de tarefas.</p>
            </div>
            <div className={styles.benefitCard}>
              <h3>Acompanhe em tempo real</h3>
              <p>Atualizações imediatas sobre status e progresso das atividades.</p>
            </div>
            <div className={styles.benefitCard}>
              <h3>Centralize tudo</h3>
              <p>Documentos, tarefas e comunicações em um único painel.</p>
            </div>
          </section>

          {/* Features Cards */}
          <section id="funcionalidades" className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📋</div>
              <h4>Quadros</h4>
              <p>Visualize projetos em quadros organizados por status.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚙️</div>
              <h4>Automação</h4>
              <p>Regras simples para automatizar atribuições e notificações.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔍</div>
              <h4>Relatórios</h4>
              <p>Métricas acionáveis para tomadas de decisão rápidas.</p>
            </div>
          </section>

          {/* How it works */}
          <section className={styles.howItWorks}>
            <h3>Como funciona</h3>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNum}>1</div>
                <p>Criar sua conta</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>2</div>
                <p>Cadastre tarefas</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNum}>3</div>
                <p>Acompanhe o progresso</p>
              </div>
            </div>
          </section>

          {/* Proof of value */}
          <section className={styles.valueProof}>
            <h3>Recursos principais</h3>
            <ul>
              <li>Controle de tarefas e prazos</li>
              <li>Gestão de equipes e permissões</li>
              <li>Relatórios exportáveis e filtros avançados</li>
              <li>Integração com stacks comuns (Node.js, MySQL)</li>
            </ul>
          </section>

          {/* About Section */}
          <section id="sobre" className={styles.about}>
            <div className={styles.benefitCard}>
              <h3>Sobre o sistema</h3>
              <p>
                O Gestoon é um sistema pensado para facilitar a gestão de
                projetos e tarefas em ambientes acadêmicos e profissionais. No
                contexto do TCC, demonstra padrões de organização, rastreio de
                entregas e geração de relatórios.
              </p>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Gestoon. Todos os direitos reservados.</p>
          <div className={styles.footerLinks}>
            <span>
              Tecnologias: HTML, CSS, JavaScript, Node.js, MySQL
            </span>
            <a href="#privacy">Privacidade</a>
            <a href="#terms">Termos</a>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
