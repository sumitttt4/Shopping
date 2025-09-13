const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex space-x-2">
          <select className="input">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
          <button className="btn btn-outline">Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-500 text-center py-8">
              Sales charts will be implemented here.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Product Performance</h3>
          </div>
          <div className="card-body">
            <p className="text-gray-500 text-center py-8">
              Product analytics will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;