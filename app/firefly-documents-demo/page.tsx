'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  User,
  Home,
  Cross,
} from 'lucide-react';
import Link from 'next/link';

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

const SECTIONS = [
  {
    id: 0,
    title: 'About Me',
    description: 'Important members of my medical team',
    icon: User,
    color: 'text-blue-500',
  },
  {
    id: 1,
    title: 'Quality of Life',
    description: 'What brings meaning to my life',
    icon: Heart,
    color: 'text-red-500',
  },
  {
    id: 2,
    title: 'Comfort & Strength',
    description: 'What brings me comfort during hard times',
    icon: Shield,
    color: 'text-green-500',
  },
  {
    id: 3,
    title: 'Health Decline',
    description: 'What is important as my health declines',
    icon: Clock,
    color: 'text-orange-500',
  },
  {
    id: 4,
    title: 'Cultural & Religious Beliefs',
    description: 'Beliefs that impact my health care choices',
    icon: Cross,
    color: 'text-purple-500',
  },
  {
    id: 5,
    title: 'CPR Preferences',
    description: 'My preferences regarding CPR',
    icon: Heart,
    color: 'text-red-600',
  },
  {
    id: 6,
    title: 'Treatment Scenarios',
    description: 'My wishes for different medical situations',
    icon: Info,
    color: 'text-blue-600',
  },
  {
    id: 7,
    title: 'Pain Management',
    description: 'My preferences for pain medication',
    icon: Shield,
    color: 'text-green-600',
  },
  {
    id: 8,
    title: 'End-of-Life Wishes',
    description: 'My preferences for end-of-life care',
    icon: Home,
    color: 'text-indigo-500',
  },
  {
    id: 9,
    title: 'After Death',
    description: 'My wishes for after death',
    icon: FileText,
    color: 'text-gray-600',
  },
];

