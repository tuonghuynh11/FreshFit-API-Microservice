import { DegreeType } from "../entities/ExpertEducation";
export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
}
export interface CreateCertificateBody {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialUrl?: string;
}
export interface UpdateCertificateBody {
  name?: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialUrl?: string;
}
export interface DeleteCertificatesBody {
  certificationIds: string[];
}
export interface CreateExperienceBody {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}
export interface UpdateExperienceBody {
  company?: string;
  position?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}
export interface DeleteExperiencesBody {
  experienceIds: string[];
}
export interface CreateEducationBody {
  institution: string;
  degree: DegreeType;
  major: string;
  startYear: number;
  endYear?: number;
}
export interface UpdateEducationBody {
  institution?: string;
  degree?: DegreeType;
  major?: string;
  startYear?: number;
  endYear?: number;
}

export interface DeleteEducationBody {
  educationIds: string[];
}
export interface CreateExpertUserBody {
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: Gender;
  avatar: string;
  specialization: string;
  experienceYears: number;
  bio: string;
  certifications: CreateCertificateBody[];
  languages: string[];
  consultationFee: number;
  mainSkills: string[];
  experiences: CreateExperienceBody[];
  educations: CreateEducationBody[];
}
export interface UpdateExpertUserBody {
  fullName?: string;
  specialization?: string;
  experience_years?: number;
  bio?: string;
  consultation_fee?: number;
  languages?: string[];
}

export interface UpdateLanguagesBody {
  languages: string[];
}
export interface UpdateExpertSkillsBody {
  skills: {
    id: string;
    isMainSkill: boolean;
  }[];
}
