export default function SupportPage() {
  return (
    <div className="min-h-full flex flex-col">
      <div className="px-8 pt-7 pb-0">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Support</h1>
          <p className="text-xs text-gray-400 mt-0.5">Get help with your Lead Invest account</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
          <a
            href="mailto:kushagra@leadinvest.in"
            className="bg-white border border-gray-200 rounded-xl px-6 py-5 hover:border-[#8B1A1A]/30 hover:bg-red-50/20 transition-all group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#8B1A1A]/10 flex items-center justify-center mb-4">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-[#8B1A1A] transition-colors mb-1">
              Email your fund manager
            </p>
            <p className="text-xs text-gray-400 mb-2">
              For questions about your investment, valuations, or documents.
            </p>
            <p className="text-xs font-medium text-[#8B1A1A]">kushagra@leadinvest.in</p>
          </a>

          <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">Response time</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We typically respond within 1–2 business days. For urgent matters, please mention
              it in your subject line.
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
            Common questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-sm font-semibold text-gray-800 mb-1.5">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto px-8 py-6 border-t border-gray-100">
        <p className="text-[11px] text-gray-400">
          Lead Invest · Investor portal · Questions?{" "}
          <a href="mailto:kushagra@leadinvest.in" className="text-[#8B1A1A] hover:underline">
            kushagra@leadinvest.in
          </a>
        </p>
      </footer>
    </div>
  );
}

const FAQS = [
  {
    q: "How are my holding valuations calculated?",
    a: "Valuations are estimates based on the last known round price or an internal assessment by Lead Invest. They are updated each quarter after we receive company financials. These are unaudited estimates and may differ from the final audited figures.",
  },
  {
    q: "When will I receive a capital call notice?",
    a: "You will receive an email from noreply@kushagrasanwal.com at least two weeks before a drawdown is due. The notice will include the amount, due date, bank details, and the company it relates to. You can also see upcoming calls in the Cash Flows section of this portal.",
  },
  {
    q: "What do MOIC and DPI mean?",
    a: "MOIC (Multiple on Invested Capital) is your current holding value divided by capital deployed — it shows how much your deployed capital has grown in value. DPI (Distributions to Paid-In) is distributions received divided by capital deployed. A DPI of 0 means no cash has been returned yet, which is normal at this stage.",
  },
  {
    q: "How do I update my contact details or bank account?",
    a: "Please email kushagra@leadinvest.in with your updated details. Do not share sensitive information (account numbers, ID documents) on this portal.",
  },
  {
    q: "Where can I find my subscription agreement?",
    a: "Your subscription agreement is available in the Documents section of this portal. If you cannot find it, contact us and we will resend it.",
  },
];
