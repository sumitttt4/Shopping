const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner w-12 h-12 text-primary-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading...</h2>
        <p className="text-sm text-gray-500">Please wait while we set things up for you.</p>
      </div>
    </div>
  );
};

export default LoadingScreen;