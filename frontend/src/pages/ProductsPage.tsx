const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-gray-500 text-center py-8">
            Product management interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;