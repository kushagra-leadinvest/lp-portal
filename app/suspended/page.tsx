import Image from "next/image";
import Link from "next/link";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Image
          src="/logo.png"
          alt="Lead Invest"
          width={120}
          height={56}
          className="h-12 w-auto mx-auto mb-8"
        />

        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Account suspended
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Your investor account has been temporarily suspended. Please contact
          us if you believe this is an error or to resolve the issue.
        </p>

        <a
          href="mailto:support@leadinvest.in"
          className="inline-block px-5 py-2.5 bg-[#8B1A1A] hover:bg-[#7a1717] text-white text-sm font-medium rounded-lg transition"
        >
          Contact support
        </a>

        <p className="mt-6 text-xs text-gray-400">
          Already resolved?{" "}
          <Link href="/login" className="text-[#8B1A1A] hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
