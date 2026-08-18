import { useState } from "react";

const POWER_BI_EMBED_URL = import.meta.env.VITE_POWER_BI_EMBED_URL || "";

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(Boolean(POWER_BI_EMBED_URL));

  return <section className="analytics-page">
    <div className="command-page-head analytics-heading">
      <div>
        <span>INTELLIGENCE / POWER BI</span>
        <h1>Outcome analytics</h1>
        <p>Explore organization performance after people, capacity, projects, and work become measurable outcomes.</p>
      </div>
      <div className="analytics-source"><i/><span>EXTERNAL ANALYTICS<small>POWER BI WORKSPACE</small></span></div>
    </div>

    <div className="analytics-card">
      {POWER_BI_EMBED_URL ? <>
        {isLoading && <div className="analytics-loading"><span className="spinner-border spinner-border-sm" aria-hidden="true" />Loading Power BI dashboard…</div>}
        <iframe
          title="Power BI Dashboard"
          src={POWER_BI_EMBED_URL}
          width="100%"
          height="700"
          frameBorder="0"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </> : <div className="analytics-empty">
        <i className="bi bi-bar-chart-line" />
        <h2>Power BI dashboard is ready to connect</h2>
        <p>Add your Power BI publish-to-web URL to <code>VITE_POWER_BI_EMBED_URL</code> in <code>frontend/.env</code>, then restart Vite.</p>
      </div>}
    </div>
  </section>;
}
