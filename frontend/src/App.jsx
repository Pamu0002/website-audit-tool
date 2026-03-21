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
      alert('Prompt logs copied to clipboard!')
    }
  }

  return (
    <div className="app">
      <h1>AI Website Audit Tool</h1>
      <div className="input-section">
        <input
          type="url"
          placeholder="Enter website URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && runAudit()}
        />
        <button onClick={runAudit} disabled={loading}>
          {loading ? 'Auditing...' : 'Run Audit'}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="results">
          <h2>Metrics</h2>
          <pre>{JSON.stringify(result.metrics, null, 2)}</pre>
          <h2>AI Insights</h2>
          <div className="insights">
            <h3>Analysis</h3>
            <ul>
              <li><strong>SEO:</strong> {result.aiInsights.ai.analysis.seo}</li>
              <li><strong>Messaging:</strong> {result.aiInsights.ai.analysis.messaging}</li>
              <li><strong>CTA:</strong> {result.aiInsights.ai.analysis.cta}</li>
              <li><strong>Depth:</strong> {result.aiInsights.ai.analysis.depth}</li>
              <li><strong>UX:</strong> {result.aiInsights.ai.analysis.ux}</li>
            </ul>
            <h3>Recommendations</h3>
            <ol>
              {result.aiInsights.ai.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ol>
            {result.aiInsights.ai.warning && (
              <p><em>Warning: {result.aiInsights.ai.warning}</em></p>
            )}
          </div>
          <button onClick={copyPromptLogs} className="copy-btn">
            Copy Prompt Logs
          </button>
        </div>
      )}
    </div>
  )
}

export default App