export default function FireflyDocumentsDemo() {
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

  const [currentSection, setCurrentSection] = useState(0);

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

  const renderComfortStrengthSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        When I go through hard times like health challenges, the following bring
        me comfort and strength: (select all that apply):
      </p>
      <div className="space-y-3">
        <div>
          <Label
            htmlFor="visits_with_loved_ones"
            className="text-sm font-medium"
          >
            Visits with loved ones, specifically:
          </Label>
          <Textarea
            id="visits_with_loved_ones"
            placeholder="Enter names or details..."
            value={formData.comfort_and_strength.visits_with_loved_ones}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                comfort_and_strength: {
                  ...prev.comfort_and_strength,
                  visits_with_loved_ones: e.target.value,
                },
              }))
            }
            rows={2}
          />
        </div>
        <div>
          <Label
            htmlFor="prayer_spiritual_practices"
            className="text-sm font-medium"
          >
            Prayer or other spiritual practices such as:
          </Label>
          <Textarea
            id="prayer_spiritual_practices"
            placeholder="Enter details..."
            value={formData.comfort_and_strength.prayer_spiritual_practices}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                comfort_and_strength: {
                  ...prev.comfort_and_strength,
                  prayer_spiritual_practices: e.target.value,
                },
              }))
            }
            rows={2}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="spending_time_outside"
            checked={formData.comfort_and_strength.spending_time_outside}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                comfort_and_strength: {
                  ...prev.comfort_and_strength,
                  spending_time_outside: checked as boolean,
                },
              }))
            }
          />
          <Label htmlFor="spending_time_outside" className="text-sm">
            Spending time outside
          </Label>
        </div>
      </div>
    </div>
  );

  const renderHealthDeclineSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        As my health declines, it is important to me that (select all that
        apply):
      </p>
      <div className="space-y-3">
        {[
          {
            key: 'spend_time_with_loved_ones',
            label: 'I can spend time with my loved ones',
          },
          { key: 'stay_in_home', label: 'I stay in my home' },
          {
            key: 'not_burden_on_loved_ones',
            label: 'I am not a burden on those I care about',
          },
          {
            key: 'control_of_medical_care',
            label: 'I continue to be in control of my medical care',
          },
          {
            key: 'direct_medical_team',
            label:
              'My medical team is direct regarding my diagnosis, prognosis, and risk vs benefits of treatments',
          },
          {
            key: 'attempt_every_treatment',
            label:
              'I attempt every available treatment and fight until the very end to have as much time as possible even if that compromises the quality of my life',
          },
          {
            key: 'not_in_hospital_machines',
            label: 'I am not in a hospital hooked up to machines',
          },
          {
            key: 'loved_ones_have_support',
            label: 'My loved ones have support',
          },
          {
            key: 'loved_ones_dont_fight',
            label: 'My loved ones do not fight about my medical care',
          },
          { key: 'not_alone', label: 'I am not alone' },
        ].map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <Checkbox
              id={item.key}
              checked={
                formData.health_decline[
                  item.key as keyof typeof formData.health_decline
                ] as boolean
              }
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  health_decline: {
                    ...prev.health_decline,
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
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">
            If my medical team believes I have a chance to recover to my current
            level of functioning, while temporarily do not have mental capacity.
          </Label>
          <RadioGroup
            value={
              formData.treatment_scenarios?.temporary_no_mental_capacity || ''
            }
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                treatment_scenarios: {
                  ...prev.treatment_scenarios,
                  temporary_no_mental_capacity: value,
                },
              }))
            }
          >
            {[
              {
                value: 'all_treatments',
                label:
                  'I want all life sustaining treatments to extend my life even if it compromised my quality of life',
              },
              {
                value: 'trial_period',
                label:
                  'I want a trial period of treatments my medical team thinks might help',
              },
              {
                value: 'no_treatments',
                label:
                  'I do not want treatments to extend my life. Keep me pain-free and comfortable and allow me to die a natural death',
              },
              {
                value: 'agent_decide',
                label:
                  'I am not sure. I want my medical team and health care agent to decide',
              },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`temp-${option.value}`}
                />
                <Label htmlFor={`temp-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderPainMedicationSection = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        In every circumstance described above, I understand my medical team will
        try to keep me comfortable and reduce suffering and pain. My feelings
        about receiving pain medication are (select all that apply):
      </p>
      <div className="space-y-3">
        {[
          {
            key: 'keep_comfortable_less_alert',
            label:
              'I want pain medications to keep me comfortable even if that means I am less alert',
          },
          {
            key: 'homeopathic_natural_remedies',
            label:
              'I believe in homeopathic and natural remedies and would like those attempted first',
          },
          {
            key: 'only_as_last_resort',
            label:
              'I only want pain medication as a very last resort if my medical team believes I am suffering',
          },
          {
            key: 'palliative_care_referral',
            label:
              'I want a referral to a palliative care specialist to support my physical, emotional, and spiritual needs',
          },
          {
            key: 'agent_decide',
            label: 'I would like my health care agent to decide',
          },
        ].map((item) => (
          <div key={item.key} className="flex items-center space-x-2">
            <Checkbox
              id={item.key}
              checked={
                formData.pain_medication[
                  item.key as keyof typeof formData.pain_medication
                ] as boolean
              }
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  pain_medication: {
                    ...prev.pain_medication,
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

      <div>
        <Label className="text-sm font-medium mb-4 block">
          Some end-of-life situations do not provide an opportunity for choice.
          If they do, my wishes for my end of life are:
        </Label>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Location (select all that apply):
            </Label>
            <div className="space-y-2">
              {[
                { key: 'hospital', label: 'Hospital' },
                {
                  key: 'care_center',
                  label:
                    'Care center where professional caregivers are meeting my needs',
                },
                { key: 'home', label: 'Home' },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={
                      formData.end_of_life_location[
                        item.key as keyof typeof formData.end_of_life_location
                      ] as boolean
                    }
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        end_of_life_location: {
                          ...prev.end_of_life_location,
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
            <Label htmlFor="who_at_bedside" className="text-sm font-medium">
              Who I want at my bedside:
            </Label>
            <Textarea
              id="who_at_bedside"
              placeholder="Enter names or details..."
              value={formData.end_of_life_details.who_at_bedside}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  end_of_life_details: {
                    ...prev.end_of_life_details,
                    who_at_bedside: e.target.value,
                  },
                }))
              }
              rows={2}
            />
          </div>
        </div>
      </div>
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

      <div>
        <Label className="text-sm font-medium mb-4 block">
          After death, my wishes regarding autopsy are:
        </Label>
        <RadioGroup
          value={
            formData.autopsy.benefit_others
              ? 'benefit_others'
              : formData.autopsy.not_unless_required
                ? 'not_unless_required'
                : formData.autopsy.agent_decide
                  ? 'agent_decide'
                  : ''
          }
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              autopsy: {
                benefit_others: value === 'benefit_others',
                not_unless_required: value === 'not_unless_required',
                agent_decide: value === 'agent_decide',
              },
            }))
          }
        >
          {[
            {
              value: 'benefit_others',
              label:
                'I would like an autopsy if the results could benefit others',
            },
            {
              value: 'not_unless_required',
              label: 'I do not want an autopsy unless required by law',
            },
            {
              value: 'agent_decide',
              label:
                'I am not sure. I trust my health care agent to make this decision',
            },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`autopsy-${option.value}`}
              />
              <Label htmlFor={`autopsy-${option.value}`} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="body_care_preference" className="text-sm font-medium">
          When I die, my preference for the care of my body is (example: burial,
          cremation, green burial, or other options available in your place of
          residence):
        </Label>
        <Textarea
          id="body_care_preference"
          placeholder="Enter your preference..."
          value={formData.body_care.preference}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              body_care: {
                ...prev.body_care,
                preference: e.target.value,
              },
            }))
          }
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="funeral_details" className="text-sm font-medium">
          My wish for a funeral or celebration of life are (provide details such
          a location, food served, music played, readings, where donations
          should be sent, and other important wishes):
        </Label>
        <Textarea
          id="funeral_details"
          placeholder="Enter details..."
          value={formData.funeral_celebration.details}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              funeral_celebration: {
                ...prev.funeral_celebration,
                details: e.target.value,
              },
            }))
          }
          rows={4}
        />
      </div>
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
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800"
              >
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
            Values, Goals, Wishes, and Instructions for My Health Care
          </h1>
          <p className="text-muted-foreground">
            A comprehensive document to help communicate your values, goals, and
            wishes for health care, end-of-life care, and after-life decisions
          </p>
        </div>

        {/* Demo Notice */}
        <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <Play className="h-4 w-4" />
          <AlertDescription>
            This is a demonstration of the Firefly Documents tool. Your
            responses are not saved in demo mode.
            <Link
              href="/login"
              className="ml-2 text-purple-600 hover:underline"
            >
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

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
                This demo shows you how the Firefly Documents tool works. Sign
                up to create your account and start planning your healthcare
                wishes.
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
