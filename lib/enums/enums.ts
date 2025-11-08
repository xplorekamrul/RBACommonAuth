export const EMPLOYMENT_STATUS = ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"] as const;
export type EmploymentStatus = typeof EMPLOYMENT_STATUS[number];

export const CONTRACT_TYPE = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] as const;
export type ContractType = typeof CONTRACT_TYPE[number];

export const GENDER = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = typeof GENDER[number];

export const BLOOD_GROUP = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"] as const;
export type BloodGroup = typeof BLOOD_GROUP[number];

export const DOCUMENT_FORMAT = ["jpg","jpeg","png","gif","webp","pdf"] as const;

export type DocumentFormat = typeof DOCUMENT_FORMAT[number];

export const MARITAL_STATUS = ["SINGLE","MARRIED","DIVORCED","WIDOWED"] as const;
export type MaritalStatus = typeof MARITAL_STATUS[number];
