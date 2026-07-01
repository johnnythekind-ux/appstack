type PageProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function Page({
  title,
  description,
  children,
}: PageProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        {description && (
          <p className="mt-2 text-slate-400">
            {description}
          </p>
        )}

        {children}
      </div>
    </main>
  );
}