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
  section_progress: string; // JSON array of section progress percentages
  started_at: string;
  completed_at?: string;
  last_saved_at: string;
  auto_save_enabled: boolean;
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
    try {
      const token = getStoredToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      throw new Error('Authentication failed');
    }
  }

  // Get the default dementia tool document
  async getDefaultDocument() {
    try {
      const response = await fetch(`${BACKEND_URL}/dementia-tool/document`);
      if (!response.ok) {
        throw new Error(`Failed to fetch default document: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching default document:', error);
      throw new Error('Failed to fetch default document');
    }
  }

  // Get the document template structure
  async getDocumentTemplate() {
    try {
      const response = await fetch(`${BACKEND_URL}/dementia-tool/template`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch document template: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching document template:', error);
      throw new Error('Failed to fetch document template');
    }
  }

  // Get assignments for the authenticated user
  async getMyAssignments(): Promise<DementiaAssignmentWithDetails[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/my-assignments`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch my assignments: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      throw new Error('Failed to fetch my assignments');
    }
  }

  // Get progress for the authenticated user
  async getMyProgress(): Promise<DementiaProgress | null> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/my-progress`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch my progress: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching my progress:', error);
      throw new Error('Failed to fetch my progress');
    }
  }

  // Get assignments by trainer
  async getAssignmentsByTrainer(
    trainerId: string
  ): Promise<DementiaAssignmentWithDetails[]> {
    try {
      if (!trainerId) {
        throw new Error('Trainer ID is required');
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/assignments/trainer/${trainerId}`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch assignments by trainer: ${response.status}`
        );
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assignments by trainer:', error);
      throw new Error('Failed to fetch assignments by trainer');
    }
  }

  // Get assignments by member
  async getAssignmentsByMember(
    memberId: string
  ): Promise<DementiaAssignmentWithDetails[]> {
    try {
      if (!memberId) {
        throw new Error('Member ID is required');
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${BACKEND_URL}/api/member/assignments`, {
        headers,
      });
      if (!response.ok) {
        throw new Error(
          `Failed to fetch assignments by member: ${response.status}`
        );
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching assignments by member:', error);
      throw new Error('Failed to fetch assignments by member');
    }
  }

  // Get specific assignment by ID
  async getAssignmentById(
    assignmentId: string
  ): Promise<DementiaAssignmentWithDetails> {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/assignments/${assignmentId}`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch assignment: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw new Error('Failed to fetch assignment');
    }
  }

  // Assign document to member (trainers and admins only)
  async assignDocumentToMember(
    assignment: Partial<DementiaAssignment>
  ): Promise<DementiaAssignment> {
    try {
      if (!assignment.member_id || !assignment.document_id) {
        throw new Error('Member ID and Document ID are required');
      }

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
        throw new Error(`Failed to assign document: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error assigning document:', error);
      throw new Error('Failed to assign document');
    }
  }

  // Save member response (members only)
  async saveResponse(
    response: Partial<DementiaResponse>
  ): Promise<DementiaResponse> {
    try {
      if (!response.assignment_id || !response.member_id) {
        throw new Error('Assignment ID and Member ID are required');
      }

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
        throw new Error(`Failed to save response: ${responseData.status}`);
      }
      return responseData.json();
    } catch (error) {
      console.error('Error saving response:', error);
      throw new Error('Failed to save response');
    }
  }

  // Update assignment status (trainers and admins only)
  async updateAssignmentStatus(
    assignmentId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!assignmentId || !status) {
        throw new Error('Assignment ID and status are required');
      }

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
        throw new Error(
          `Failed to update assignment status: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw new Error('Failed to update assignment status');
    }
  }

  // Get progress summary for trainer
  async getProgressSummary(trainerId: string): Promise<DementiaProgress[]> {
    try {
      if (!trainerId) {
        throw new Error('Trainer ID is required');
      }

      const headers = await this.getAuthHeaders();
      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/progress/trainer/${trainerId}`,
        {
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch progress summary: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching progress summary:', error);
      throw new Error('Failed to fetch progress summary');
    }
  }

  // Generate PDF for completed assignment
  async generatePDF(assignmentId: string): Promise<Blob> {
    try {
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const headers = await this.getAuthHeaders();
      // Remove Content-Type for binary response
      const headersWithoutContentType = {
        Authorization: (headers as Record<string, string>).Authorization,
      };

      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/pdf/assignment/${assignmentId}`,
        {
          headers: headersWithoutContentType,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to generate PDF: ${response.status}`);
      }
      return response.blob();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  // Generate PDF report of assignments for trainer
  async generateAssignmentsPDF(trainerId: string): Promise<Blob> {
    try {
      if (!trainerId) {
        throw new Error('Trainer ID is required');
      }

      const headers = await this.getAuthHeaders();
      // Remove Content-Type for binary response
      const headersWithoutContentType = {
        Authorization: (headers as Record<string, string>).Authorization,
      };

      const response = await fetch(
        `${BACKEND_URL}/api/dementia-tool/pdf/assignments/trainer/${trainerId}`,
        {
          headers: headersWithoutContentType,
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to generate assignments PDF: ${response.status}`
        );
      }
      return response.blob();
    } catch (error) {
      console.error('Error generating assignments PDF:', error);
      throw new Error('Failed to generate assignments PDF');
    }
  }

  // Download PDF
  downloadPDF(blob: Blob, filename: string) {
    try {
      if (!blob || !filename) {
        throw new Error('Blob and filename are required');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }
}

export const dementiaToolService = new DementiaToolService();
