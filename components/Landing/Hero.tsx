import Link from 'next/link';
import Button from '../ui/Button';

export default function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white py-20 lg:py-32">
            <div className="container mx-auto px-4 text-center">
                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 lg:text-7xl">
                    Advanced Healthcare <br />
                    <span className="text-blue-600">For a Better Life</span>
                </h1>
                <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 lg:text-xl">
                    Experience world-class medical care with our state-of-the-art digital platform.
                    Connect with top specialists, manage your health records, and book appointments with ease.
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href="/login">
                        <Button size="lg">Get Started</Button>
                    </Link>
                    <Link href="#services">
                        <Button variant="outline" size="lg">Learn More</Button>
                    </Link>
                </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-200 opacity-30 blur-3xl filter"></div>
            <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-teal-200 opacity-30 blur-3xl filter"></div>
        </section>
    );
}
