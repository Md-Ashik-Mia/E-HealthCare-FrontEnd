import Card from '../ui/Card';

const services = [
    {
        title: 'Cardiology',
        description: 'Expert care for your heart with advanced diagnostics and treatments.',
        icon: '❤️',
    },
    {
        title: 'Neurology',
        description: 'Comprehensive care for neurological disorders and brain health.',
        icon: '🧠',
    },
    {
        title: 'Pediatrics',
        description: 'Specialized healthcare for infants, children, and adolescents.',
        icon: '👶',
    },
    {
        title: 'Orthopedics',
        description: 'Treatment for bones, joints, ligaments, tendons, and muscles.',
        icon: '🦴',
    },
];

export default function Services() {
    return (
        <section id="services" className="bg-white py-20">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">Our Medical Services</h2>
                    <p className="mx-auto max-w-2xl text-gray-600">
                        We offer a wide range of specialized medical services to cater to all your health needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, index) => (
                        <Card key={index} className="text-center hover:-translate-y-2">
                            <div className="mb-4 text-4xl">{service.icon}</div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900">{service.title}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
