import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-2xl font-bold text-primary-600">AccordFlow</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to AccordFlow</h2>
          <p className="mt-2 text-gray-600">
            Multi-tenant VA CRM - Manage your client lifecycle from contact to payment
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <WorkflowCard
            title="Contacts"
            description="Manage your client contacts and leads"
            href="/contacts"
            icon="👤"
          />
          <WorkflowCard
            title="Opportunities"
            description="Track sales opportunities and deals"
            href="/opportunities"
            icon="💼"
          />
          <WorkflowCard
            title="Proposals"
            description="Create and send proposals"
            href="/proposals"
            icon="📄"
          />
          <WorkflowCard
            title="Agreements"
            description="Manage signed agreements"
            href="/agreements"
            icon="✍️"
          />
          <WorkflowCard
            title="Invoices"
            description="Generate and track invoices"
            href="/invoices"
            icon="🧾"
          />
          <WorkflowCard
            title="Payments"
            description="Monitor payment status"
            href="/payments"
            icon="💰"
          />
        </div>

        <div className="mt-12 rounded-lg bg-white p-6 shadow">
          <h3 className="text-xl font-semibold text-gray-900">Activity Timeline</h3>
          <p className="mt-2 text-gray-600">Recent activity will appear here</p>
        </div>
      </main>
    </div>
  );
}

function WorkflowCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg bg-white p-6 shadow transition hover:shadow-lg"
    >
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </Link>
  );
}
