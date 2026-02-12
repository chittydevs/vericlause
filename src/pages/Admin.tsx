const Admin = () => {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            This area is restricted to admin users. Use this space for managing users,
            reviewing analyses, or configuring system-wide settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;

