export type Language = {
  _id?: string;
  candidateId: string
  userId: string;
  name: string;
  languageLevel: string;

};

export type languageLevel =
  | 'beginner'
  | 'pre-intermediate'
  | 'intermediate'
  | 'upper-intermediate'
  | 'advanced'
  | 'proficiency';
