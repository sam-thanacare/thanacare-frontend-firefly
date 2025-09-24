'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Heart,
  Shield,
  Clock,
  Info,
  Save,
  CheckCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  dementiaToolService,
  DementiaDocumentTemplate,
  DementiaResponse,
} from '@/lib/services/dementiaToolService';
import { isAutoSaveEnabled } from '@/lib/config/features';
import { toast } from 'sonner';

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

interface DementiaValuesFormProps {
  assignmentId: string;
  initialData?: AssignmentDetails;
  onSave?: (response: DementiaResponse) => void;
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

// Define sections for pagination
const SECTIONS = [
  {
    id: 0,
    title: 'Care Preferences',
    description:
      'Select your desired care preferences for different stages of dementia',
    icon: Heart,
    color: 'text-red-500',
    fields: [
      'carePreferences.advancedDementiaStage',
      'carePreferences.aroundTheClockAssistance',
      'carePreferences.noLongerRecognizeLovedOnes',
      'carePreferences.unableToWalkSafely',
      'carePreferences.unableToBatheClean',
      'carePreferences.unableToRemainAtHome',
      'carePreferences.noBladderBowelControl',
      'carePreferences.noAwarenessOfSurroundings',
      'carePreferences.unableToCommunicate',
    ],
  },
  {
    id: 1,
    title: 'Hospice Care',
    description: 'Your preferences regarding hospice care',
    icon: Shield,
    color: 'text-blue-500',
    fields: ['hospiceCare.interest'],
  },
  {
    id: 2,
    title: 'Food and Drink',
    description: 'Your preferences regarding nutrition and hydration',
    icon: Clock,
    color: 'text-orange-500',
    fields: ['foodAndDrink.stopFoodAndDrink'],
  },
  {
    id: 3,
    title: 'Additional Information',
    description: 'Any additional wishes or considerations',
    icon: Info,
    color: 'text-green-500',
    fields: ['additionalInfo'],
  },
];

interface AssignmentDetails {
  assignment: {
    id: string;
    status: string;
    assigned_at: string;
    due_date?: string;
    notes?: string;
  };
  document: {
    id: string;
    title: string;
    description: string;
    content: string;
  };
  trainer: {
    name: string;
  };
  family: {
    name: string;
  };
  response?: {
    id: string;
    responses: string;
    progress: number;
    started_at: string;
    completed_at?: string;
    section_progress?: string;
    last_saved_at?: string;
    auto_save_enabled?: boolean;
  };
}

export default function DementiaValuesForm({
  assignmentId,
  initialData,
  onSave,
}: DementiaValuesFormProps) {
  console.log('🔄 DementiaValuesForm: Component initialized');
  console.log('🆔 DementiaValuesForm: Assignment ID:', assignmentId);
  console.log('📄 DementiaValuesForm: Initial data:', initialData);

  const { user, isAuthenticated } = useAuth();
  console.log('👤 DementiaValuesForm: User authenticated:', isAuthenticated);
  console.log('👤 DementiaValuesForm: User:', user);

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

  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<number[]>([
    0, 0, 0, 0,
  ]);
  // Use feature flag instead of user preference
  const autoSaveEnabled = isAutoSaveEnabled();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Use ref to store latest form data to avoid dependency issues
  const formDataRef = useRef(formData);
  const progressRef = useRef(progress);
  const sectionProgressRef = useRef(sectionProgress);

  // Update refs whenever state changes
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    sectionProgressRef.current = sectionProgress;
  }, [sectionProgress]);

  // Load initial data if provided
  useEffect(() => {
    if (initialData && initialData.response && initialData.response.responses) {
      try {
        const parsedData = JSON.parse(
          initialData.response.responses
        ) as DementiaDocumentTemplate;
        setFormData({
          carePreferences: {
            advancedDementiaStage:
              parsedData.care_preferences.advanced_dementia_stage || '',
            aroundTheClockAssistance:
              parsedData.care_preferences.around_the_clock_assistance || '',
            noLongerRecognizeLovedOnes:
              parsedData.care_preferences.no_longer_recognize_loved_ones || '',
            unableToWalkSafely:
              parsedData.care_preferences.unable_to_walk_safely || '',
            unableToBatheClean:
              parsedData.care_preferences.unable_to_bathe_clean || '',
            unableToRemainAtHome:
              parsedData.care_preferences.unable_to_remain_at_home || '',
            noBladderBowelControl:
              parsedData.care_preferences.no_bladder_bowel_control || '',
            noAwarenessOfSurroundings:
              parsedData.care_preferences.no_awareness_of_surroundings || '',
            unableToCommunicate:
              parsedData.care_preferences.unable_to_communicate || '',
          },
          hospiceCare: {
            interest: parsedData.hospice_care.interest || '',
          },
          foodAndDrink: {
            stopFoodAndDrink:
              parsedData.food_and_drink.stop_food_and_drink || false,
          },
          additionalInfo: parsedData.additional_info || '',
        });

        // Load section progress if available
        if (initialData.response.section_progress) {
          try {
            const parsedSectionProgress = JSON.parse(
              initialData.response.section_progress
            );
            if (Array.isArray(parsedSectionProgress)) {
              setSectionProgress(parsedSectionProgress);
            }
          } catch (error) {
            console.error('Failed to parse section progress:', error);
          }
        }

        // Auto-save preference is now controlled by feature flag

        // Load last saved timestamp
        if (initialData.response.last_saved_at) {
          setLastSaved(new Date(initialData.response.last_saved_at));
        }

        // Load existing progress if available
        if (initialData.response.progress !== undefined) {
          setProgress(initialData.response.progress);
        }
      } catch (error) {
        console.error('Failed to parse initial data:', error);
      }
    }
  }, [initialData]);

  const handleSave = useCallback(async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in to save your responses');
      return;
    }

    if (!assignmentId) {
      toast.error('No assignment ID provided');
      return;
    }

    if (!initialData?.document?.id) {
      toast.error('Document information not available');
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Use refs to get the latest values without causing dependency issues
      const currentFormData = formDataRef.current;
      const currentProgress = progressRef.current;
      const currentSectionProgress = sectionProgressRef.current;

      // Convert form data to backend format
      const backendData = {
        assignment_id: assignmentId,
        member_id: user.id, // Add member ID from authenticated user
        document_id: initialData?.document?.id || '', // Use document ID from initial data
        responses: JSON.stringify({
          care_preferences: {
            advanced_dementia_stage:
              currentFormData.carePreferences.advancedDementiaStage,
            around_the_clock_assistance:
              currentFormData.carePreferences.aroundTheClockAssistance,
            no_longer_recognize_loved_ones:
              currentFormData.carePreferences.noLongerRecognizeLovedOnes,
            unable_to_walk_safely:
              currentFormData.carePreferences.unableToWalkSafely,
            unable_to_bathe_clean:
              currentFormData.carePreferences.unableToBatheClean,
            unable_to_remain_at_home:
              currentFormData.carePreferences.unableToRemainAtHome,
            no_bladder_bowel_control:
              currentFormData.carePreferences.noBladderBowelControl,
            no_awareness_of_surroundings:
              currentFormData.carePreferences.noAwarenessOfSurroundings,
            unable_to_communicate:
              currentFormData.carePreferences.unableToCommunicate,
          },
          hospice_care: {
            interest: currentFormData.hospiceCare.interest,
          },
          food_and_drink: {
            stop_food_and_drink: currentFormData.foodAndDrink.stopFoodAndDrink,
          },
          additional_info: currentFormData.additionalInfo,
        }),
        progress: currentProgress,
        section_progress: JSON.stringify(currentSectionProgress),
        auto_save_enabled: autoSaveEnabled,
      };

      const response = await dementiaToolService.saveResponse(backendData);

      setSaveStatus('saved');
      setLastSaved(new Date());
      toast.success('Your responses have been saved successfully!');

      if (onSave) {
        onSave(response);
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save response:', error);
      setSaveStatus('error');
      toast.error(
        'There was an error saving your responses. Please try again.'
      );
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [
    isAuthenticated,
    user,
    assignmentId,
    initialData?.document?.id,
    autoSaveEnabled,
    onSave,
  ]);

  // Calculate progress whenever form data changes
  useEffect(() => {
    const newSectionProgress = SECTIONS.map((section) => {
      let completedFields = 0;
      const totalFields = section.fields.length;

      section.fields.forEach((fieldPath) => {
        const fieldValue = getFieldValue(formData, fieldPath);
        // For radio buttons, check if value is not empty string
        // For checkboxes, check if value is true
        // For text areas, check if value is not empty string
        if (fieldPath.includes('stopFoodAndDrink')) {
          // This is a checkbox field
          if (fieldValue === true) {
            completedFields++;
          }
        } else {
          // These are radio button or text fields
          if (fieldValue && fieldValue !== '' && fieldValue !== null) {
            completedFields++;
          }
        }
      });

      return totalFields > 0
        ? Math.round((completedFields / totalFields) * 100)
        : 0;
    });

    setSectionProgress(newSectionProgress);

    // Calculate overall progress
    const totalFields = SECTIONS.reduce(
      (sum, section) => sum + section.fields.length,
      0
    );
    const completedFields = newSectionProgress.reduce(
      (sum, sectionProgress, index) => {
        return (
          sum +
          Math.round((sectionProgress / 100) * SECTIONS[index].fields.length)
        );
      },
      0
    );

    const newProgress =
      totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
    setProgress(newProgress);
  }, [formData]);

  // Separate effect for auto-save to prevent infinite loops
  useEffect(() => {
    if (!autoSaveEnabled || !assignmentId || progressRef.current === 0) {
      return;
    }

    // Check if there's any actual content to save using refs
    const currentFormData = formDataRef.current;
    const hasContent =
      Object.values(currentFormData.carePreferences).some(
        (value) => value !== ''
      ) ||
      currentFormData.hospiceCare.interest !== '' ||
      currentFormData.foodAndDrink.stopFoodAndDrink ||
      currentFormData.additionalInfo !== '';

    if (hasContent) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [autoSaveEnabled, assignmentId, handleSave]);

  // Helper function to get nested field values
  const getFieldValue = (data: DementiaFormData, fieldPath: string) => {
    const parts = fieldPath.split('.');
    let value: unknown = data;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        return null;
      }
    }

    return value;
  };

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

  // Navigation functions
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

  const handleGeneratePDF = async () => {
    if (!assignmentId) {
      toast.error('No assignment ID provided');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await dementiaToolService.generatePDF(assignmentId);
      dementiaToolService.downloadPDF(
        pdfBlob,
        `dementia-tool-${assignmentId}.pdf`
      );
      toast.success('PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
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

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I am unable to walk or move safely without assistance from a
            caregiver, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.unableToWalkSafely}
            onValueChange={(value) =>
              handleCarePreferenceChange('unableToWalkSafely', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`walking-${key}`} />
                <Label htmlFor={`walking-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I am unable to bathe and clean myself without assistance from a
            caregiver, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.unableToBatheClean}
            onValueChange={(value) =>
              handleCarePreferenceChange('unableToBatheClean', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`bathing-${key}`} />
                <Label htmlFor={`bathing-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I am unable to remain at home and have to live in a nursing
            facility, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.unableToRemainAtHome}
            onValueChange={(value) =>
              handleCarePreferenceChange('unableToRemainAtHome', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`home-${key}`} />
                <Label htmlFor={`home-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I no longer have control of my bladder or bowels, then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.noBladderBowelControl}
            onValueChange={(value) =>
              handleCarePreferenceChange('noBladderBowelControl', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`bladder-${key}`} />
                <Label htmlFor={`bladder-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I am no longer aware of my surroundings (where I am, the
            date/year, who is with me), then I want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.noAwarenessOfSurroundings}
            onValueChange={(value) =>
              handleCarePreferenceChange('noAwarenessOfSurroundings', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`awareness-${key}`} />
                <Label htmlFor={`awareness-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">
            If I am unable to clearly communicate my thoughts or needs, then I
            want:
          </Label>
          <RadioGroup
            value={formData.carePreferences.unableToCommunicate}
            onValueChange={(value) =>
              handleCarePreferenceChange('unableToCommunicate', value)
            }
          >
            {Object.entries(CARE_OPTIONS).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={`communication-${key}`} />
                <Label htmlFor={`communication-${key}`} className="text-sm">
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">firefly Values & Priorities Tool</h1>
        <p className="text-muted-foreground">
          A comprehensive tool to help communicate your wishes regarding future
          care if living with firefly
        </p>
      </div>

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
              const isCompleted = sectionProgress[index] === 100;
              const hasProgress = sectionProgress[index] > 0;

              return (
                <button
                  key={section.id}
                  onClick={() => goToSection(index)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    isActive
                      ? 'border-primary bg-primary/5'
                      : isCompleted
                        ? 'border-green-500 bg-green-50'
                        : hasProgress
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className={`h-4 w-4 ${section.color}`} />
                    <span className="text-sm font-medium">{section.title}</span>
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {section.description}
                  </div>
                  <Progress value={sectionProgress[index]} className="h-1" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {sectionProgress[index]}% complete
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Auto-save is now controlled by feature flag */}
          </div>
        </CardContent>
      </Card>

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <Alert
          className={
            saveStatus === 'error'
              ? 'border-red-200 bg-red-50'
              : 'border-green-200 bg-green-50'
          }
        >
          {saveStatus === 'saving' && (
            <AlertDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Saving your responses...
            </AlertDescription>
          )}
          {saveStatus === 'saved' && (
            <AlertDescription className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              Your responses have been saved successfully!
              {lastSaved && (
                <span className="text-xs ml-2">
                  (Last saved: {lastSaved.toLocaleTimeString()})
                </span>
              )}
            </AlertDescription>
          )}
          {saveStatus === 'error' && (
            <AlertDescription className="flex items-center gap-2 text-red-700">
              <Info className="h-4 w-4" />
              There was an error saving your responses. Please try again.
            </AlertDescription>
          )}
        </Alert>
      )}

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
          <CardDescription>
            {SECTIONS[currentSection].description}
          </CardDescription>
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
              <ChevronLeft className="h-4 w-4" />
              Previous Section
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <p>
                  This document will help guide your medical team and surrogate
                  decision maker(s).
                </p>
                <p>Your wishes should be followed as much as possible.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Progress
                  </>
                )}
              </Button>

              {progress === 100 && (
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="min-w-[140px]"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={goToNextSection}
                disabled={currentSection === SECTIONS.length - 1}
                className="flex items-center gap-2"
              >
                Next Section
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Status */}
      {progress === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Congratulations! You have completed the firefly Values &
                Priorities Tool.
              </span>
            </div>
            <p className="text-sm text-green-600 mt-2">
              Please review your responses and save them. Consider sharing this
              document with your loved ones and healthcare providers.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
