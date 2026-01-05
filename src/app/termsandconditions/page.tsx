export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Terms & Conditions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: 19/11/25</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          These Terms & Conditions govern your use of iCal Sync (“the Service”). By using iCal Sync, you agree to these terms.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Using the Service</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>You must provide accurate calendar links and property data.</li>
          <li>You are responsible for ensuring your OTA accounts (Airbnb, Vrbo, etc.) are correct.</li>
          <li>The Service relies on each OTA’s refresh schedule — we cannot control when they update.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Subscriptions & Billing</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Subscription plans renew monthly until cancelled.</li>
          <li>Payments are non-refundable unless otherwise stated.</li>
          <li>You may cancel anytime, and your plan will remain active until the end of the billing period.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Service Availability</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">We aim to provide continuous uptime, but we do not guarantee:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Uninterrupted syncing</li>
          <li>Error-free operation</li>
          <li>Instant OTA updates (as each platform controls its refresh speed)</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">We are not liable for delays caused by Airbnb, Vrbo, Booking.com, or other OTAs.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Limitation of Liability</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>We are not responsible for losses caused by OTA update delays.</li>
          <li>We are not responsible for incorrect or altered iCal feeds from OTAs.</li>
          <li>We are not responsible for double bookings resulting from OTA-side issues.</li>
          <li>In no event shall iCalSync, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</li>
          <li>We provide a calendar synchronization service for property managers. We are not responsible for the accuracy of the data provided from third-party calendar providers. While we strive to prevent double bookings, we are not liable for any financial loss or damages resulting from scheduling errors.</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">Our service is a supportive tool, not an official OTA integration.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Use the service legally and honestly.</li>
          <li>Do not attempt to disrupt servers or misuse the API.</li>
          <li>Keep your login and calendar links secure.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Suspension of Service</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>We may suspend access for misuse.</li>
          <li>We may suspend access for security risks.</li>
          <li>We may suspend access for unpaid subscriptions.</li>
          <li>We may suspend access for violation of these terms.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          For any issues, contact: <a href="mailto:icalsync.app@gmail.com" className="underline">icalsync.app@gmail.com</a>
        </p>
      </section>
    </div>
  );
}