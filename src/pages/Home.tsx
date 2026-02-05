import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FeatureCard from "../components/featureCard";
import PricingCard from "../components/pricingCard";
import StatsSection from "../components/statsSection";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  Shield,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Cloud,
  MessageCircle,
  Layers,
  BarChart3,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";
import GraficoSmartSaldo from "../assets/GraficoSmartSaldo.png";

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      title: "Essencial",
      description: "Ideal para quem está começando a organizar as finanças.",
      price: "R$ 0",
      period: "/mês",
      icon: Layers,
      features: [
        "Cadastro manual de gastos",
        "Categorias básicas",
        "Acesso web",
      ],
      cta: "Começar gratuitamente",
      href: "/register",
      highlight: false,
    },
    {
      title: "Premium",
      description: "Automação e inteligência para decisões financeiras.",
      price: billingCycle === "monthly" ? "R$ 29,90" : "R$ 287,00",
      period: billingCycle === "monthly" ? "/mês" : "/ano",
      icon: Zap,
      features: [
        "Categorização automática de gastos",
        "Gráficos claros para acompanhamento",
        "Importação de extratos em CSV",
        "Relatórios em PDF personalizados",
      ],
      cta: "Assinar Premium",
      highlight: true,
      onCtaClick: () => {
        if (!isAuthenticated) {
          // 🔹 Usuário não logado → vai para login e volta para pagamento depois
          navigate(
            `/login?redirect=${encodeURIComponent(`/payment?billingCycle=${billingCycle}`)}`,
          );
        } else {
          // 🔹 Usuário logado → vai para página de payment que chama Stripe
          navigate(`/payment?billingCycle=${billingCycle}`);
        }
      },
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Adeus, digitação manual",
      description:
        "Importe seu extrato (formato CSV) e deixe nossa IA categorizar tudo. Você não precisa mais gastar horas preenchendo planilhas.",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      icon: Brain,
      title: "Previsão do seu mês",
      description:
        "Nossa IA analisa seus hábitos e avisa se o dinheiro vai dar para o mês todo ou se é hora de segurar os gastos.",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Segurança Bancária",
      description:
        "Seus dados são protegidos com a mesma tecnologia usada pelos grandes bancos. Privacidade total garantida.",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      icon: Target,
      title: "Controle total dos gastos",
      description:
        "Visualize exatamente para onde seu dinheiro está indo com categorias e gráficos claros.",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },

    {
      icon: Target,
      title: "Suas metas no papel",
      description:
        "Quer viajar ou comprar algo novo? Criamos um plano de economia automático para você chegar lá mais rápido.",
      gradient: "bg-gradient-to-br from-teal-500 to-cyan-600",
    },
    {
      icon: TrendingUp,
      title: "Onde seu dinheiro some?",
      description:
        "Descubra gastos fantasmas e assinaturas esquecidas que estão comendo o seu saldo todo mês.",
      gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    },
  ];

  const testimonials = [
    {
      quote:
        "Finalmente parei de me sentir culpada ao gastar. Agora eu sei exatamente quanto sobra para o meu lazer.",
      name: "Mariana Costa • Designer Freelancer",
      avatar: "https://placehold.co/64x64?text=MC",
    },
    {
      quote:
        "Consigo gerar relatórios em PDF personalizados para acompanhar meus gastos mês a mês sem dor de cabeça.",
      name: "Rafael Lima • Engenheiro",
      avatar: "https://placehold.co/64x64?text=RL",
    },
    {
      quote:
        "Importei meu extrato e o app organizou tudo sozinho. Ver meus gastos por categoria mudou totalmente meu controle financeiro.",
      name: "Ana Sousa • Autônoma",
      avatar: "https://placehold.co/64x64?text=AS",
    },
  ];

  const faqs = [
    {
      q: "É difícil configurar?",
      a: "Não. Basta criar sua conta e importar o extrato bancário em formato CSV para começar a acompanhar seus gastos.",
    },
    {
      q: "Meus dados estão seguros?",
      a: "Sim. Utilizamos criptografia, armazenamento seguro e seguimos boas práticas alinhadas à LGPD. Seus dados são privados e você tem controle total sobre eles.",
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim. Você pode cancelar a assinatura quando quiser, sem multas. Seus dados continuam disponíveis para exportação.",
    },
    {
      q: "Com quais bancos o sistema funciona?",
      a: "O sistema funciona com extratos bancários no formato CSV exportados dos principais bancos e fintechs do Brasil. No momento, não realizamos integração direta com bancos.",
    },
    {
      q: "Quais formatos de extrato são aceitos?",
      a: "Atualmente, o sistema aceita apenas extratos no formato CSV. Outros formatos poderão ser adicionados futuramente.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero */}
        <section
          id="inicio"
          className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 pt-20 pb-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <div className="inline-flex items-center space-x-3 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="h-4 w-4" />
                  <span>O fim das planilhas complicadas</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-4">
                  Sua vida financeira no piloto automático
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-6 max-w-2xl">
                  Importe extratos, organize seus gastos automaticamente e
                  visualize tudo em gráficos simples, com relatórios em PDF
                  prontos para usar.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    aria-label="Começar teste grátis"
                  >
                    Começar teste grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 items-center justify-center lg:justify-start">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-100 p-2 rounded-md">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Gráficos em tempo real
                      </p>
                      <p className="text-sm text-slate-600">
                        Acompanhe seus gastos e categorias com visualizações
                        claras.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="bg-teal-100 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Organização Automática
                      </p>
                      <p className="text-sm text-slate-600">
                        Sua IA categoriza tudo pelo extrato.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-slate-600">
                  <p className="text-sm">
                    Utilizado por mais de{" "}
                    <span className="font-semibold text-slate-900">
                      1.000 pessoas
                    </span>{" "}
                    em todo o Brasil
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="max-w-lg mx-auto lg:ml-auto">
                  {/* Browser-like frame for screenshot */}
                  <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-100 to-white px-4 py-3 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        smartsaldo.local/dashboard
                      </div>
                      <div />
                    </div>

                    <img
                      src={GraficoSmartSaldo}
                      alt="Print do dashboard SmartSaldo mostrando gráficos e previsões"
                      className="w-full h-80 md:h-96 object-contain bg-slate-50"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <Shield className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          SSL & criptografia
                        </p>
                        <p className="text-xs text-slate-600">
                          Proteção em trânsito e repouso
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <Lock className="h-6 w-6 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Conformidade LGPD
                        </p>
                        <p className="text-xs text-slate-600">
                          Controle e direitos do titular
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <Cloud className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Backup diário
                        </p>
                        <p className="text-xs text-slate-600">
                          Recuperação e redundância
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative gradients */}
                <div className="absolute -top-6 -right-6 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl opacity-20 -z-10" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl opacity-20 -z-10" />
              </motion.div>
            </div>

            {/* Integration logos */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-sm text-slate-600">
                Compatível com extratos CSV de bancos brasileiros
              </div>
              <div className="flex items-center gap-6 text-sm font-medium text-slate-700">
                <span>Itaú</span>
                <span>Nubank</span>
                <span>Banco do Brasil</span>
                <span>Mercado Pago</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <StatsSection />

        {/* Benefits / Features */}
        <section id="recursos" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Funcionalidades que resolvem suas maiores dores
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Não mostramos recursos — mostramos impacto: tempo economizado,
                previsibilidade e conformidade.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <FeatureCard
                  key={i}
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                  gradient={f.gradient}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Tabela de preços transparente
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Evite surpresas. Preços claros, opção mensal ou anual com
                desconto de 20% no ano.
              </p>
            </motion.div>

            <div className="flex justify-center mb-12">
              <div className="bg-slate-100 p-1.5 inline-flex items-center rounded-full gap-1 shadow-inner">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    billingCycle === "monthly"
                      ? "bg-white text-emerald-600 shadow-md"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    billingCycle === "annual"
                      ? "bg-white text-emerald-600 shadow-md"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Anual{" "}
                  <span className="ml-1 text-xs text-emerald-500 font-medium">
                    (-20%)
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center max-w-4xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                  className="w-full max-w-sm"
                >
                  <PricingCard {...plan} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="depoimentos" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Depoimentos reais
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Clientes que obtiveram resultados mensuráveis com nossa
                plataforma.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {t.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600">"{t.quote}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Dúvidas Frequentes
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Antecipe as perguntas mais comuns e siga em frente sem atritos.
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((f, i) => (
                <details
                  key={i}
                  className="group p-5 rounded-2xl border border-slate-100 bg-slate-50"
                >
                  <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-slate-800">
                    <span>{f.q}</span>
                    <span className="ml-4 text-slate-500 group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="mt-3 text-slate-600">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          id="sobre"
          className="py-16 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Pronto para começar?
              </h2>
              <p className="text-white/90 mb-6">
                Teste gratuitamente e veja em dias a diferença na gestão do seu
                caixa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Começar agora — é grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>

                <a
                  href="#faq"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-emerald-600 transition-all"
                >
                  Ver FAQ
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Floating Contact Email */}
        <a
          href="mailto:smartsaldo.oficial@gmail.com"
          aria-label="Enviar e-mail para SmartSaldo"
          className="fixed right-6 bottom-6 z-50"
        >
          <div className="bg-emerald-600 hover:bg-emerald-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all">
            <MessageCircle className="h-6 w-6" />
          </div>
        </a>
      </main>

      <Footer />
    </div>
  );
}
