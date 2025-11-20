"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroStats, services, projects, processSteps, technologies, contacts } from "@/data/content";

gsap.registerPlugin(ScrollTrigger, useGSAP);
import { IconSwitcher } from "@/components/ui/icon-switcher";
import { usePortfolioAnimations } from "@/hooks/use-portfolio-animations";
import { HeroPlanet } from "@/components/hero-planet";
import { AnimatedBackgroundGrid } from "@/components/ui/animated-background-grid";

type ContactFormState = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

const initialForm: ContactFormState = {
  name: "",
  email: "",
  projectType: "Website Institucional",
  message: "",
};

export function PortfolioPage() {
  usePortfolioAnimations();
  const [formData, setFormData] = useState<ContactFormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const handleChange = (field: keyof ContactFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setFeedback("Enviando...");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar");
      }

      setFormData(initialForm);
      setStatus("success");
      setFeedback("Mensagem enviada com sucesso! Retorno em até 24h úteis.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("Algo deu errado. Tente novamente em instantes.");
    }
  };

  return (
    <div className="relative min-h-screen">

      <div className="relative z-20">
        <Header />
        <main className="flex flex-col -mt-0">
          <HeroSection />
          <div className="relative z-10 mx-auto max-w-6xl flex flex-col gap-32 pb-24 pt-32">
            <ServicesSection />
            <ProjectsSection />
            <ProcessSection />
            <TechnologiesSection />
            <ContactSection
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              feedback={feedback}
              status={status}
            />
          </div>
        </main>
        
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-visible" style={{ height: '100vh', zIndex: 1 }}>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] bg-accent/5 blur-[150px] rounded-full opacity-50" />
        </div>
        
        <footer className="relative py-24 overflow-visible z-10">
          <div className="w-full flex items-center justify-center relative">
            <h2 className="font-display text-[15vw] leading-none select-none pointer-events-none relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-[#9932cc]/30 via-[#8a2be2]/25 to-[#9932cc]/30 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(138,43,226,0.4)] filter">
                SOUZA DEV
              </span>
              <span className="absolute top-4 -right-12 lg:-right-20 text-[3vw] bg-gradient-to-br from-[#8a2be2]/30 to-[#9932cc]/20 bg-clip-text text-transparent font-sans drop-shadow-[0_0_20px_rgba(138,43,226,0.3)]">©</span>
            </h2>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Header() {
  const navItems = [
    { href: "#hero", label: "Início", icon: "sparkle" },
    { href: "#servicos", label: "Serviços", icon: "buildings" },
    { href: "#projetos", label: "Projetos", icon: "target" },
    { href: "#processo", label: "Processo", icon: "rocket-launch" },
    { href: "#contato", label: "Contato", icon: "envelope-simple" },
  ];

  return (
    <header className="fixed top-0 w-full z-30 bg-transparent">
      <div className="flex w-full items-center justify-between gap-4 px-16 py-4 lg:px-24 xl:px-32">
        <a href="#hero" className="flex items-center transition-transform duration-300 ease-out hover:scale-110">
          <Image
            src="/logo-grifo.png"
            alt="SouzaDev Logo"
            width={60}
            height={20}
            className="h-auto w-auto transition-transform duration-300 ease-out"
            priority
          />
        </a>
        <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-primary-alt/60 p-1.5 backdrop-blur-sm md:flex">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${index === 0
                ? "bg-gradient-to-r from-accent/20 to-accent-strong/20 text-white"
                : "text-lavender/80 hover:bg-white/5 hover:text-white"
                }`}
            >
              <IconSwitcher name={item.icon} size={16} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <a
          href="#projetos"
          className="btn-primary flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold tracking-wide"
        >
          <IconSwitcher name="shopping-cart" size={18} />
          Ver Projetos
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowLeftRef = useRef<HTMLDivElement>(null);
  const glowRightRef = useRef<HTMLDivElement>(null);
  const glowTopRef = useRef<HTMLDivElement>(null);
  const glowBottomLeftRef = useRef<HTMLDivElement>(null);
  const glowBottomCenterRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const glows = [
      glowLeftRef.current,
      glowRightRef.current,
      glowTopRef.current,
      glowBottomLeftRef.current,
      glowBottomCenterRef.current
    ];

    gsap.from(glows, {
      opacity: 0,
      scale: 0.5,
      duration: 2.5,
      ease: "power2.out",
      stagger: 0.2,
    });

    glows.forEach((glow, i) => {
      if (!glow) return;
      gsap.to(glow, {
        opacity: 0.8,
        scale: 1.1 + (i % 2) * 0.1,
        duration: 3 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2 + i * 0.5,
      });
    });

  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative z-0 flex min-h-screen items-center justify-center overflow-hidden"
      data-hero
      style={{ paddingTop: 'calc(73px + 6rem)' }}
    >
      <div className="absolute inset-0 w-full h-full">

        <div data-hero-background className="absolute inset-0 w-full h-full">
          <AnimatedBackgroundGrid />

          <div className="pointer-events-none absolute inset-0 -z-10">
            <Image
              src=""
              alt=""
              fill
              className="object-cover opacity-30"
              priority
              quality={90}
            />
            <div className="absolute inset-0 bg-primary/60" />
            <div ref={glowLeftRef} className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-100" />
            <div ref={glowRightRef} className="absolute right-[23%] top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/20 blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-100" />
            <div ref={glowTopRef} className="absolute left-[40%] top-[10%] w-[200px] h-[200px] bg-accent/15 blur-[80px] rounded-full pointer-events-none mix-blend-screen opacity-100" />
            <div ref={glowBottomLeftRef} className="absolute left-[5%] bottom-[10%] w-[350px] h-[350px] bg-accent/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen opacity-100" />
            <div ref={glowBottomCenterRef} className="absolute left-1/2 -translate-x-1/2 bottom-[-10%] w-[600px] h-[300px] bg-accent/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen opacity-100" />
          </div>
        </div>

        <div className="relative z-10 w-full h-full px-16 lg:px-24 xl:px-32 flex items-center justify-center">

          <div className="hero-planet-container absolute right-0 top-1/2 -translate-y-1/2 w-full sm:w-[70%] md:w-[60%] lg:w-[50%] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px] pointer-events-auto opacity-50 sm:opacity-70 md:opacity-100">
            <HeroPlanet />
          </div>

          <div data-hero-content className="relative z-10 space-y-8 lg:space-y-10 overflow-visible max-w-3xl w-full mr-auto">
            <div className="space-y-6">
              <h1 className="hero-line font-display font-extrabold text-4xl leading-[1.1] text-white md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl">
                <span className="block">
                  <span>Código que tr</span>
                  <span className="hero-gradient-text">ansforma ideias em soluções web</span>
                  <span> de alta performance</span>
                </span>
              </h1>
              <p className="hero-line max-w-2xl text-base text-lavender/80 md:text-lg">
                Desenvolvimento web profissional com stack moderna. Arquitetura escalável, código limpo e resultados mensuráveis.
              </p>
            </div>

            <div className="hero-line flex flex-wrap gap-4 overflow-visible">
              <a
                href="#projetos"
                className="btn-primary flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold md:px-10 md:py-5 md:text-lg"
              >
                <IconSwitcher name="lock" size={20} />
                Ver Projetos
              </a>
              <a
                href="#contato"
                className="btn-ghost flex items-center gap-2 rounded-2xl border-2 px-8 py-4 text-base font-semibold text-white md:px-10 md:py-5 md:text-lg"
              >
                <IconSwitcher name="star" size={20} />
                Saber Mais
              </a>
            </div>

            <div className="hero-line flex gap-8 pt-4">
              {heroStats.slice(0, 2).map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="rounded-xl border border-accent/30 bg-accent/10 p-3">
                    <IconSwitcher
                      name={stat.label.includes("Projetos") ? "shopping-bag" : "users"}
                      size={24}
                      className="text-accent"
                    />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-white md:text-3xl">{stat.value}</p>
                    <p className="text-xs uppercase tracking-wide text-lavender/70">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="servicos" className="space-y-12">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Serviços</p>
        <h2 className="font-display text-4xl text-white">Experiências que elevam marcas.</h2>
        <p className="text-lg text-lavender/90">
          Cada projeto nasce com imersão estratégica, dados e foco em performance. Combino design de alto impacto, storytelling e tecnologia de ponta para entregar jornadas completas.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            data-service-card
            className="card-hover h-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 backdrop-blur"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl border border-accent/50 bg-accent/10 text-accent">
              <IconSwitcher name={service.icon} size={24} />
            </div>
            <h3 className="font-display text-2xl text-white">{service.title}</h3>
            <p className="mt-3 text-lavender/90">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section id="projetos" className="space-y-12">
      <div
        id="projects-pin"
        className="glass-panel rounded-3xl border border-white/10 p-8"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Projetos em destaque</p>
        <h2 className="mt-3 font-display text-4xl text-white">Galeria interativa.</h2>
        <p className="mt-4 text-lg text-lavender/90">
          Pinning inteligente para destacar cada case com parallax controlado. Imersão visual com foco em storytelling e métricas reais.
        </p>
      </div>
      <div className="projects-grid grid gap-10 md:grid-cols-2">
        {projects.map((project) => (
          <figure
            key={project.title}
            data-project-card
            className="card-hover overflow-hidden rounded-3xl border border-white/5 bg-white/5"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                width={900}
                height={675}
                className="h-full w-full object-cover transition duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)]"
                sizes="(min-width: 768px) 45vw, 100vw"
              />
            </div>
            <figcaption className="flex items-center justify-between p-6">
              <div>
                <p className="text-lg font-semibold text-white">{project.title}</p>
                <p className="text-sm text-lavender/80">{project.result}</p>
              </div>
              <IconSwitcher name="arrow-out" size={26} className="text-accent" />
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="processo" className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Como eu trabalho</p>
        <h2 className="font-display text-4xl text-white">Processo end-to-end.</h2>
      </div>
      <div className="space-y-8">
        {processSteps.map((step, index) => (
          <article
            key={step.title}
            data-process-step
            className="flex flex-col gap-6 rounded-3xl border border-white/10 p-6 backdrop-blur md:flex-row md:items-start"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/50 bg-accent/10 font-display text-xl text-accent">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <h3 className="text-2xl font-display text-white">{step.title}</h3>
            </div>
            <p className="text-lavender/90 md:flex-1">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TechnologiesSection() {
  return (
    <section id="tecnologias" className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Tecnologias</p>
        <h2 className="font-display text-4xl text-white">Stack dominada.</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {technologies.map((tech) => (
          <div
            key={tech.label}
            data-tech-chip
            className="card-hover flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-accent">
              <IconSwitcher name={tech.icon} size={26} />
            </div>
            <p className="text-lg font-semibold text-white">{tech.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type ContactSectionProps = {
  formData: ContactFormState;
  handleChange: (field: keyof ContactFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  feedback: string;
  status: "idle" | "loading" | "success" | "error";
};

function ContactSection({ formData, handleChange, handleSubmit, feedback, status }: ContactSectionProps) {
  return (
    <section id="contato" className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-lavender/70">Contato</p>
        <h2 className="font-display text-4xl text-white">Vamos cocriar algo grande.</h2>
        <p className="text-lg text-lavender/90">
          Envie uma mensagem ou fale diretamente via WhatsApp. Retorno em até 24h úteis.
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-primary/70 p-8 shadow-card"
        >
          <div className="space-y-6">
            <Field label="Nome" htmlFor="name">
              <input
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange("name")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-lavender/60 focus:border-accent focus:outline-none"
                placeholder="Qual é o seu nome?"
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange("email")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-lavender/60 focus:border-accent focus:outline-none"
                placeholder="email@empresa.com"
              />
            </Field>
            <Field label="Tipo de projeto" htmlFor="projectType">
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange("projectType")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-accent focus:outline-none"
              >
                {services.map((service) => (
                  <option key={service.title}>{service.title}</option>
                ))}
                <option>Outro</option>
              </select>
            </Field>
            <Field label="Mensagem" htmlFor="message">
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange("message")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-lavender/60 focus:border-accent focus:outline-none"
                placeholder="Conte sobre o seu projeto, metas e prazos."
              />
            </Field>
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary w-full rounded-2xl py-3 text-lg font-semibold disabled:opacity-70"
            >
              {status === "loading" ? "Enviando..." : "Enviar proposta"}
            </button>
            {feedback && (
              <p
                className={`text-center text-sm ${status === "error"
                  ? "text-red-400"
                  : status === "success"
                    ? "text-green-400"
                    : "text-lavender/80"
                  }`}
              >
                {feedback}
              </p>
            )}
          </div>
        </form>
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-lavender/60">Disponibilidade</p>
            <p className="text-2xl font-display text-white">Vagas abertas para Dez/2025.</p>
          </div>
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.label} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/40 bg-accent/10 text-accent">
                  <IconSwitcher name={contact.icon} size={24} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-lavender/60">{contact.label}</p>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg font-semibold text-white transition hover:text-accent"
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <p className="text-lg font-semibold text-white">{contact.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-lavender/60">Stack + Parcerias</p>
            <p className="text-lavender/90">
              Cloud AWS, integrações HubSpot, RD Station e CRMs proprietários. Banco de dados PostgreSQL com Prisma para leads sempre sincronizados.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2 text-sm uppercase tracking-wide text-lavender/80">
      <span>{label}</span>
      {children}
    </label>
  );
}





