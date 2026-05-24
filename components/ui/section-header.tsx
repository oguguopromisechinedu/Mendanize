type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  center?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  center = false,
}: SectionHeaderProps) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm uppercase tracking-[0.3em] text-violet-300">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-400">{description}</p>
    </div>
  );
}
