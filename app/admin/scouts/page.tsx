export default function ManageScoutsPage() {
  return (
    <div className="hz-admin-page">
      <header className="hz-admin-header-main">
        <h1>Manage Scouts</h1>
        <p>View performance, active regions, and access levels for your field intelligence team.</p>
      </header>

      <div className="hz-admin-content">
        <div className="hz-admin-table-container">
          <table className="hz-admin-table">
            <thead>
              <tr>
                <th>Scout Name</th>
                <th>Region</th>
                <th>Status</th>
                <th>Parcels Mapped</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>William O.</td>
                <td>Kiambu & Kajiado</td>
                <td><span className="badge-safe">Active</span></td>
                <td>14</td>
                <td><button className="hz-btn-outline-small">View Profile</button></td>
              </tr>
              <tr>
                <td>Sarah M.</td>
                <td>Machakos</td>
                <td><span className="badge-safe">Active</span></td>
                <td>8</td>
                <td><button className="hz-btn-outline-small">View Profile</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
