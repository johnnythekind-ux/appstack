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
    <main className="min-h-[calc(100vh-73px)] bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-4xl text-muted">
            {description}
          </p>
        )}

        {children}
      </div>
    </main>
  );
}
