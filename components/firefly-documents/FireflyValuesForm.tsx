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
  User,
  Home,
  Cross,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  fireflyDocumentsService,
  FireflyDocumentTemplate,
  FireflyResponse,
} from '@/lib/services/fireflyDocumentsService';
import { isAutoSaveEnabled } from '@/lib/config/features';
import { toast } from 'sonner';

interface FireflyFormData {
  about_me: {
    medical_team_members: string;
  };
  quality_of_life: {
    recognize_loved_ones: boolean;
    independent_physical_care: boolean;
    walk: boolean;
    religious_cultural_practices: boolean;
    enjoy_food_drink: boolean;
    live_in_own_home: boolean;
    bowel_bladder_control: boolean;
    be_with_pets: boolean;
    hobbies: string;
    other: string;
  };
  comfort_and_strength: {
    visits_with_loved_ones: string;
    prayer_spiritual_practices: string;
    spending_time_outside: boolean;
    listening_to: string;
    scents: string;
    favorite_foods_drinks: string;
    favorite_shows_movies: string;
    other: string;
  };
  health_decline: {
    spend_time_with_loved_ones: boolean;
    stay_in_home: boolean;
    not_burden_on_loved_ones: boolean;
    control_of_medical_care: boolean;
    direct_medical_team: boolean;
    attempt_every_treatment: boolean;
    not_in_hospital_machines: boolean;
    loved_ones_have_support: boolean;
    loved_ones_dont_fight: boolean;
    not_alone: boolean;
    other: string;
  };
  cultural_religious_beliefs: string;
  cpr: {
    preference: string;
    comment: string;
  };
  life_sustaining_treatments: {
    experience: string;
  };
  treatment_scenarios: {
    temporary_no_mental_capacity: string;
    fully_dependent_on_others: string;
    permanently_lose_recognition: string;
    breathing_machine_bed_bound: string;
    vegetative_state_coma: string;
    terminal_condition: string;
    additional_comments: string;
  };
  pain_medication: {
    keep_comfortable_less_alert: boolean;
    homeopathic_natural_remedies: boolean;
    natural_remedies_list: string;
    only_as_last_resort: boolean;
    substance_use_history: string;
    palliative_care_referral: boolean;
    agent_decide: boolean;
    comments: string;
  };
  terminal_condition: {
    told_as_soon_as_possible: boolean;
    dont_know_until_decision: boolean;
    hospice_care_referral: boolean;
    try_every_available_treatment: boolean;
  };
  end_of_life_location: {
    hospital: boolean;
    care_center: boolean;
    home: boolean;
    home_caregiver: string;
  };
  end_of_life_details: {
    who_at_bedside: string;
    cultural_religious_aspects: string;
    other_details: string;
    additional_comments: string;
  };
  donation: {
    donate_organs_tissues: boolean;
    registered_with: string;
    donation_stipulations: string;
    whole_body_anatomical_study: boolean;
    anatomical_study_org: string;
    do_not_wish_to_donate: boolean;
    agent_decide: boolean;
  };
  autopsy: {
    benefit_others: boolean;
    not_unless_required: boolean;
    agent_decide: boolean;
  };
  body_care: {
    preference: string;
    details: string;
  };
  funeral_celebration: {
    details: string;
  };
}

interface FireflyValuesFormProps {
  assignmentId: string;
  initialData?: AssignmentDetails;
  onSave?: (response: FireflyResponse) => void;
}

