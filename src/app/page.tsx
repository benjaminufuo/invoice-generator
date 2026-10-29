import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs group-hover:bg-zinc-800 transition-colors">
              IG
            </div>
            <span className="text-base font-bold text-zinc-900 tracking-tight">
              Invoice<span className="text-indigo-600">Gen</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs sm:text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-2xs border border-zinc-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/80 mb-6 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Multi-Currency Engine • Nigerian Naira (NGN) & US Dollars (USD)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight max-w-3xl mx-auto leading-[1.12]">
            Professional invoices, calculated with precision.
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            The minimalist invoicing solution engineered for freelancers, consultants, and independent agencies. Manage recurring clients, issue invoices in seconds, and export clean PDFs.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm border border-zinc-800 transition-all active:scale-[0.99]"
            >
              Create Your First Invoice
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-lg shadow-2xs transition-all"
            >
              Sign In with Google or Email
            </Link>
          </div>

          {/* Restrained UI Mockup / Preview Card */}
          <div className="mt-14 max-w-3xl mx-auto bg-white rounded-2xl border border-zinc-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden text-left">
            {/* Window bar */}
            <div className="px-5 py-3 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                invoice-preview — INV-2026-0012
              </div>
              <div className="w-10"></div>
            </div>

            {/* Document Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                    Billed To
                  </div>
                  <div className="text-base font-bold text-zinc-900 mt-1">
                    Acme Digital Partners
                  </div>
                  <div className="text-xs text-zinc-500">billing@acmedigital.com</div>
                </div>
                <div className="sm:text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                    Paid
                  </span>
                  <div className="text-xs text-zinc-500 mt-2">Issue Date: Oct 28, 2026</div>
                  <div className="text-xs text-zinc-500">Currency: NGN (₦)</div>
                </div>
              </div>

              {/* Table preview */}
              <div className="overflow-x-auto border-t border-b border-zinc-100 py-3">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-zinc-400 uppercase tracking-wider text-[10px]">
                      <th className="text-left pb-2">Description</th>
                      <th className="text-center pb-2">Qty</th>
                      <th className="text-right pb-2">Unit Price</th>
                      <th className="text-right pb-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-zinc-700">
                    <tr>
                      <td className="py-2.5 font-medium text-zinc-900">
                        Product Interface Design (Sprint 1 & 2)
                      </td>
                      <td className="py-2.5 text-center">2</td>
                      <td className="py-2.5 text-right">₦250,000.00</td>
                      <td className="py-2.5 text-right font-semibold text-zinc-900">
                        ₦500,000.00
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-medium text-zinc-900">
                        Next.js Frontend Architecture Setup
                      </td>
                      <td className="py-2.5 text-center">1</td>
                      <td className="py-2.5 text-right">₦150,000.00</td>
                      <td className="py-2.5 text-right font-semibold text-zinc-900">
                        ₦150,000.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total preview */}
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-xs text-zinc-500">Total Due (Authoritative Server Total)</span>
                <span className="text-lg font-bold text-zinc-950 font-mono">
                  ₦650,000.00
                </span>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl border border-zinc-200/90 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-sm mb-4 border border-zinc-200/60">
                ₦/$
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Multi-Currency Support
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Issue invoices in Nigerian Naira (NGN) or US Dollars (USD). Integer-minor-unit calculations protect against floating-point rounding errors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200/90 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-sm mb-4 border border-zinc-200/60">
                PDF
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Instant PDF Document Generation
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Generate clean, publication-ready PDF documents ready for clients, accountants, and print with one click.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200/90 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold text-sm mb-4 border border-zinc-200/60">
                🔒
              </div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Private & User-Isolated
              </h2>
              <p className="mt-1.5 text-xs text-zinc-500 leading-relaxed">
                Better Auth verification and server-side MongoDB ownership filtering guarantee your customer and invoice records are strictly private.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800">InvoiceGen</span>
            <span>•</span>
            <span>Minimalist financial software</span>
          </div>
          <div>
            Built with Next.js, TypeScript, Better Auth, and MongoDB
          </div>
        </div>
      </footer>
    </div>
  );
}
