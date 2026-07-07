function DashboardCard({ title, value }) {
  return (
    <div className="card shadow p-3">
      <h5>{title}</h5>
      <h2>{value}</h2>
    </div>
  );
}

export default DashboardCard;