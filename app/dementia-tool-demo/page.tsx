'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  Shield,
  Clock,
  Info,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Play,
  BookOpen,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface CarePreferences {
  advancedDementiaStage: string;
  aroundTheClockAssistance: string;
  noLongerRecognizeLovedOnes: string;
  unableToWalkSafely: string;
  unableToBatheClean: string;
  unableToRemainAtHome: string;
  noBladderBowelControl: string;
  noAwarenessOfSurroundings: string;
  unableToCommunicate: string;
}

interface DementiaFormData {
  carePreferences: CarePreferences;
  hospiceCare: {
    interest: string;
  };
  foodAndDrink: {
    stopFoodAndDrink: boolean;
  };
  additionalInfo: string;
}

const CARE_OPTIONS = {
  liveAsLongAsPossible: 'Live as Long as Possible',
  treatButNotAggressively: 'Treat me but Not Aggressively',
  allowNaturalDeath: 'Allow a Natural Death',
};

const HOSPICE_OPTIONS = {
  interested: 'I am interested in Hospice Care to support me and my loved ones',
  notInterested: 'I am not interested in hospice',
  unsure:
    'I am unsure at this time. My surrogate can make that decision on my behalf when the time comes',
};

const SECTIONS = [
  {
    id: 0,
    title: 'Care Preferences',
    description:
      'Select your desired care preferences for different stages of dementia',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    id: 1,
    title: 'Hospice Care',
    description: 'Your preferences regarding hospice care',
    icon: Shield,
    color: 'text-blue-500',
  },
  {
    id: 2,
    title: 'Food and Drink',
    description: 'Your preferences regarding nutrition and hydration',
    icon: Clock,
    color: 'text-orange-500',
  },
  {
    id: 3,
    title: 'Additional Information',
    description: 'Any additional wishes or considerations',
    icon: Info,
    color: 'text-green-500',
  },
];

