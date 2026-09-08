'use client';

import Link from 'next/link';
import Image from 'next/image';
import localFont from 'next/font/local';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Moon,
  Sun,
  Menu,
  X,
  Mail,
  SlidersHorizontal,
  FileCheck2,
  ChartNoAxesCombined,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/layout/providers';
import { faqs, contactEmail } from './landing-content';
import styles from './landing.module.css';

const poppins = localFont({
  src: [
    {
      path: '../../../public/fonts/poppins/Poppins-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/poppins/Poppins-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/poppins/Poppins-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-poppins',
});
const links = [
  { href: '#por-que', label: 'Por que existimos' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#recursos', label: 'Recursos' },
  { href: '#contato', label: 'Contato' },
];
const workflow = [
  {
    icon: SlidersHorizontal,
    title: 'Monte a sessão.',
    text: 'Escolha sua trilha, os assuntos, a dificuldade, o ano e a quantidade de questões.',
  },
  {
    icon: FileCheck2,
    title: 'Resolva e confira.',
    text: 'Responda no navegador. A correção é automática, com explicações na hora ou ao final da sessão.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Saiba o que revisar.',
    text: 'Consulte acertos, tempo e histórico por assunto. Use os resultados para escolher sua próxima prática.',
  },
];
function Brand() {
  return (
    <span className={styles.wordmark}>
      Brasil<strong>prep</strong>
      <span className={styles.brandDot}>.</span>
    </span>
  );
}
export function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const root = pageRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const elements = [...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    const clear = () =>
      elements.forEach((element) => {
        element.dataset.reveal = 'visible';
      });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = 'visible';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    if (!preference.matches)
      elements.forEach((element) => {
        if (element.getBoundingClientRect().top > window.innerHeight) {
          element.dataset.reveal = 'pending';
          observer.observe(element);
        }
      });
    const onPreference = () => {
      if (preference.matches) {
        clear();
        observer.disconnect();
      }
    };
    preference.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      clear();
    };
  }, []);
  return (
    <div className={`${styles.landing} ${poppins.variable}`} ref={pageRef}>
      <a className="skip-link" href="#landing-content">
        Pular para o conteúdo
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="BrasilPrep, página inicial">
            <Brand />
          </Link>
          <nav className={styles.desktopNav} aria-label="Navegação da página">
            {links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <div className={styles.accountLinks}>
              <Link href="/cadastro" className={styles.createLink}>
                Criar conta
              </Link>
              <Link href="/entrar">
                Entrar <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
            <button
              className={styles.iconButton}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={
                theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'
              }
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              ref={menuRef}
              className={`${styles.iconButton} ${styles.menuButton}`}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="landing-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="landing-navigation"
            className={styles.mobileNav}
            aria-label="Navegação móvel"
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setMenuOpen(false);
                menuRef.current?.focus();
              }
            }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link href="/cadastro">Criar conta</Link>
            <Link href="/entrar">Entrar na conta</Link>
          </nav>
        )}
      </header>
      <main id="landing-content" className={styles.main} tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <a href="#em-construcao" className={styles.statusLink}>
                Em construção <ArrowUpRight size={14} aria-hidden="true" />
              </a>
              <h1 id="hero-title">
                Aprovar <strong>não</strong>
                <br />é sorte.
                <br />
                <span className={styles.highlight}>É sistema.</span>
              </h1>
              <p className={styles.heroDescription}>
                Questões, correção e análise de desempenho no mesmo lugar. Sem
                imprimir listas nem montar planilhas.
              </p>
              <div className={styles.heroActions}>
                <Link href="/cadastro" className={styles.primaryButton}>
                  Conhecer a plataforma{' '}
                  <ArrowRight size={19} aria-hidden="true" />
                </Link>
                <a href="#como-funciona" className={styles.heroSecondary}>
                  Como funciona <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <figure className={styles.heroIllustration}>
              <Image
                src="/landing/platform-illustration.png"
                alt="Ilustração de uma questão de múltipla escolha, uma lista de assuntos e painéis de desempenho."
                width={1200}
                height={1000}
                priority
              />
              <figcaption>Ilustração dos recursos da plataforma</figcaption>
            </figure>
          </div>
        </section>
        <section
          id="por-que"
          className={`${styles.container} ${styles.section} ${styles.whyGrid}`}
          aria-labelledby="why-title"
        >
          <div data-reveal>
            <p className={styles.eyebrow}>POR QUE EXISTIMOS</p>
            <h2 id="why-title">
              O estudo não acaba
              <br />
              quando você termina
              <br />
              <span>a última questão.</span>
            </h2>
          </div>
          <div className={styles.whyCopy} data-reveal>
            <p>
              Há décadas, a preparação para o vestibular exige mais do que
              estudar: baixar provas, imprimir listas, comparar respostas com o
              gabarito e anotar os resultados.
            </p>
            <p>
              O BrasilPrep reúne essas etapas em uma plataforma. Você resolve as
              questões; o sistema corrige, guarda suas respostas e organiza os
              resultados por assunto.
            </p>
            <p className={styles.whyConclusion}>
              O tempo que iria para a correção manual pode ir para a revisão do
              que você ainda não entendeu.
            </p>
          </div>
        </section>
        <section
          id="como-funciona"
          className={styles.methodSection}
          aria-labelledby="method-title"
        >
          <div className={`${styles.container} ${styles.section}`}>
            <div className={styles.sectionHeading} data-reveal>
              <p className={styles.eyebrow}>COMO FUNCIONA</p>
              <h2 id="method-title">
                Da lista de questões
                <br />à revisão. Sem sair daqui.
              </h2>
            </div>
            <div className={styles.workflow}>
              {workflow.map(({ icon: Icon, title, text }, index) => (
                <article key={title} data-reveal>
                  <div className={styles.workflowTop}>
                    <Icon size={28} strokeWidth={1.3} aria-hidden="true" />
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className={styles.modeStrip} data-reveal>
              <div>
                <span>Estudo</span>
                <p>Correção e explicação após cada resposta.</p>
              </div>
              <div>
                <span>Teste</span>
                <p>Gabarito e resultado depois de finalizar.</p>
              </div>
              <div>
                <span>Sessões salvas</span>
                <p>Retome de onde parou, pela sua conta.</p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="recursos"
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="features-title"
        >
          <div className={styles.featureHeading} data-reveal>
            <div>
              <p className={styles.eyebrow}>RECURSOS</p>
              <h2 id="features-title">
                Uma infraestrutura digital
                <br />
                para o vestibulando.
              </h2>
            </div>
            <p>
              Organização por vestibular, questões classificadas e um histórico
              que acompanha sua preparação.
            </p>
          </div>
          <div className={styles.featureGrid}>
            <article className={styles.taxonomyFeature} data-reveal>
              <div className={styles.featureText}>
                <span className={styles.featureIndex}>01</span>
                <h3>Da matéria ao subtema.</h3>
                <p>
                  Filtre o que quer praticar e localize os erros com o mesmo
                  nível de detalhe.
                </p>
              </div>
              <div
                className={styles.taxonomy}
                aria-label="Exemplo de classificação: Matemática, Geometria plana, Áreas"
              >
                <span>Matemática</span>
                <span>Geometria plana</span>
                <span>Áreas</span>
              </div>
              <p className={styles.featureMeta}>
                3 níveis: disciplina, assunto e subassunto.
              </p>
            </article>
            <article className={styles.analyticsFeature} data-reveal>
              <div className={styles.featureText}>
                <span className={styles.featureIndex}>02</span>
                <h3>Desempenho por assunto.</h3>
                <p>
                  Acertos e tempo de resolução, com tamanho da amostra e
                  histórico.
                </p>
              </div>
              <figure className={styles.miniReport}>
                <figcaption>Exemplo ilustrativo · dados fictícios</figcaption>
                <div>
                  <span>Matemática</span>
                  <span>12/20</span>
                  <strong>60%</strong>
                  <div className={styles.bar}>
                    <span style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <span>Física</span>
                  <span>6/15</span>
                  <strong>40%</strong>
                  <div className={styles.bar}>
                    <span style={{ width: '40%' }} />
                  </div>
                </div>
              </figure>
              <p className={styles.featureMeta}>
                Acerto na prática não equivale à nota oficial.
              </p>
            </article>
            <article className={styles.examFeature} data-reveal>
              <div className={styles.featureText}>
                <span className={styles.featureIndex}>03</span>
                <h3>Mais de um vestibular.</h3>
                <p>
                  Crie uma trilha por exame e alterne entre seus objetivos de
                  instituição e curso.
                </p>
              </div>
              <div className={styles.examNames}>
                <span>FUVEST</span>
                <span>UNICAMP</span>
                <span>UNESP</span>
                <span>FGV</span>
                <span>Insper</span>
                <span>ITA</span>
                <span>IME</span>
                <span>ENEM</span>
              </div>
              <p className={styles.featureMeta}>
                Opções no catálogo de desenvolvimento. A cobertura de questões
                ainda está em preparação.
              </p>
            </article>
            <article className={styles.bankFeature} data-reveal>
              <div className={styles.featureText}>
                <span className={styles.featureIndex}>04</span>
                <h3>Um acervo organizado.</h3>
                <p>
                  Questões com ano, fase, dificuldade, fonte e explicação.
                  Bancas, matérias e subtemas em uma estrutura comum.
                </p>
              </div>
              <dl className={styles.coverage}>
                <div>
                  <dt>Bancas e provas</dt>
                  <dd>Em catalogação</dd>
                </div>
                <div>
                  <dt>Questões oficiais</dt>
                  <dd>Acervo em preparação</dd>
                </div>
                <div>
                  <dt>Matérias e subtemas</dt>
                  <dd>Classificação em curso</dd>
                </div>
              </dl>
              <p className={styles.featureMeta}>
                Os totais serão divulgados após a revisão do acervo.
              </p>
            </article>
          </div>
        </section>
        <section
          id="em-construcao"
          className={styles.buildSection}
          aria-labelledby="build-title"
        >
          <div
            className={`${styles.container} ${styles.buildGrid}`}
            data-reveal
          >
            <div>
              <p className={styles.eyebrow}>ESTADO DO PROJETO</p>
              <h2 id="build-title">
                Estamos construindo
                <br />o BrasilPrep.
              </h2>
            </div>
            <div>
              <p>
                Cadastro, trilhas, prática e análise de desempenho já fazem
                parte da plataforma. O acervo está em preparação e os exercícios
                de desenvolvimento são identificados como sintéticos.
              </p>
              <p>
                Você pode explorar o sistema durante esta etapa. Ainda não
                oferecemos um banco completo de provas oficiais.
              </p>
              <Link href="/cadastro" className={styles.primaryButton}>
                Explorar a versão atual{' '}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
        <section
          id="duvidas"
          className={`${styles.container} ${styles.section} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div data-reveal>
            <h2 id="faq-title">
              Dúvidas
              <br />
              frequentes.
            </h2>
          </div>
          <div className={styles.faqList}>
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true" className={styles.faqPlus}>
                    +
                  </span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section
          id="contato"
          className={styles.contactSection}
          aria-labelledby="contact-title"
        >
          <div
            className={`${styles.container} ${styles.contactGrid}`}
            data-reveal
          >
            <div>
              <p className={styles.eyebrow}>CONTATO</p>
              <h2 id="contact-title">Converse com a gente.</h2>
              <p>
                Sugestões, dúvidas sobre a plataforma ou interesse em contribuir
                com o acervo.
              </p>
            </div>
            <div className={styles.contactAction}>
              {contactEmail ? (
                <a
                  href={`mailto:${contactEmail}`}
                  className={styles.contactLink}
                >
                  <Mail size={22} aria-hidden="true" />
                  {contactEmail}
                  <ArrowUpRight size={21} aria-hidden="true" />
                </a>
              ) : (
                <p className={styles.contactPending}>
                  Nosso canal de contato será divulgado aqui.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <Link href="/" aria-label="BrasilPrep, início">
            <Brand />
          </Link>
          <nav aria-label="Links do rodapé">
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#duvidas">Dúvidas frequentes</a>
            <a href="#contato">Contato</a>
            <Link href="/entrar">Entrar</Link>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>BrasilPrep · Em desenvolvimento</span>
          <span>Sem vínculo com instituições ou bancas examinadoras.</span>
        </div>
      </footer>
    </div>
  );
}
