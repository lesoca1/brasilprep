'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/components/layout/providers';
import styles from './landing.module.css';

const links = [
  { href: '#por-que', label: 'Por que BrasilPrep' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#duvidas', label: 'Dúvidas frequentes' },
];
const steps = [
  {
    number: '01',
    title: 'Defina seu destino.',
    text: 'Escolha o vestibular e o curso que você quer alcançar. Sua trilha reúne esse objetivo e organiza o seu estudo.',
  },
  {
    number: '02',
    title: 'Pratique com intenção.',
    text: 'Filtre por disciplina, assunto, dificuldade e ano. Estude com correção imediata ou teste seus conhecimentos com o resultado ao final.',
  },
  {
    number: '03',
    title: 'Entenda seu resultado.',
    text: 'Revise respostas e explicações. Veja acertos, questões em branco e tempo por questão, sempre com o tamanho da amostra.',
  },
  {
    number: '04',
    title: 'Ajuste o próximo passo.',
    text: 'Consulte o histórico por assunto, identifique onde errou e escolha o que revisar na próxima sessão.',
  },
];
const faqs = [
  {
    question: 'O que é o BrasilPrep?',
    answer:
      'É uma plataforma para organizar sua preparação para vestibulares, resolver questões e acompanhar seu desempenho. Ela reúne objetivos, prática e histórico em um só lugar.',
  },
  {
    question: 'O BrasilPrep substitui o cursinho ou as aulas?',
    answer:
      'Não. Ele complementa seus materiais e suas aulas. A proposta é ajudar você a praticar o conteúdo e entender os resultados desse estudo.',
  },
  {
    question: 'O que é uma trilha? Posso ter mais de uma?',
    answer:
      'Uma trilha conecta um vestibular ao seu objetivo de instituição e curso. Você pode manter uma trilha por vestibular, alternar entre elas e editar ou remover seus objetivos.',
  },
  {
    question: 'Quais vestibulares e questões estão disponíveis?',
    answer:
      'As opções disponíveis aparecem no cadastro e nos filtros da prática. A versão atual está em desenvolvimento e inclui conteúdo sintético identificado para testar o funcionamento. Isso não significa que já exista um acervo oficial completo para cada vestibular.',
  },
  {
    question: 'Qual é a diferença entre Estudo e Teste?',
    answer:
      'No modo Estudo, a correção e a explicação aparecem após confirmar cada resposta. No modo Teste, você recebe o feedback depois de finalizar a sessão.',
  },
  {
    question: 'Como o desempenho é calculado?',
    answer:
      'O percentual de acerto divide as respostas corretas pelo total de questões das sessões finalizadas, incluindo as que ficaram em branco. Os relatórios mostram a amostra e permitem separar modos e origem das questões. Acerto na prática não equivale à nota oficial do vestibular.',
  },
  {
    question: 'O BrasilPrep garante aprovação ou prevê minha nota?',
    answer:
      'Não. Os resultados ajudam a acompanhar a prática, mas não garantem aprovação nem estimam uma nota oficial. Uma amostra pequena também não basta para concluir que você domina um assunto.',
  },
  {
    question: 'Se eu atualizar a página, perco minha sessão?',
    answer:
      'As sessões ativas e as respostas confirmadas são salvas para você retomar. Se a conexão cair, observe o status de gravação e espere a sincronização antes de encerrar ou trocar de dispositivo.',
  },
  {
    question: 'Preciso instalar um aplicativo?',
    answer:
      'Não. O acesso acontece pelo navegador, no computador, tablet ou celular. Você precisa de conexão com a internet para entrar na conta e sincronizar sua prática.',
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
  return (
    <div className={styles.landing}>
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
              if (event.key === 'Escape') setMenuOpen(false);
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
          <div className={`${styles.container} ${styles.heroContent}`}>
            <p className={styles.heroEyebrow}>PREPARAÇÃO PARA VESTIBULARES</p>
            <h1 id="hero-title">
              Aprovar <strong>não</strong> é sorte.
              <br />
              <span className={styles.highlight}>É sistema.</span>
            </h1>
            <p className={styles.heroDescription}>
              Seu objetivo dá a direção.
              <br />
              Sua prática mostra o próximo passo.
            </p>
            <div className={styles.heroActions}>
              <Link href="/cadastro" className={styles.primaryButton}>
                Começar minha preparação{' '}
                <ArrowRight size={19} aria-hidden="true" />
              </Link>
              <a href="#como-funciona" className={styles.heroSecondary}>
                Conhecer o método
              </a>
            </div>
            <div className={styles.heroFoot}>
              <span>Objetivo claro. Prática constante. Evolução visível.</span>
              <span>BRASILPREP / SEU ESPAÇO DE ESTUDO</span>
            </div>
          </div>
        </section>

        <section
          id="por-que"
          className={`${styles.container} ${styles.section}`}
          aria-labelledby="why-title"
        >
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>01 / POR QUE BRASILPREP</p>
            <h2 id="why-title">
              Estudar é importante.
              <br />
              <span>Saber o que revisar também.</span>
            </h2>
          </div>
          <div className={styles.whyGrid}>
            <p className={styles.intro}>
              Entre aulas, listas e simulados, é fácil perder de vista o que
              você já aprendeu e o que ainda precisa de atenção. O BrasilPrep
              reúne essa informação para você tomar a próxima decisão com mais
              clareza.
            </p>
            <div className={styles.benefits}>
              <article>
                <span>01</span>
                <div>
                  <h3>Um objetivo, não uma lista sem fim.</h3>
                  <p>
                    Organize a preparação em torno do vestibular e do curso que
                    você quer alcançar.
                  </p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Seus erros têm algo a ensinar.</h3>
                  <p>
                    Revise a explicação de cada questão e acompanhe os assuntos
                    que merecem outra tentativa.
                  </p>
                </div>
              </article>
              <article>
                <span>03</span>
                <div>
                  <h3>Resultados com contexto.</h3>
                  <p>
                    Veja acertos junto do número de questões. Uma resposta certa
                    não conta a história inteira.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className={styles.methodSection}
          aria-labelledby="method-title"
        >
          <div className={`${styles.container} ${styles.section}`}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>02 / COMO FUNCIONA</p>
              <h2 id="method-title">Do objetivo à próxima revisão.</h2>
              <p className={styles.sectionDescription}>
                Um ciclo simples, que acompanha o seu estudo.
              </p>
            </div>
            <div className={styles.steps}>
              {steps.map((step) => (
                <article key={step.number}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <div className={styles.modes}>
              <div>
                <p className={styles.eyebrow}>DUAS FORMAS DE PRATICAR</p>
                <h3>
                  Aprender agora.
                  <br />
                  Ou testar antes de conferir.
                </h3>
              </div>
              <article>
                <span className={styles.modeLabel}>ESTUDO</span>
                <h4>Entenda cada resposta.</h4>
                <p>
                  Confirme a alternativa e consulte a correção na hora. Uma
                  forma de estudar com a explicação ainda próxima do raciocínio.
                </p>
              </article>
              <article>
                <span className={styles.modeLabel}>TESTE</span>
                <h4>Concentre-se na resolução.</h4>
                <p>
                  Responda no seu ritmo e revise o conjunto ao final. O gabarito
                  só aparece depois de encerrar a sessão.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className={`${styles.container} ${styles.section} ${styles.insightSection}`}
          aria-labelledby="insight-title"
        >
          <div className={styles.insightCopy}>
            <p className={styles.eyebrow}>03 / O QUE VOCÊ ACOMPANHA</p>
            <h2 id="insight-title">
              Menos impressão.
              <br />
              <span>Mais informação.</span>
            </h2>
            <p>
              O histórico transforma suas respostas em uma visão do que
              aconteceu na prática. Você escolhe o recorte e decide o que fazer
              a seguir.
            </p>
            <ul className={styles.checklist}>
              <li>
                <Check size={17} aria-hidden="true" />
                Acerto por disciplina, assunto e dificuldade
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                Questões respondidas e tempo médio
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                Histórico e desempenho recente
              </li>
              <li>
                <Check size={17} aria-hidden="true" />
                Tamanho da amostra sempre à vista
              </li>
            </ul>
            <a href="#duvidas" className={styles.textLink}>
              Entenda os indicadores <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
          <figure className={styles.report}>
            <figcaption>
              <strong>Uma sessão, em perspectiva.</strong>
              <span>Exemplo ilustrativo · dados fictícios</span>
            </figcaption>
            <div className={styles.reportContext}>
              <span>FUVEST / MODO TESTE</span>
              <span>Questões sintéticas</span>
            </div>
            <div className={styles.reportMetrics}>
              <div>
                <span>Acerto na sessão</span>
                <strong>
                  51,4<span>%</span>
                </strong>
                <p>18 corretas de 35 questões</p>
              </div>
              <div>
                <span>Questões respondidas</span>
                <strong>
                  35<span>/35</span>
                </strong>
                <p>0 questões em branco</p>
              </div>
            </div>
            <div className={styles.reportRows}>
              <div>
                <span>Matemática</span>
                <span>12 / 20</span>
                <strong>60%</strong>
                <div className={styles.bar}>
                  <span style={{ width: '60%' }} />
                </div>
              </div>
              <div>
                <span>Física</span>
                <span>6 / 15</span>
                <strong>40%</strong>
                <div className={styles.bar}>
                  <span style={{ width: '40%' }} />
                </div>
              </div>
            </div>
            <p className={styles.sampleNote}>
              15 questões de Física ainda são uma amostra pequena. Use o
              resultado como ponto de partida para revisar.
            </p>
            <p className={styles.reportNote}>
              Percentual de acerto não é nota oficial do vestibular.
            </p>
          </figure>
        </section>

        <section
          id="onde-estudar"
          className={styles.accessSection}
          aria-labelledby="access-title"
        >
          <div className={`${styles.container} ${styles.accessGrid}`}>
            <div>
              <p className={styles.eyebrow}>04 / ONDE ESTUDAR</p>
              <h2 id="access-title">
                Seu estudo.
                <br />
                No seu navegador.
              </h2>
            </div>
            <div>
              <p className={styles.accessLead}>
                Na mesa de estudo ou no intervalo entre aulas.
              </p>
              <p>
                Acesse pelo computador, tablet ou celular. Entre na sua conta
                para retomar as sessões salvas e consultar seu histórico, sem
                instalar um aplicativo.
              </p>
              <div className={styles.accessTags}>
                <span>Computador</span>
                <span>Tablet</span>
                <span>Celular</span>
              </div>
              <p className={styles.accessNote}>
                Conexão com a internet necessária para sincronizar.
              </p>
            </div>
          </div>
        </section>

        <section
          id="duvidas"
          className={`${styles.container} ${styles.section} ${styles.faqSection}`}
          aria-labelledby="faq-title"
        >
          <div>
            <p className={styles.eyebrow}>05 / DÚVIDAS FREQUENTES</p>
            <h2 id="faq-title">
              Antes de
              <br />
              começar.
            </h2>
            <p className={styles.faqIntro}>
              O que você precisa saber sobre a plataforma e os seus resultados.
            </p>
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

        <section className={styles.finalCta} aria-labelledby="cta-title">
          <div className={styles.container}>
            <p className={styles.eyebrow}>O PRÓXIMO PASSO É SEU</p>
            <h2 id="cta-title">
              Dê uma direção
              <br />à sua preparação.
            </h2>
            <Link href="/cadastro" className={styles.primaryButton}>
              Criar minha conta <ArrowRight size={19} aria-hidden="true" />
            </Link>
            <p>
              Já tem uma conta? <Link href="/entrar">Entre no seu espaço.</Link>
            </p>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={`${styles.container} ${styles.footerTop}`}>
          <Link href="/" aria-label="BrasilPrep, início">
            <Brand />
          </Link>
          <p>Preparação com critério.</p>
          <nav aria-label="Links do rodapé">
            <a href="#como-funciona">Como funciona</a>
            <a href="#duvidas">Dúvidas frequentes</a>
            <Link href="/entrar">Minha conta</Link>
          </nav>
        </div>
        <div className={`${styles.container} ${styles.footerBottom}`}>
          <span>BrasilPrep · Plataforma em desenvolvimento</span>
          <span>Sem vínculo com instituições ou bancas examinadoras.</span>
        </div>
      </footer>
    </div>
  );
}
