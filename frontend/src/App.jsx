import { useState } from 'react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const runAudit = async () => {
    if (!url) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await fetch('http://localhost:3000/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Audit failed')
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyPromptLogs = () => {
    if (result?.aiInsights?.rawResponse) {
      navigator.clipboard.writeText(result.aiInsights.rawResponse)
      alert('✓ Prompt logs copied to clipboard!')
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🔍 AI Website Audit Tool</h1>
          <p>Analyze webpages with AI-powered insights</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-container">
        {/* Input Section */}
        <section className="input-section">
          <div className="input-wrapper">
            <input
              type="url"
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && runAudit()}
              className="url-input"
            />
            <button 
              onClick={runAudit} 
              disabled={loading}
              className={`audit-btn ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Auditing...
                </>
              ) : (
                'Run Audit'
              )}
            </button>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <section className="results-section">
            {/* Metrics Overview */}
            <div className="metrics-overview">
              <h2>📊 Key Metrics</h2>
              <div className="metrics-grid">
                <MetricCard 
                  label="Word Count" 
                  value={result.metrics.wordCount}
                  icon="📝"
                />
                <MetricCard 
                  label="H1 Headings" 
                  value={result.metrics.headings.h1}
                  icon="📌"
                />
                <MetricCard 
                  label="H2 Headings" 
                  value={result.metrics.headings.h2}
                  icon="📌"
                />
                <MetricCard 
                  label="CTAs" 
                  value={result.metrics.ctaCount}
                  icon="🎯"
                />
                <MetricCard 
                  label="Total Links" 
                  value={result.metrics.links.total}
                  icon="🔗"
                />
                <MetricCard 
                  label="Images" 
                  value={result.metrics.images.total}
                  icon="🖼️"
                />
                <MetricCard 
                  label="Missing Alt Text" 
                  value={`${result.metrics.images.missingAltPercent}%`}
                  icon="❌"
                  warning={true}
                />
                <MetricCard 
                  label="Internal Links" 
                  value={result.metrics.links.internal}
                  icon="🏠"
                />
              </div>
            </div>

            {/* Meta Info */}
            <div className="meta-section">
              <h3>📋 Page Information</h3>
              <div className="meta-card">
                <div className="meta-item">
                  <label>Title:</label>
                  <p>{result.metrics.meta.title}</p>
                </div>
                <div className="meta-item">
                  <label>Description:</label>
                  <p>{result.metrics.meta.description}</p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="analysis-section">
              <h2>🤖 AI Analysis</h2>
              <div className="analysis-grid">
                <AnalysisCard 
                  title="SEO Structure" 
                  content={result.aiInsights.ai.analysis.seo}
                  icon="🔍"
                />
                <AnalysisCard 
                  title="Messaging Clarity" 
                  content={result.aiInsights.ai.analysis.messaging}
                  icon="💬"
                />
                <AnalysisCard 
                  title="CTA Usage" 
                  content={result.aiInsights.ai.analysis.cta}
                  icon="🎯"
                />
                <AnalysisCard 
                  title="Content Depth" 
                  content={result.aiInsights.ai.analysis.depth}
                  icon="📚"
                />
                <AnalysisCard 
                  title="UX/Accessibility" 
                  content={result.aiInsights.ai.analysis.ux}
                  icon="♿"
                />
              </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations-section">
              <h2>✨ Recommendations</h2>
              <ol className="recommendations-list">
                {result.aiInsights.ai.recommendations.map((rec, i) => (
                  <li key={i} className="recommendation-item">
                    <span className="rec-number">{i + 1}</span>
                    <p>{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Warning */}
            {result.aiInsights.ai.warning && (
              <div className="warning-section">
                <span className="warning-icon">⚡</span>
                <p><strong>Alert:</strong> {result.aiInsights.ai.warning}</p>
              </div>
            )}

            {/* Action Button */}
            <button onClick={copyPromptLogs} className="copy-btn">
              📋 Copy AI Prompt Logs
            </button>
          </section>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <p>Enter a URL and click "Run Audit" to get started</p>
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({ label, value, icon, warning }) {
  return (
    <div className={`metric-card ${warning ? 'warning' : ''}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
      </div>
    </div>
  )
}

function AnalysisCard({ title, content, icon }) {
  return (
    <div className="analysis-card">
      <div className="card-header">
        <span className="card-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <p>{content}</p>
    </div>
  )
}

export default App
