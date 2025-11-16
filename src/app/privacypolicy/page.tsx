export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">📄 Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: 19/11/25</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          iCal Sync (“we”, “our”, “us”) provides a calendar-syncing tool for short-term rental hosts. This Privacy Policy explains how we collect, use and protect your information when you use our website and services.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Information We Collect</h2>
        <h3 className="text-base font-medium">1. Data you provide</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Email address (when you contact us)</li>
          <li>Calendar URLs (iCal links you connect)</li>
          <li>Property names you add</li>
          <li>Any messages you send us for support</li>
        </ul>
        <h3 className="text-base font-medium">2. Data we receive automatically</h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Basic device information</li>
          <li>Browser type</li>
          <li>IP address</li>
          <li>Usage data (pages viewed, actions taken)</li>
        </ul>
        <h3 className="text-base font-medium">3. Cookies</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We may use cookies or analytics tools to improve the product and understand user behavior.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Use Your Data</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">We use your data to:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Sync your calendars across platforms</li>
          <li>Display your bookings in your dashboard</li>
          <li>Send conflict alerts or notifications</li>
          <li>Respond to support requests</li>
          <li>Improve product performance and reliability</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We do not sell or share your data with third parties for marketing.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">How We Store and Protect Data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Your calendar data is encrypted in transit (HTTPS).</li>
          <li>Access to your information is limited to essential operations only.</li>
          <li>We never modify your OTA accounts directly — only process iCal feeds.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Sharing Your Information</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">We only share data when required to:</p>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          <li>Provide the syncing service</li>
          <li>Comply with legal or security obligations</li>
        </ul>
        <p className="text-sm text-gray-700 dark:text-gray-300">We do not sell, rent or trade user information.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Data Deletion</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          You can request full deletion of your data anytime by emailing: <a href="mailto:icalsync.app@gmail.com" className="underline">icalsync.app@gmail.com</a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Changes to This Policy</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          We may update this privacy policy as needed. We will update the “Last updated” date accordingly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Contact</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          If you have any questions, reach out at: <a href="mailto:icalsync.app@gmail.com" className="underline">icalsync.app@gmail.com</a>
        </p>
      </section>
    </div>
  );
}