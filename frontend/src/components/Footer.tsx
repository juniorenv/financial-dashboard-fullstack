export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-slate-800 px-4 pb-8 pt-6 text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs sm:flex-row sm:text-left">
        <p className="m-0">
          &copy; {year} Dashboard Financeiro • Sistema de contas a pagar e a
          receber.
        </p>
        <p className="m-0 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
          Desafio Fullstack
        </p>
      </div>
    </footer>
  );
}
