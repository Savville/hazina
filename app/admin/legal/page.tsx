export default function LegalCrosscheckPage() {
  return (
    <div className="hz-admin-page">
      <header className="hz-admin-header-main">
        <h1>ELC Legal Crosscheck (Beta)</h1>
        <p>Run LR Numbers against the Kenya Law Reports database to identify active Environment and Land Court disputes.</p>
      </header>

      <div className="hz-admin-content">
        <div className="hz-admin-table-container" style={{ padding: '2rem' }}>
          
          <div style={{ maxWidth: '600px', backgroundColor: 'var(--color-dark-bg)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-inverse)' }}>Manual LR Lookup</h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Enter a Title Deed or LR Number to instantly scan the ELC cause lists and flagged visual disputes.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input 
                type="text" 
                placeholder="e.g. Kajiado/Kaputiei/1234" 
                style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'white' }}
              />
              <button className="btn-primary" style={{ padding: '0 1.5rem' }}>Run Check</button>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(214, 0, 28, 0.05)', borderRadius: '4px', border: '1px dashed var(--color-primary)' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                <strong>Automated Crawler Status:</strong> The automated ELC scraper pipeline is currently offline. Legal checks must be verified manually via the judiciary portal.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
