export default function PublishedParcelsPage() {
  return (
    <div className="hz-admin-page">
      <header className="hz-admin-header-main">
        <h1>Published Parcels</h1>
        <p>Manage all active intelligence briefings currently visible to the public and investors.</p>
      </header>

      <div className="hz-admin-content">
        <div className="hz-admin-table-container">
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p style={{ marginBottom: '1rem', fontSize: '2rem' }}>🌍</p>
            <h3>No Published Parcels Yet</h3>
            <p>Approve pending submissions from the dashboard to see them here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
