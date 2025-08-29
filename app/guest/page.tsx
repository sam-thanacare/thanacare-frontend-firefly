'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Heart,
  Shield,
  Stethoscope,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function GuestPage() {
  const features = [
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Compassionate Care",
      description: "Supporting families and healthcare providers with empathy and understanding."
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-500" />,
      title: "Secure & Private",
      description: "Your health information is protected with enterprise-grade security."
    },
    {
      icon: <Users className="h-6 w-6 text-green-500" />,
      title: "Family Focused",
      description: "Tools and resources designed specifically for family caregiving needs."
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-purple-500" />,
      title: "Healthcare Integration",
      description: "Seamlessly connect with healthcare providers and services."
    }
  ];

  const benefits = [
    "Access to educational resources",
    "Family support community",
    "Healthcare provider directory",
    "Care planning tools",
    "Emergency contact management",
    "Appointment scheduling"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/CC-logo-notag.jpg"
                alt="Compassion & Choices"
                className="h-10 w-auto"
                width={40}
                height={40}
                priority
              />
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Thanacare
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Welcome to Thanacare
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Your Healthcare
              <span className="text-blue-600 dark:text-blue-400"> Companion</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover comprehensive healthcare support designed for families, caregivers, and healthcare professionals.
              Join our community of compassionate care providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Thanacare?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're committed to providing exceptional healthcare support with features designed around your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Everything You Need for Better Healthcare
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Access comprehensive tools and resources designed to support your healthcare journey.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/login">
                  <Button size="lg">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Join Our Community</h3>
                <p className="mb-6 opacity-90">
                  Connect with thousands of families and healthcare professionals who trust Thanacare for their healthcare needs.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-semibold">+</div>
                  </div>
                  <span className="text-sm opacity-90">Active users worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Create your account today and join a community dedicated to compassionate healthcare.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-blue-600">
              Explore Features
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Image
                src="/CC-logo-notag.jpg"
                alt="Compassion & Choices"
                className="h-8 w-auto"
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold">Thanacare</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 Thanacare. Compassionate healthcare for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
