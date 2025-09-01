import { getStoredToken } from '@/lib/utils/auth';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_THANACARE_BACKEND || 'http://localhost:8080';

export interface DementiaDocumentTemplate {
  care_preferences: {
    advanced_dementia_stage: string;
    around_the_clock_assistance: string;
    no_longer_recognize_loved_ones: string;
    unable_to_walk_safely: string;
    unable_to_bathe_clean: string;
    unable_to_remain_at_home: string;
    no_bladder_bowel_control: string;
    no_awareness_of_surroundings: string;
    unable_to_communicate: string;
  };
  hospice_care: {
    interest: string;
  };
  food_and_drink: {
    stop_food_and_drink: boolean;
  };
  additional_info: string;
  care_options: {
    live_as_long_as_possible: string;
    treat_but_not_aggressively: string;
    allow_natural_death: string;
  };
}

export interface DementiaAssignment {
  id: string;
  document_id: string;
  member_id: string;
  trainer_id: string;
  family_id: string;
  assigned_by: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'reviewed';
  due_date?: string;
  assigned_at: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DementiaResponse {
  id: string;
  assignment_id: string;
  member_id: string;
  document_id: string;
  responses: string;
  progress: number;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DementiaAssignmentWithDetails {
  assignment: DementiaAssignment;
  document: {
    id: string;
    title: string;
    description: string;
    content: string;
    version: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_picture_url?: string;
    created_at: string;
    updated_at: string;
  };
  trainer: {
    id: string;
    name: string;
    email: string;
    role: string;
    profile_picture_url?: string;
    created_at: string;
    updated_at: string;
  };
  family: {
    id: string;
    name: string;
    organization_id: string;
    created_by: string;
    created_at: string;
  };
  response?: DementiaResponse;
}

export interface DementiaProgress {
  member_id: string;
  member_name: string;
  family_name: string;
  total_assignments: number;
  completed_assignments: number;
  in_progress_assignments: number;
  overall_progress: number;
  last_activity?: string;
}

class DementiaToolService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get the default dementia tool document
  async getDefaultDocument() {
    const response = await fetch(`${BACKEND_URL}/dementia-tool/document`);
    if (!response.ok) {
      throw new Error('Failed to fetch default document');
    }
    return response.json();
  }

  // Get the document template structure
  async getDocumentTemplate() {
    const response = await fetch(`${BACKEND_URL}/dementia-tool/template`);
    if (!response.ok) {
      throw new Error('Failed to fetch document template');
    }
    return response.json();
  }

  // Get assignments for the authenticated user
  async getMyAssignments(): Promise<DementiaAssignmentWithDetails[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/my-assignments`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch my assignments');
    }
    return response.json();
  }

  // Get progress for the authenticated user
  async getMyProgress(): Promise<DementiaProgress | null> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/my-progress`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch my progress');
    }
    return response.json();
  }

  // Get assignments by trainer
  async getAssignmentsByTrainer(
    trainerId: string
  ): Promise<DementiaAssignmentWithDetails[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/assignments/trainer/${trainerId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch assignments by trainer');
    }
    return response.json();
  }

  // Get assignments by member
  async getAssignmentsByMember(
    memberId: string
  ): Promise<DementiaAssignmentWithDetails[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/assignments/member/${memberId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch assignments by member');
    }
    return response.json();
  }

  // Get specific assignment by ID
  async getAssignmentById(
    assignmentId: string
  ): Promise<DementiaAssignmentWithDetails> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/assignments/${assignmentId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch assignment');
    }
    return response.json();
  }

  // Assign document to member (trainers and admins only)
  async assignDocumentToMember(
    assignment: Partial<DementiaAssignment>
  ): Promise<DementiaAssignment> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/assignments`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(assignment),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to assign document');
    }
    return response.json();
  }

  // Save member response (members only)
  async saveResponse(
    response: Partial<DementiaResponse>
  ): Promise<DementiaResponse> {
    const headers = await this.getAuthHeaders();
    const responseData = await fetch(
      `${BACKEND_URL}/api/dementia-tool/responses`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(response),
      }
    );
    if (!responseData.ok) {
      throw new Error('Failed to save response');
    }
    return responseData.json();
  }

  // Update assignment status (trainers and admins only)
  async updateAssignmentStatus(
    assignmentId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; message?: string }> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/assignments/${assignmentId}/status`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, notes }),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to update assignment status');
    }
    return response.json();
  }

  // Get progress summary for trainer
  async getProgressSummary(trainerId: string): Promise<DementiaProgress[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/progress/trainer/${trainerId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch progress summary');
    }
    return response.json();
  }

  // Generate PDF for completed assignment
  async generatePDF(assignmentId: string): Promise<Blob> {
    const headers = await this.getAuthHeaders();
    // Remove Content-Type for binary response
    delete headers['Content-Type'];

    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/pdf/assignment/${assignmentId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }
    return response.blob();
  }

  // Generate PDF report of assignments for trainer
  async generateAssignmentsPDF(trainerId: string): Promise<Blob> {
    const headers = await this.getAuthHeaders();
    // Remove Content-Type for binary response
    delete headers['Content-Type'];

    const response = await fetch(
      `${BACKEND_URL}/api/dementia-tool/pdf/assignments/trainer/${trainerId}`,
      {
        headers,
      }
    );
    if (!response.ok) {
      throw new Error('Failed to generate assignments PDF');
    }
    return response.blob();
  }

  // Download PDF
  downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const dementiaToolService = new DementiaToolService();
