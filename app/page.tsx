import Hero from '@/components/Landing/Hero';
import Services from '@/components/Landing/Services';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white/80 px-6 py-4 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-blue-600">MediCare+</div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      <Hero />

      <Services />

      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">Choose Your Portal</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="hover:border-blue-500 border-2 border-transparent">
              <div className="mb-4 text-5xl">🤒</div>
              <h3 className="mb-2 text-xl font-bold">Patient</h3>
              <p className="mb-6 text-gray-600">Access your health records and book appointments.</p>
              <Link href="/login">
                <Button className="w-full">Login as Patient</Button>
              </Link>
            </Card>
            <Card className="hover:border-teal-500 border-2 border-transparent">
              <div className="mb-4 text-5xl">👨‍⚕️</div>
              <h3 className="mb-2 text-xl font-bold">Doctor</h3>
              <p className="mb-6 text-gray-600">Manage your schedule and patient consultations.</p>
              <Link href="/login">
                <Button variant="secondary" className="w-full">Login as Doctor</Button>
              </Link>
            </Card>
            <Card className="hover:border-gray-800 border-2 border-transparent">
              <div className="mb-4 text-5xl">🏥</div>
              <h3 className="mb-2 text-xl font-bold">Admin</h3>
              <p className="mb-6 text-gray-600">Oversee hospital operations and staff management.</p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Login as Admin</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 py-12 text-white">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 MediCare+. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
