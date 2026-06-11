import LandingHeader from "../../components/LandingHeader";
import styles from "./style.module.css";

const team = [
  {
    name: "Desenvolvedor 1",
    role: "Estudante de desenvolvimento web",
    tech: "HTML, CSS, JavaScript, React, Node.js, MySQL",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:dev1@example.com",
  },
  {
    name: "Desenvolvedor 2",
    role: "Estudante de desenvolvimento web",
    tech: "HTML, CSS, JavaScript, React, Node.js, MySQL",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:dev2@example.com",
  },
  {
    name: "Desenvolvedor 2",
    role: "Estudante de desenvolvimento web",
    tech: "HTML, CSS, JavaScript, React, Node.js, MySQL",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:dev2@example.com",
  },
  {
    name: "Desenvolvedor 2",
    role: "Estudante de desenvolvimento web",
    tech: "HTML, CSS, JavaScript, React, Node.js, MySQL",
    github: "https://github.com/",
    linkedin: "https://www.linkedin.com/",
    email: "mailto:dev2@example.com",
  },
];

export default function LandingEquipe() {
  return (
    <div className={styles.page}>
      <LandingHeader />

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Nossa Equipe</h1>
          <p className={styles.description}>
            Este sistema foi desenvolvido como Trabalho de Conclusão de Curso
            (TCC).
          </p>
        </section>

        <section className={styles.grid}>
          {team.map((m, i) => (
            <article key={i} className={styles.card}>
              <div className={styles.avatar} aria-hidden>
                {m.name.split(" ")[0][0]}
              </div>
              <h3 className={styles.name}>{m.name}</h3>
              <p className={styles.role}>{m.role}</p>
              <p className={styles.tech}>{m.tech}</p>

              <div className={styles.links}>
                <a
                  className={styles.linkBtn}
                  href={m.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <a
                  className={styles.linkBtn}
                  href={m.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
                <a className={styles.linkText} href={m.email}>
                  Email
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
