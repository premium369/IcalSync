import BillingInner from "./billing-page";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Update your preferences and account options.</p>
      </div>

      <BillingInner />
    </div>
  );
}