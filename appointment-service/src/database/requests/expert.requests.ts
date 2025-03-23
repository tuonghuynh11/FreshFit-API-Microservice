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
export interface CreateExperienceBody {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
}
export interface CreateEducationBody {
  institution: string;
  degree: DegreeType;
  major: string;
  startYear: number;
  endYear?: number;
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
