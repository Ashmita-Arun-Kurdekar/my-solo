export default function AiRecommendationPanel({ taskTitle, recommendations, onSelect }) {
  if (!recommendations?.length) return null;
  return <section className="ai-recommendation-panel col-12" aria-label="AI resource recommendations">
    <div className="ai-panel-heading"><div><span className="ai-kicker"><i className="bi bi-stars" /> AI resource recommendation</span><h5 className="mb-0">Best matches for {taskTitle || "this task"}</h5></div><span className="ai-model-note">ML ranked · Manager decides</span></div>
    <div className="row g-3 mt-1">{recommendations.map((item, index) => <div className="col-lg-4" key={item.employee_id}>
      <article className={`ai-candidate ${index === 0 ? "ai-candidate-top" : ""}`}>
        <div className="d-flex justify-content-between gap-2"><div><span className="ai-rank">{["🥇", "🥈", "🥉"][index] || `#${index + 1}`}</span><strong>{item.employee_name}</strong></div><span className="ai-score">{Math.round(item.suitability_score)}% Match</span></div>
        <ul>{item.reasons?.map((reason) => <li key={reason}><i className="bi bi-check-circle-fill" /> {reason}</li>)}</ul>
        <button type="button" className="btn btn-sm btn-primary w-100" onClick={() => onSelect(item)}>Select {item.employee_name.split(" ")[0]}</button>
      </article>
    </div>)}</div>
  </section>;
}
