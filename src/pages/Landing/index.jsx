import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import LandingHeader from "../../components/LandingHeader";
import styles from "./style.module.css";
import PageTransition from "../../components/ui/PageTransition/index.jsx";
// Use runtime-resolved URLs for images (works reliably with Vite)

export default function Landing() {
  const navigate = useNavigate();
  const images = [
    new URL("../../images/dashboard-gerente.png", import.meta.url).href,
    new URL("../../images/minhas-tarefas.png", import.meta.url).href,
    new URL("../../images/relatorio-funcionarios.png", import.meta.url).href,
    new URL("../../images/tela-funcionarios.png", import.meta.url).href,
  ];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

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
                    src={images[current]}
                    alt={`Preview ${current + 1}`}
                    className={styles.mockupImage}
                    onError={(e) => { e.currentTarget.src = "/mockup.png"; }}
                  />
                </div>
              </div>
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
              Tecnologias: HTML, CSS, JavaScript, React, Node.js, MySQL.
            </span>
            <a href="#privacy">Privacidade</a>
            <a href="#terms">Termos</a>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
