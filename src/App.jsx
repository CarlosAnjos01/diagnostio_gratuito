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
              Iniciar 18 Perguntas
            </button>
          </div>
        )}

        {screen === "diagnostic" && (
          <div className="diagnostic-container">
            <div style={{ display: "flex", justifyBetween: "space-between", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>
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

              <button className="primary-button" style={{ marginTop: "2rem" }} onClick={() => { setScreen("landing"); setAnswers({}); setCurrent(0); }}>
                Refazer Diagnóstico
              </button>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
