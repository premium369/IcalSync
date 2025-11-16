export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Refund & Cancellation Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: 19/11/25</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">We aim to make the refund and cancellation process simple and clear.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Cancellations</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">You can cancel your subscription anytime. Your access will continue until the end of your current billing cycle.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Refunds</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">Because the service runs automatically as soon as you connect calendars, we do not offer refunds for:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Partial months</li>
          <li>Accidental purchases</li>
          <li>Forgetting to cancel</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">However, we will consider refunds for:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Duplicate payments</li>
          <li>Billing errors</li>
          <li>Technical issues preventing the service from working at all</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">To request a review, email: <a href="mailto:icalsync.app@gmail.com" className="underline">icalsync.app@gmail.com</a></p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Billing Disputes</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">If something feels incorrect in your invoice, please contact us and we will help resolve it quickly.</p>
      </section>
    </div>
  );
}