import { isAutoSaveEnabled } from '@/lib/config/features';

export interface FireflyDocumentTemplate {
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

export interface FireflyAssignment {
  id: string;
  document_title: string;
  status: string;
  assigned_at: string;
  due_date?: string;
  notes?: string;
  trainer_name: string;
  family_name: string;
  progress: number;
}

export interface FireflyResponse {
  id: string;
  assignment_id: string;
  member_id: string;
  document_id: string;
  responses: string;
  progress: number;
  section_progress: string;
  started_at: string;
  completed_at?: string;
  last_saved_at?: string;
  auto_save_enabled: boolean;
}

export interface FireflyProgress {
  member_id: string;
  member_name: string;
  family_name: string;
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  overall_progress: number;
  last_activity?: string;
}

class FireflyDocumentsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.data || data;
  }

  // Get default document
  async getDefaultDocument(): Promise<FireflyDocumentTemplate> {
    return this.makeRequest('/firefly-documents/document');
  }

  // Get all documents
  async getAllDocuments(): Promise<FireflyDocumentTemplate[]> {
    return this.makeRequest('/firefly-documents/documents');
  }

  // Get member assignments
  async getMemberAssignments(): Promise<FireflyAssignment[]> {
    return this.makeRequest('/api/member/firefly-assignments');
  }

  // Get assignment details
  async getAssignmentDetails(assignmentId: string): Promise<FireflyAssignment> {
    return this.makeRequest(`/api/member/firefly-assignments/${assignmentId}`);
  }

  // Save response
  async saveResponse(data: {
    assignment_id: string;
    member_id: string;
    document_id: string;
    responses: string;
    progress: number;
    section_progress: string;
    auto_save_enabled: boolean;
  }): Promise<FireflyResponse> {
    return this.makeRequest(
      `/api/firefly-documents/responses/${data.assignment_id}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Get member progress
  async getMemberProgress(): Promise<FireflyProgress> {
    return this.makeRequest('/api/member/firefly-progress');
  }

  // Generate PDF
  async generatePDF(assignmentId: string): Promise<Blob> {
    const token =
      localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const response = await fetch(
      `${this.baseUrl}/api/firefly-documents/pdf/assignment/${assignmentId}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.status}`);
    }

    return response.blob();
  }

  // Download PDF
  downloadPDF(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Get auto-save status
  isAutoSaveEnabled(): boolean {
    return isAutoSaveEnabled();
  }
}

export const fireflyDocumentsService = new FireflyDocumentsService();