export default function DementiaToolDemo() {
  const [formData, setFormData] = useState<DementiaFormData>({
    carePreferences: {
      advancedDementiaStage: '',
      aroundTheClockAssistance: '',
      noLongerRecognizeLovedOnes: '',
      unableToWalkSafely: '',
      unableToBatheClean: '',
      unableToRemainAtHome: '',
      noBladderBowelControl: '',
      noAwarenessOfSurroundings: '',
      unableToCommunicate: '',
    },
    hospiceCare: {
      interest: '',
    },
    foodAndDrink: {
      stopFoodAndDrink: false,
    },
    additionalInfo: '',
  });

  const [currentSection, setCurrentSection] = useState(0);

  const handleCarePreferenceChange = (
    field: keyof CarePreferences,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      carePreferences: {
        ...prev.carePreferences,
        [field]: value,
      },
    }));
  };

  const handleHospiceCareChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      hospiceCare: {
        interest: value,
      },
    }));
  };

  const handleFoodAndDrinkChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      foodAndDrink: {
        stopFoodAndDrink: checked,
      },
    }));
  };

  const handleAdditionalInfoChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      additionalInfo: value,
    }));
  };

  const goToNextSection = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < SECTIONS.length) {
      setCurrentSection(sectionIndex);
    }
  };

  const renderCarePreferenceSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If my physician determines my dementia has progressed to advanced or
            late stage, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.advancedDementiaStage}
            onValueChange={(value) =>
              handleCarePreferenceChange('advancedDementiaStage', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`advanced-${key}`} />
                <Label htmlFor={`advanced-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I require around-the-clock (24 hour) assistance and supervision,
            then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.aroundTheClockAssistance}
            onValueChange={(value) =>
              handleCarePreferenceChange('aroundTheClockAssistance', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`assistance-${key}`} />
                <Label htmlFor={`assistance-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I no longer recognize my loved ones, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.noLongerRecognizeLovedOnes}
            onValueChange={(value) =>
              handleCarePreferenceChange('noLongerRecognizeLovedOnes', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`recognition-${key}`} />
                <Label htmlFor={`recognition-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderHospiceCareSection = () => (
    <div>
      <RadioGroup
        value={formData.hospiceCare.interest}
        onValueChange={handleHospiceCareChange}
      >
        {Object.entries(HOSPICE_OPTIONS).map(([key, label]) => (
          <div key={key} className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value={key} id={`hospice-${key}`} />
            <Label htmlFor={`hospice-${key}`} className="text-sm">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderFoodAndDrinkSection = () => (
    <div className="space-y-4">
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          • I no longer appear to desire food or drink, turn my head or
          otherwise avoid being fed
        </p>
        <p>
          • I do not open my mouth to accept food or drink without prompting
        </p>
        <p>
          • I am unable to safely swallow food or drink (cough, choke or
          aspirate)
        </p>
        <p>
          • The negative consequences of continued food or drink outweigh the
          benefits
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="stop-food-drink"
          checked={formData.foodAndDrink.stopFoodAndDrink}
          onCheckedChange={handleFoodAndDrinkChange}
        />
        <Label htmlFor="stop-food-drink" className="text-sm">
          Then I request all food and drink be stopped, including nutrition
          support and hydration
        </Label>
      </div>
    </div>
  );

  const renderAdditionalInfoSection = () => (
    <div>
      <Textarea
        placeholder="Enter any additional information, wishes, or considerations..."
        value={formData.additionalInfo}
        onChange={(e) => handleAdditionalInfoChange(e.target.value)}
        rows={4}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/guest">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Guest Page
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <Play className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">
            firefly Values & Priorities Tool
          </h1>
          <p className="text-muted-foreground">
            A comprehensive tool to help communicate your wishes regarding
            future care if living with firefly
          </p>
        </div>

        {/* Demo Notice */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Play className="h-4 w-4" />
          <AlertDescription>
            This is a demonstration of the firefly Values & Priorities Tool.
            Your responses are not saved in demo mode.
            <Link href="/login" className="ml-2 text-blue-600 hover:underline">
              Sign in to save your progress
            </Link>
          </AlertDescription>
        </Alert>

        {/* Section Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Document Sections</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>
                  Section {currentSection + 1} of {SECTIONS.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SECTIONS.map((section, index) => {
                const IconComponent = section.icon;
                const isActive = index === currentSection;

                return (
                  <button
                    key={section.id}
                    onClick={() => goToSection(index)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className={`h-4 w-4 ${section.color}`} />
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {section.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Section Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const IconComponent = SECTIONS[currentSection].icon;
                return (
                  <IconComponent
                    className={`h-5 w-5 ${SECTIONS[currentSection].color}`}
                  />
                );
              })()}
              {SECTIONS[currentSection].title}
            </CardTitle>
            <p className="text-muted-foreground">
              {SECTIONS[currentSection].description}
            </p>
          </CardHeader>
          <CardContent>
            {currentSection === 0 && renderCarePreferenceSection()}
            {currentSection === 1 && renderHospiceCareSection()}
            {currentSection === 2 && renderFoodAndDrinkSection()}
            {currentSection === 3 && renderAdditionalInfoSection()}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={goToPreviousSection}
                disabled={currentSection === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Section
              </Button>

              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  <p>
                    This document will help guide your medical team and
                    surrogate decision maker(s).
                  </p>
                  <p>Your wishes should be followed as much as possible.</p>
                </div>
              </div>

              <Button
                onClick={goToNextSection}
                disabled={currentSection === SECTIONS.length - 1}
                className="flex items-center gap-2"
              >
                Next Section
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Ready to Get Started?
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                This demo shows you how the firefly Values & Priorities Tool
                works. Sign up to create your account and start planning your
                healthcare wishes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto">
                    <FileText className="mr-2 h-4 w-4" />
                    Sign In to Continue
                  </Button>
                </Link>
                <Link href="/guest">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Guest Page
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
