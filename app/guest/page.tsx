'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, FileText, Users, Play, ExternalLink } from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  link?: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ChecklistItem[];
}

export default function GuestPage() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: 'education',
      title: 'Education',
      description:
        'Understanding care options Determining values and priorities',
      icon: BookOpen,
      items: [
        {
          id: 'eol-checklist',
          title: 'Planning Checklists',
          completed: true,
        },
        {
          id: 'copd-guide',
          title: 'COPD - What Does It Mean For ME?',
          completed: false,
        },
        {
          id: 'maid-handbook',
          title: 'Medical Handbook',
          completed: false,
        },
        {
          id: 'vsed-handbook',
          title: 'Voluntary Handbook',
          completed: false,
        },
      ],
    },
    {
      id: 'document-completion',
      title: 'Document Completion',
      description:
        'Identifying and educating a healthcare proxy Completing advance directives Making firefly-specific care plans',
      icon: FileText,
      items: [
        {
          id: 'dementia-values',
          title: 'Values & Priorities',
          completed: false,
          link: '/firefly-documents-demo',
        },
        {
          id: 'visitation-auth',
          title: 'Hospital Visitation Authorization',
          completed: false,
        },
        {
          id: 'healthcare-agent',
          title: 'Name My Healthcare Agent',
          completed: false,
        },
      ],
    },
    {
      id: 'care-team',
      title: 'Aligning Your Care Team',
      description:
        'Share your Documents Facilitating conversations with loved ones and doctors',
      icon: Users,
      items: [
        {
          id: 'life-therapies',
          title: 'My Particular Wishes for Therapies',
          completed: false,
        },
        {
          id: 'provider-letter',
          title: 'Letter to Medical Providers',
          completed: false,
        },
        {
          id: 'primary-care',
          title: 'Share with my Primary Care Provider',
          completed: false,
        },
        {
          id: 'family-share',
          title: 'Share with my Family and Loved Ones',
          completed: false,
        },
      ],
    },
  ]);

  const handleItemToggle = (sectionId: string, itemId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : section
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Image
                src="/firefly.png"
                alt="Thanacare"
                className="h-12 w-auto object-contain"
                width={150}
                height={48}
                priority
              />
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            Thanacare&apos;s Healthcare Planning Platform. Below are options you
            may select from to help communicate your wishes regarding future
            care.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {sections.map((section) => {
            const IconComponent = section.icon;

            return (
              <Card key={section.id} className="h-fit">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {section.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() =>
                          handleItemToggle(section.id, item.id)
                        }
                        className="mt-1"
                      />
                      <label
                        htmlFor={item.id}
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                      >
                        {item.title}
                      </label>
                      {item.link && (
                        <Link href={item.link}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Dementia Tool Tour Section */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Play className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Take a Tour of the firefly Tool
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Experience our comprehensive firefly Values & Priorities tool
                that helps you communicate your wishes for future care. This
                interactive demo will guide you through the process step by
                step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* <Link href="/dementia-tool-demo">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Play className="mr-2 h-4 w-4" />
                    Start firefly Tool Tour
                  </Button>
                </Link> */}
                <Link href="/firefly-documents-demo">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Member Experience
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Image
                src="/firefly.png"
                alt="Thanacare"
                className="h-10 w-auto object-contain"
                width={120}
                height={40}
              />
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2025 Thanacare. Empowering healthcare for everyone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
