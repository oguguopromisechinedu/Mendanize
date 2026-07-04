const categories = [
  { name: "Product", description: "Stories about launches, updates, and product thinking." },
  { name: "Strategy", description: "Editorial planning and publishing growth ideas." },
  { name: "Design", description: "How content experiences feel and function." },
];

export default function CategoriesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-violet-300">Categories</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Browse by topic</h1>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <div key={category.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">{category.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
