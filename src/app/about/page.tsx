export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Our Story</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">Friendly, simple, built by a host for hosts.</p>
      </div>

      <div className="rounded-2xl ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="aspect-[16/9] w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
          Add image here
        </div>
        <div className="p-6 space-y-4 text-gray-800 dark:text-gray-200">
          <p>Hi, I manage multiple properties across different platforms Airbnb, Vrbo, Booking.com and a few more. If you’re a host like me, you probably know the struggle too well.</p>
          <p>For years, I was juggling apps, checking calendars at midnight, worrying about double bookings, refreshing pages again and again… and still, mistakes would slip through. Guests would book the same dates on two different platforms, and I’d have to apologize, refund, and feel terrible about it.</p>
          <p>I was exhausted.</p>
          <p>All I wanted was one simple dashboard where I could see everything every booking, every blocked date, every update in one clean place. Nothing complicated. Nothing fancy. Just something that worked.</p>
          <p>So, I built it for myself.</p>
          <p>A small calendar tool that kept all my properties in sync. And honestly, it changed the way I hosted. No more panic. No more switching apps. No more surprises.</p>
          <p>One day, I showed it to a few fellow hosts. They loved it. They wanted it too.</p>
          <p>So I shared it. And then one of them said, “You should build this properly. A lot of hosts need something like this.”</p>
          <p>And that’s how this product was born not from a business idea, but from a real hosting problem that kept me up at night.</p>
          <p>Today, I’m sharing it with anyone who wants hosting to feel a little easier and a lot more peaceful.</p>
          <p>If you need help setting it up or have any questions, just reach out. I’m always happy to help.</p>
          <p>Cheers.</p>
        </div>
      </div>
    </div>
  );
}