const SECTIONS = [
  {
    id: 0,
    title: 'About Me',
    description: 'Important members of my medical team',
    icon: User,
    color: 'text-blue-500',
    fields: ['about_me.medical_team_members'],
  },
  {
    id: 1,
    title: 'Quality of Life',
    description: 'What brings meaning to my life',
    icon: Heart,
    color: 'text-red-500',
    fields: [
      'quality_of_life.recognize_loved_ones',
      'quality_of_life.independent_physical_care',
      'quality_of_life.walk',
      'quality_of_life.religious_cultural_practices',
      'quality_of_life.enjoy_food_drink',
      'quality_of_life.live_in_own_home',
      'quality_of_life.bowel_bladder_control',
      'quality_of_life.be_with_pets',
      'quality_of_life.hobbies',
      'quality_of_life.other',
    ],
  },
  {
    id: 2,
    title: 'Comfort & Strength',
    description: 'What brings me comfort during hard times',
    icon: Shield,
    color: 'text-green-500',
    fields: [
      'comfort_and_strength.visits_with_loved_ones',
      'comfort_and_strength.prayer_spiritual_practices',
      'comfort_and_strength.spending_time_outside',
      'comfort_and_strength.listening_to',
      'comfort_and_strength.scents',
      'comfort_and_strength.favorite_foods_drinks',
      'comfort_and_strength.favorite_shows_movies',
      'comfort_and_strength.other',
    ],
  },
  {
    id: 3,
    title: 'Health Decline',
    description: 'What is important as my health declines',
    icon: Clock,
    color: 'text-orange-500',
    fields: [
      'health_decline.spend_time_with_loved_ones',
      'health_decline.stay_in_home',
      'health_decline.not_burden_on_loved_ones',
      'health_decline.control_of_medical_care',
      'health_decline.direct_medical_team',
      'health_decline.attempt_every_treatment',
      'health_decline.not_in_hospital_machines',
      'health_decline.loved_ones_have_support',
      'health_decline.loved_ones_dont_fight',
      'health_decline.not_alone',
      'health_decline.other',
    ],
  },
  {
    id: 4,
    title: 'Cultural & Religious Beliefs',
    description: 'Beliefs that impact my health care choices',
    icon: Cross,
    color: 'text-purple-500',
    fields: ['cultural_religious_beliefs'],
  },
  {
    id: 5,
    title: 'CPR Preferences',
    description: 'My preferences regarding CPR',
    icon: Heart,
    color: 'text-red-600',
    fields: ['cpr.preference', 'cpr.comment'],
  },
  {
    id: 6,
    title: 'Treatment Scenarios',
    description: 'My wishes for different medical situations',
    icon: Info,
    color: 'text-blue-600',
    fields: [
      'treatment_scenarios.temporary_no_mental_capacity',
      'treatment_scenarios.fully_dependent_on_others',
      'treatment_scenarios.permanently_lose_recognition',
      'treatment_scenarios.breathing_machine_bed_bound',
      'treatment_scenarios.vegetative_state_coma',
      'treatment_scenarios.terminal_condition',
      'treatment_scenarios.additional_comments',
    ],
  },
  {
    id: 7,
    title: 'Pain Management',
    description: 'My preferences for pain medication',
    icon: Shield,
    color: 'text-green-600',
    fields: [
      'pain_medication.keep_comfortable_less_alert',
      'pain_medication.homeopathic_natural_remedies',
      'pain_medication.natural_remedies_list',
      'pain_medication.only_as_last_resort',
      'pain_medication.substance_use_history',
      'pain_medication.palliative_care_referral',
      'pain_medication.agent_decide',
      'pain_medication.comments',
    ],
  },
  {
    id: 8,
    title: 'End-of-Life Wishes',
    description: 'My preferences for end-of-life care',
    icon: Home,
    color: 'text-indigo-500',
    fields: [
      'terminal_condition.told_as_soon_as_possible',
      'terminal_condition.dont_know_until_decision',
      'terminal_condition.hospice_care_referral',
      'terminal_condition.try_every_available_treatment',
      'end_of_life_location.hospital',
      'end_of_life_location.care_center',
      'end_of_life_location.home',
      'end_of_life_location.home_caregiver',
      'end_of_life_details.who_at_bedside',
      'end_of_life_details.cultural_religious_aspects',
      'end_of_life_details.other_details',
      'end_of_life_details.additional_comments',
    ],
  },
  {
    id: 9,
    title: 'After Death',
    description: 'My wishes for after death',
    icon: FileText,
    color: 'text-gray-600',
    fields: [
      'donation.donate_organs_tissues',
      'donation.registered_with',
      'donation.donation_stipulations',
      'donation.whole_body_anatomical_study',
      'donation.anatomical_study_org',
      'donation.do_not_wish_to_donate',
      'donation.agent_decide',
      'autopsy.benefit_others',
      'autopsy.not_unless_required',
      'autopsy.agent_decide',
      'body_care.preference',
      'body_care.details',
      'funeral_celebration.details',
    ],
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

export default function FireflyValuesForm({
  assignmentId,
  initialData,
  onSave,
}: FireflyValuesFormProps) {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<FireflyFormData>({
    about_me: {
      medical_team_members: '',
    },
    quality_of_life: {
      recognize_loved_ones: false,
      independent_physical_care: false,
      walk: false,
      religious_cultural_practices: false,
      enjoy_food_drink: false,
      live_in_own_home: false,
      bowel_bladder_control: false,
      be_with_pets: false,
      hobbies: '',
      other: '',
    },
    comfort_and_strength: {
      visits_with_loved_ones: '',
      prayer_spiritual_practices: '',
      spending_time_outside: false,
      listening_to: '',
      scents: '',
      favorite_foods_drinks: '',
      favorite_shows_movies: '',
      other: '',
    },
    health_decline: {
      spend_time_with_loved_ones: false,
      stay_in_home: false,
      not_burden_on_loved_ones: false,
      control_of_medical_care: false,
      direct_medical_team: false,
      attempt_every_treatment: false,
      not_in_hospital_machines: false,
      loved_ones_have_support: false,
      loved_ones_dont_fight: false,
      not_alone: false,
      other: '',
    },
    cultural_religious_beliefs: '',
    cpr: {
      preference: '',
      comment: '',
    },
    life_sustaining_treatments: {
      experience: '',
    },
    treatment_scenarios: {
      temporary_no_mental_capacity: '',
      fully_dependent_on_others: '',
      permanently_lose_recognition: '',
      breathing_machine_bed_bound: '',
      vegetative_state_coma: '',
      terminal_condition: '',
      additional_comments: '',
    },
    pain_medication: {
      keep_comfortable_less_alert: false,
      homeopathic_natural_remedies: false,
      natural_remedies_list: '',
      only_as_last_resort: false,
      substance_use_history: '',
      palliative_care_referral: false,
      agent_decide: false,
      comments: '',
    },
    terminal_condition: {
      told_as_soon_as_possible: false,
      dont_know_until_decision: false,
      hospice_care_referral: false,
      try_every_available_treatment: false,
    },
    end_of_life_location: {
      hospital: false,
      care_center: false,
      home: false,
      home_caregiver: '',
    },
    end_of_life_details: {
      who_at_bedside: '',
      cultural_religious_aspects: '',
      other_details: '',
      additional_comments: '',
    },
    donation: {
      donate_organs_tissues: false,
      registered_with: '',
      donation_stipulations: '',
      whole_body_anatomical_study: false,
      anatomical_study_org: '',
      do_not_wish_to_donate: false,
      agent_decide: false,
    },
    autopsy: {
      benefit_others: false,
      not_unless_required: false,
      agent_decide: false,
    },
    body_care: {
      preference: '',
      details: '',
    },
    funeral_celebration: {
      details: '',
    },
  });

  const [progress, setProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<number[]>(
    new Array(SECTIONS.length).fill(0)
  );
  const autoSaveEnabled = isAutoSaveEnabled();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Use refs to store latest form data to avoid dependency issues
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
        ) as FireflyDocumentTemplate;
        setFormData(parsedData as FireflyFormData);

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

      const response = await fireflyDocumentsService.saveResponse({
        assignment_id: assignmentId,
        member_id: user.id,
        document_id: initialData?.document?.id || '',
        responses: JSON.stringify(currentFormData),
        progress: currentProgress,
        section_progress: JSON.stringify(currentSectionProgress),
        auto_save_enabled: autoSaveEnabled,
      });

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
        if (fieldValue && fieldValue !== '' && fieldValue !== false) {
          completedFields++;
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

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !assignmentId || progressRef.current === 0) {
      return;
    }

    const currentFormData = formDataRef.current;
    const hasContent = Object.values(currentFormData).some((section) =>
      typeof section === 'object' && section !== null
        ? Object.values(section).some((value) =>
            typeof value === 'string' ? value !== '' : value === true
          )
        : false
    );

    if (hasContent) {
      const timeoutId = setTimeout(() => {
        handleSave();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [autoSaveEnabled, assignmentId, handleSave]);

  // Helper function to get nested field values
  const getFieldValue = (data: FireflyFormData, fieldPath: string) => {
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
      const pdfBlob = await fireflyDocumentsService.generatePDF(assignmentId);
      fireflyDocumentsService.downloadPDF(
        pdfBlob,
        `firefly-document-${assignmentId}.pdf`
      );
      toast.success('PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Render form sections based on current section
  const renderCurrentSection = () => {
    const section = SECTIONS[currentSection];
    const IconComponent = section.icon;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${section.color}`} />
            {section.title}
          </CardTitle>
          <CardDescription>{section.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentSection === 0 && renderAboutMeSection()}
          {currentSection === 1 && renderQualityOfLifeSection()}
          {currentSection === 2 && renderComfortStrengthSection()}
          {currentSection === 3 && renderHealthDeclineSection()}
          {currentSection === 4 && renderCulturalReligiousSection()}
          {currentSection === 5 && renderCPRSection()}
          {currentSection === 6 && renderTreatmentScenariosSection()}
          {currentSection === 7 && renderPainMedicationSection()}
          {currentSection === 8 && renderEndOfLifeSection()}
          {currentSection === 9 && renderAfterDeathSection()}
        </CardContent>
      </Card>
    );
  };

  // Section renderers (simplified for now)
  const renderAboutMeSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="medical_team_members" className="text-sm font-medium">
          Important members of my medical team are (example: primary care
          provider, social worker, specialist): Provide their names, health care
          organization affiliation, and phone number.
        </Label>
        <Textarea
          id="medical_team_members"
          placeholder="Enter answer here..."
          value={formData.about_me.medical_team_members}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              about_me: {
                ...prev.about_me,
                medical_team_members: e.target.value,
              },
            }))
          }
          rows={4}
        />
      </div>
    </div>
  );

  const renderQualityOfLifeSection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-4 block">
          It&apos;s essential that my agent(s) understand what is important to
          me and brings quality to my life. I understand that if I lost these
          abilities, nothing would be done to hasten my death. Instead, this
          helps my agent(s) know what brings meaning to my life when they are
          making medical decisions that would prolong my life (select all that
          apply):
        </Label>
        <div className="space-y-3">
          {[
            {
              key: 'recognize_loved_ones',
              label:
                'Being able to recognize my loved ones and engage in meaningful conversation',
            },
            {
              key: 'independent_physical_care',
              label:
                'Being able to independently meet my own physical care needs',
            },
            { key: 'walk', label: 'Being able to walk' },
            {
              key: 'religious_cultural_practices',
              label:
                'Being able to participate in religious and cultural practices',
            },
            {
              key: 'enjoy_food_drink',
              label: 'Being able to enjoy food and drink by mouth',
            },
            {
              key: 'live_in_own_home',
              label: 'Being able to live in my own home',
            },
            {
              key: 'bowel_bladder_control',
              label: 'Being continent of bowel and bladder',
            },
            { key: 'be_with_pets', label: 'Being with my pets' },
          ].map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={
                  formData.quality_of_life[
                    item.key as keyof typeof formData.quality_of_life
                  ] as boolean
                }
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    quality_of_life: {
                      ...prev.quality_of_life,
                      [item.key]: checked,
                    },
                  }))
                }
              />
              <Label htmlFor={item.key} className="text-sm">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="hobbies" className="text-sm font-medium">
          Being able to engage in hobbies that give my life meaning such as:
        </Label>
        <Textarea
          id="hobbies"
          placeholder="Enter your hobbies..."
          value={formData.quality_of_life.hobbies}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              quality_of_life: {
                ...prev.quality_of_life,
                hobbies: e.target.value,
              },
            }))
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="other_quality" className="text-sm font-medium">
          Other:
        </Label>
        <Textarea
          id="other_quality"
          placeholder="Enter other important aspects..."
          value={formData.quality_of_life.other}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              quality_of_life: {
                ...prev.quality_of_life,
                other: e.target.value,
              },
            }))
          }
          rows={2}
        />
      </div>
    </div>
  );

  // Additional section renderers would go here...
  const renderComfortStrengthSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        When I go through hard times like health challenges, the following bring
        me comfort and strength: (select all that apply):
      </p>
      {/* Implementation would continue here */}
    </div>
  );

  const renderHealthDeclineSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        As my health declines, it is important to me that (select all that
        apply):
      </p>
      {/* Implementation would continue here */}
    </div>
  );

  const renderCulturalReligiousSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="cultural_beliefs" className="text-sm font-medium">
          I have cultural, religious, and/or spiritual beliefs that impact my
          health care choices. They are:
        </Label>
        <Textarea
          id="cultural_beliefs"
          placeholder="Please explain (optional)"
          value={formData.cultural_religious_beliefs}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cultural_religious_beliefs: e.target.value,
            }))
          }
          rows={4}
        />
      </div>
    </div>
  );

  const renderCPRSection = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-4 block">
          While I know that in certain situations, medical professionals might
          not be able to do exactly what I want, I want to share my overall
          preferences on CPR (select one option):
        </Label>
        <RadioGroup
          value={formData.cpr.preference}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              cpr: {
                ...prev.cpr,
                preference: value,
              },
            }))
          }
        >
          {[
            { value: 'attempt', label: 'Attempt Resuscitation' },
            {
              value: 'attempt_unless',
              label: 'Attempt Resuscitation unless my health status changes',
            },
            { value: 'dnar', label: 'Do Not Attempt Resuscitation (DNAR)' },
            { value: 'agent_decide', label: 'I want my agent to decide' },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`cpr-${option.value}`} />
              <Label htmlFor={`cpr-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="cpr_comment" className="text-sm font-medium">
          Additional comment (optional)
        </Label>
        <Textarea
          id="cpr_comment"
          placeholder="Enter additional comments..."
          value={formData.cpr.comment}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              cpr: {
                ...prev.cpr,
                comment: e.target.value,
              },
            }))
          }
          rows={3}
        />
      </div>
    </div>
  );

  const renderTreatmentScenariosSection = () => (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Below are potential situations I could find myself in. I have carefully
        considered each and my wishes for their corresponding treatments
        decisions.
      </p>
      {/* Implementation would continue here with all treatment scenarios */}
    </div>
  );

  const renderPainMedicationSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        In every circumstance described above, I understand my medical team will
        try to keep me comfortable and reduce suffering and pain. My feelings
        about receiving pain medication are (select all that apply):
      </p>
      {/* Implementation would continue here */}
    </div>
  );

  const renderEndOfLifeSection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-4 block">
          If I have a terminal condition (select all that apply):
        </Label>
        <div className="space-y-3">
          {[
            {
              key: 'told_as_soon_as_possible',
              label:
                'I want me or my health care agent to be told as soon as possible',
            },
            {
              key: 'dont_know_until_decision',
              label:
                'I do not want to know until a point where a decision had to be made',
            },
            {
              key: 'hospice_care_referral',
              label:
                'I want a referral to hospice care and to focus on comfort and quality of life',
            },
            {
              key: 'try_every_available_treatment',
              label:
                'I want to try every available treatment to extend my life, even if it is not a cure and could compromise the quality of the time I have left',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={
                  formData.terminal_condition[
                    item.key as keyof typeof formData.terminal_condition
                  ] as boolean
                }
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    terminal_condition: {
                      ...prev.terminal_condition,
                      [item.key]: checked,
                    },
                  }))
                }
              />
              <Label htmlFor={item.key} className="text-sm">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {/* Additional end-of-life questions would continue here */}
    </div>
  );

  const renderAfterDeathSection = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-4 block">
          After death, my wishes for donation are (initial all that apply):
        </Label>
        <div className="space-y-3">
          {[
            {
              key: 'donate_organs_tissues',
              label:
                'I would like to donate any organs, tissues, and eyes for the purpose of transplantation, medical research, or education',
            },
            {
              key: 'whole_body_anatomical_study',
              label: 'I plan to donate my whole body for anatomical study',
            },
            { key: 'do_not_wish_to_donate', label: 'I do not wish to donate' },
            {
              key: 'agent_decide',
              label: 'I would like my health care agent to decide',
            },
          ].map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={
                  formData.donation[
                    item.key as keyof typeof formData.donation
                  ] as boolean
                }
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    donation: {
                      ...prev.donation,
                      [item.key]: checked,
                    },
                  }))
                }
              />
              <Label htmlFor={item.key} className="text-sm">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      {/* Additional after-death questions would continue here */}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Values, Goals, Wishes, and Instructions for My Health Care
        </h1>
        <p className="text-muted-foreground">
          A comprehensive document to help communicate your values, goals, and
          wishes for health care, end-of-life care, and after-life decisions
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
      {renderCurrentSection()}

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
                Congratulations! You have completed the Firefly Document.
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
