export default function PageHeader({ title, subtitle, action }) {

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-3">

      <div>

        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            {subtitle}
          </p>
        )}

      </div>

      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}

    </div>
  );
}