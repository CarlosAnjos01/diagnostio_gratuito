import { useState } from "react";
import "./index.css";
import { dimensions, questions, answerOptions } from "./data/questions";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [company, setCompany] = useState({ company: "", contact: "", email: "" });
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);

  const currentQuestion = questions[current];
  const progress = Math.round(((current + 1) / questions.length) * 100);

  function calculateResult() {
    let totalScore = 0;
    const dimensionTotals = {};

    dimensions.forEach(d => dimensionTotals[d.id] = { score: 0, count: 0 });

    questions.forEach(q => {
      const val = answers[q.id] || 0;
      totalScore += val;
      if (dimensionTotals[q.dimension]) {
        dimensionTotals[q.dimension].score += val;
        dimensionTotals[q.dimension].count += 1;
      }
    });

    const maxPossible = questions.length * 5;
    const overallScore = Math.round((totalScore / maxPossible) * 100);

    // Identificar menor dimensão (Gargalo)
    let lowestDim = null;
    let lowestAvg = 6;

    Object.keys(dimensionTotals).forEach(dimId => {
      const avg = dimensionTotals[dimId].score / dimensionTotals[dimId].count;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestDim = dimId;
      }
    });

    const gapDimension = dimensions.find(d => d.id === lowestDim);

    return { overallScore, gapDimension };
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Ginga Aí</div>
        <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Raio-X Comercial Gratuito</div>
      </header>

      <main>
        {screen === "landing" && (
          <div className="hero">
            <h1>Seu comercial vende.<br /><span>Mas ele está preparado para crescer?</span></h1>
            <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
              Responda a 18 perguntas rápidas e receba instantaneamente o seu Score de Maturidade e o Gargalo Principal do seu processo comercial.
            </p>
            <button className="primary-button" onClick={() => setScreen("company")}>
              Começar Raio-X Gratuito
            </button>
          </div>
        )}

        {screen === "company" && (
          <div className="form-container">
            <h2 style={{ marginBottom: "0.5rem" }}>Identificação da Empresa</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Preencha os dados abaixo para personalizar o relatório do seu Raio-X.</p>
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
                <span>Seu E-mail *</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.85rem" }}>
              <span>Pergunta {current + 1} de {questions.length}</span>
              <span>{dimensions.find(d => d.id === currentQuestion.dimension)?.short}</span>
            </div>
            <div className="progress"><div style={{ width: `${progress}%` }} /></div>

            <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>{currentQuestion.text}</h2>

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
                disabled={!answers[currentQuestion.id]} 
                onClick={() => {
                  if (current === questions.length - 1) {
                    setScreen("result");
                  } else {
                    setCurrent(current + 1);
                  }
                }}
              >
                {current === questions.length - 1 ? "Ver Resultado" : "Próxima"}
              </button>
            </div>
          </div>
        )}

        {screen === "result" && (() => {
          const { overallScore, gapDimension } = calculateResult();
          return (
            <div className="result-container" style={{ textAlign: "center" }}>
              <h2>Resultado do Raio-X Comercial</h2>
              <p style={{ color: "#94a3b8" }}>Empresa: <strong>{company.company}</strong></p>

              <div className="score-badge">{overallScore}%</div>
              <p style={{ fontWeight: 600, marginBottom: "2rem" }}>Score de Maturidade Comercial</p>

              <div style={{ background: "#0f172a", padding: "1.5rem", borderRadius: "0.5rem", textAlign: "left", marginBottom: "2rem", border: "1px solid #334155" }}>
                <h3 style={{ color: "#ef4444", marginBottom: "0.5rem" }}>⚠️ Gargalo Principal Identificado</h3>
                <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>{gapDimension?.short}</p>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.25rem" }}>{gapDimension?.description}</p>
              </div>

              <button className="primary-button" onClick={() => { setScreen("landing"); setAnswers({}); setCurrent(0); }}>
                Refazer Raio-X
              </button>
            </div>
          );
        })()}
      </main>
    </div>
  );
}
