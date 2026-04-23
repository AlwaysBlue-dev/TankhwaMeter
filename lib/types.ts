export type Salary = {
  id: string;
  job_title: string;
  company: string;
  industry: string;
  city: string;
  experience_years: number;
  monthly_salary_pkr: number;
  education: string;
  is_remote: boolean;
  is_verified: boolean;
  is_flagged: boolean;
  submitted_at: string;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  city: string;
  size: string;
  created_at: string;
};

export type JobCategory = {
  id: string;
  name: string;
};
