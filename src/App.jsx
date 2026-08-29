import { useState } from "react";
import "./index.css";
import { dimensions, questions, answerOptions } from "./data/questions";

const API_URL = "https://shy-dawn-31acdiagnostico-api.carlos-fe4.workers.dev/api/diagnostico";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [company, setCompany] = useState({ company: "", contact: "", email: "" });
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentQuestion = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  function calculateResult() {
    let totalScore = 0;
    const dimensionScores = {};

    dimensions.forEach(d => dimensionScores[d.id] = { score: 0, count: 0, name: d.short, desc: d.description });

    questions.forEach(q => {
      const val = answers[q.id] || 0;
      totalScore += val;
      if (dimensionScores[q.dimension]) {
        dimensionScores[q.dimension].score += val;
        dimensionScores[q.dimension].count += 1;
      }
    });

    const maxPossible = questions.length * 5;
    const overallScore = Math.round((totalScore / maxPossible) * 100);

    // Processar percentual de cada dimensão
    const dimensionList = dimensions.map(d => {
      const data = dimensionScores[d.id];
      const pct = Math.round((data.score / (data.count * 5)) * 100);
      let status = "Crítico";
      let color = "var(--danger)";

      if (pct >= 70) {
        status = "Consolidado";
        color = "var(--success)";
      } else if (pct >= 40) {
        status = "Em Estruturação";
        color = "var(--warning)";
      }

      return { id: d.id, name: d.short, desc: d.description, pct, status, color };
    });

    // Ordenar do menor para o maior percentual para achar gargalos
    const sortedDimensions = [...dimensionList].sort((a, b) => a.pct - b.pct);
    const primaryGap = sortedDimensions[0];
    const topBottlenecks = sortedDimensions.slice(0, 3);

    return { overallScore, dimensionList, primaryGap, topBottlenecks };
  }

  async function finishDiagnostic() {
    const { overallScore, primaryGap } = calculateResult();
    setSaving(true);

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.company,
          contact: company.contact,
          email: company.email,
          overallScore,
          gapDimension: primaryGap?.name || "Geral",
          answers
        })
      });
    } catch (err) {
      console.error("Erro ao salvar no D1:", err);
    } finally {
      setSaving(false);
      setScreen("result");
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">GINGA <span>AÍ</span></div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>DIAGNÓSTICO GRATUITO</div>
      </header>

      <main>
        {screen === "landing" && (
          <div className="hero">
            <h1>Seu comercial vende.<br /><span>Mas está pronto para escalar?</span></h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "1.1rem" }}>
              Descubra seu Índice de Maturidade Comercial, o Mapa por Dimensão e o Gargalo Operacional do seu negócio em menos de 3 minutos.
            </p>
            <button className="primary-button" onClick={() => setScreen("company")}>
              Iniciar Raio-X Gratuito
            </button>
          </div>
        )}

        {screen === "company" && (
          <div className="form-container">
            <h2 style={{ marginBottom: "0.25rem", textTransform: "uppercase" }}>Identificação da Empresa</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Preencha os dados para gerar o relatório personalizado.</p>
            <div className="form-grid">
              <label className="field">
                <span>Nome da Empresa *</span>
                <input value={company.company} onChange={e => setCompany({...company, company: e.target.value})} placeholder="Sua empresa" />
              </label>
              <label className="field">
                <span>Seu Nome *</span>
                <input value={company.contact} onChange={e => setCompany({...company, contact: e.target.value})} placeholder="Seu nome" />
              </label>
              <label className="field" style={{ gridColumn: "span 2" }}>
                <span>Seu E-mail Corporativo *</span>
                <input type="email" value={company.email} onChange={e => setCompany({...company, email: e.target.value})} placeholder="seuemail@empresa.com" />
              </label>
            </div>
            <button 
              className="primary-button" 
              disabled={!company.company || !company.contact || !company.email} 
              onClick={() => setScreen("diagnostic")}
            >
              Iniciar Perguntas
            </button>
          </div>
        )}

        {screen === "diagnostic" && (
          <div className="diagnostic-container">
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
              <span>Pergunta {current + 1} de {questions.length}</span>
              <span style={{ color: "var(--primary)" }}>{dimensions.find(d => d.id === currentQuestion.dimension)?.short}</span>
            </div>
            <div className="progress"><div style={{ width: `${progress}%` }} /></div>

            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.2rem" }}>{currentQuestion.text}</h2>

            <div className="answer-list">
              {answerOptions.map(opt => (
                <div 
                  key={opt.value} 
                  className={`answer-option ${answers[currentQuestion.id] === opt.value ? "selected" : ""}`}
                  onClick={() => setAnswers({...answers, [currentQuestion.id]: opt.value})}
                >
                  <div className="answer-number">{opt.value}</div>
                  <div className="answer-copy">
                    <strong>{opt.label}</strong>
                    <small>{opt.helper}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="diagnostic-actions">
              <button 
                className="secondary-button" 
                onClick={() => current > 0 ? setCurrent(current - 1) : setScreen("company")}
              >
                Voltar
              </button>
              <button 
                className="primary-button" 
                disabled={!answers[currentQuestion.id] || saving} 
                onClick={() => {
                  if (current === questions.length - 1) {
                    finishDiagnostic();
                  } else {
                    setCurrent(current + 1);
                  }
                }}
              >
                {saving ? "Gerando Diagnóstico..." : (current === questions.length - 1 ? "Ver Resultado Completo" : "Próxima")}
              </button>
            </div>
          </div>
        )}

        {screen === "result" && (() => {
          const { overallScore, dimensionList, primaryGap, topBottlenecks } = calculateResult();

          // Configuração da mensagem dinâmica do WhatsApp do Flávio
          const flavioPhone = "5511999999999"; // TODO: Substitua pelo número real do Flávio com DDD (ex: 5511988887777)
          const companyName = company.company || "Minha Empresa";
          const contactName = company.contact || "Cliente";

          const gargalosTexto = topBottlenecks
            .map((item, idx) => `${idx + 1}. ${item.name} (${item.pct}% de Maturidade)`)
            .join('\n');

          const whatsappMessage = encodeURIComponent(
            `Olá Flávio! Me chamo ${contactName}, acabei de fazer o Diagnóstico Comercial na Ginga OS para a empresa *${companyName}*.\n\n` +
            `📊 *Nosso Índice de Maturidade:* ${overallScore}%\n\n` +
            `🚨 *Principais Gargalos Mapeados:*\n${gargalosTexto}\n\n` +
            `Gostaria de agendar a apresentação do nosso plano de ação completo com o consultor!`
          );

          const whatsappUrl = `https://wa.me/${flavioPhone}?text=${whatsappMessage}`;

          return (
            <div className="result-container" style={{ textAlign: "center" }}>
              <h2 style={{ textTransform: "uppercase", fontSize: "1.5rem" }}>Diagnóstico de Maturidade Comercial</h2>
              <p style={{ color: "var(--text-muted)" }}>Empresa: <strong style={{ color: "var(--text)" }}>{company.company}</strong></p>

              <div className="score-badge">{overallScore}%</div>
              <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-muted)", marginBottom: "2rem" }}>
                Índice Geral de Maturidade
              </p>

              {/* Bloco 1: Mapa por Dimensão */}
              <div className="section-block">
                <div className="section-title" style={{ color: "var(--primary)" }}>📊 Mapa de Maturidade por Dimensão</div>
                {dimensionList.map(dim => (
                  <div key={dim.id} className="dimension-card">
                    <div className="dimension-header">
                      <span>{dim.name}</span>
                      <span style={{ color: dim.color }}>{dim.pct}% — {dim.status}</span>
                    </div>
                    <div className="dim-bar-bg">
                      <div className="dim-bar-fill" style={{ width: `${dim.pct}%`, background: dim.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bloco 2: Gargalos Operacionais */}
              <div className="section-block">
                <div className="section-title" style={{ color: "var(--danger)" }}>⚠️ Principais Gargalos Operacionais</div>
                {topBottlenecks.map((item, idx) => (
                  <div key={item.id} className="bottleneck-item">
                    <strong style={{ display: "block", color: "var(--text)", fontSize: "0.95rem" }}>
                      {idx + 1}. {item.name} ({item.pct}% de Maturidade)
                    </strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{item.desc}</span>
                  </div>
                ))}
              </div>

              {/* Bloco 3: Prioridades de Implementação */}
              <div className="section-block">
                <div className="section-title" style={{ color: "var(--success)" }}>🚀 Prioridades de Implementação</div>
                <div className="roadmap-step">
                  <div className="step-num">1</div>
                  <div>
                    <strong>Estabilizar a dimensão {primaryGap.name}</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Prioridade imediata: padronizar rituais e critérios para elevar a maturidade mínima da operação.
                    </p>
                  </div>
                </div>
                <div className="roadmap-step">
                  <div className="step-num">2</div>
                  <div>
                    <strong>Formalizar Playbook e Processos</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Reduzir a dependência do talento individual definindo etapas de funil e gatilhos de passagem claros.
                    </p>
                  </div>
                </div>
                <div className="roadmap-step">
                  <div className="step-num">3</div>
                  <div>
                    <strong>Adotar Gestão orientada a dados</strong>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                      Acompanhar diariamente taxa de conversão e ciclo de vendas direto no CRM.
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCO DE CONVERSÃO - CTA WHATSAPP FLÁVIO */}
              <div style={{ marginTop: "2.5rem", padding: "2rem 1.5rem", background: "linear-gradient(135deg, #1A1A1A 0%, #111111 100%)", borderRadius: "12px", border: "1px solid rgba(255, 85, 33, 0.4)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                <h3 style={{ color: "#FFFFFF", fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Quer destravar o crescimento da {company.company || "sua empresa"}?
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem", maxWidth: "540px", margin: "0 auto 1.5rem auto" }}>
                  Agende uma sessão estratégica gratuita de 30 minutos com nossos especialistas para receber o roadmap detalhado de correção dos gargalos.
                </p>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    backgroundColor: "#25D366",
                    color: "#000000",
                    fontWeight: "800",
                    fontSize: "0.95rem",
                    padding: "1rem 2rem",
                    borderRadius: "8px",
                    textDecoration: "none",
                    boxShadow: "0 4px 20px rgba(37, 211, 102, 0.35)",
                    transition: "transform 0.2s ease",
                    cursor: "pointer"
                  }}
                >
                  <svg style={{ width: "22px", height: "22px", fill: "currentColor" }} viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  SOLICITAR PLANO COMPLETO VIA WHATSAPP
                </a>

                <div style={{ marginTop: "1rem" }}>
                  <button 
                    onClick={() => { setScreen("landing"); setAnswers({}); setCurrent(0); }} 
                    style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "underline", cursor: "pointer" }}
                  >
                    Refazer o diagnóstico comercial
                  </button>
                </div>
              </div>

            </div>
          );
        })()}
      </main>
    </div>
  );
}
