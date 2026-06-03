// Curated option lists for onboarding/profile. UK-focused, with "Other" fallback.

export const UK_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool",
  "Newcastle upon Tyne", "Sheffield", "Bristol", "Nottingham", "Leicester",
  "Edinburgh", "Cardiff", "Coventry", "Bradford", "Belfast", "Brighton",
  "Southampton", "Portsmouth", "Reading", "Oxford", "Cambridge", "York",
  "Aberdeen", "Dundee", "Sunderland", "Wolverhampton", "Plymouth", "Hull",
  "Stoke-on-Trent", "Derby", "Swansea", "Milton Keynes", "Norwich", "Luton",
  "Other",
];

export const UK_UNIVERSITIES = [
  "University of Oxford", "University of Cambridge", "Imperial College London",
  "University College London (UCL)", "London School of Economics (LSE)",
  "King's College London", "University of Edinburgh", "University of Manchester",
  "University of Bristol", "University of Warwick", "University of Glasgow",
  "Durham University", "University of Birmingham", "University of Leeds",
  "University of Sheffield", "University of Nottingham", "University of Southampton",
  "Newcastle University", "Northumbria University", "Cardiff University",
  "Queen Mary University of London", "University of Liverpool", "Lancaster University",
  "University of Exeter", "University of York", "University of Bath",
  "Anglia Ruskin University", "Coventry University", "University of Westminster",
  "Middlesex University", "University of Greenwich", "Birmingham City University",
  "Manchester Metropolitan University", "University of Hertfordshire",
  "University of East London", "Teesside University", "De Montfort University",
  "Other",
];

export const STUDENT_STATUS_OPTIONS = [
  { value: "student", label: "Current student" },
  { value: "graduate", label: "Graduate" },
];

export const WHAT_NEXT_OPTIONS = [
  "Looking for a graduate job", "Looking for an internship",
  "Looking for a placement / year in industry", "Building a startup",
  "Freelancing", "Preparing for interviews", "Switching careers",
  "Continuing studies (Masters/PhD)", "Just networking", "Other",
];

export const WHY_JOINED_OPTIONS = [
  "To find jobs and referrals", "To meet other UK students & graduates",
  "To get visa & PSW advice", "To find accommodation / flatmates",
  "To collaborate on projects", "To share and learn skills",
  "To get career guidance", "Just exploring", "Other",
];

export const INTEREST_OPTIONS = [
  "Tech", "AI", "Startups", "Finance", "Consulting", "Data Science",
  "Web Development", "Mobile Development", "Cybersecurity", "Cloud",
  "Product Management", "UI/UX Design", "Marketing", "Entrepreneurship",
  "Networking", "Community building", "Sports", "Football", "Cricket",
  "Badminton", "Gaming", "Music", "Travel", "Reading", "Fitness", "Cooking",
];

export const LOOKING_FOR_OPTIONS = [
  { value: "jobs", label: "Jobs" },
  { value: "internships", label: "Internships" },
  { value: "mentorship", label: "Mentorship" },
  { value: "networking", label: "Networking" },
  { value: "collaboration", label: "Collaboration" },
  { value: "accommodation", label: "Accommodation" },
];

// Intake years: current year +1 down to 12 years back
export const INTAKE_YEARS = Array.from({ length: 14 }, (_, i) =>
  String(new Date().getFullYear() + 1 - i),
);

export const USER_TYPE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Working Professional" },
  { value: "recruiter", label: "Recruiter" },
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const STUDY_LEVELS = [
  "Foundation", "Undergraduate (Bachelors)", "Masters", "PhD / Doctorate",
  "Diploma", "Other",
];

export const INDUSTRIES = [
  "Technology / Software", "Finance / Banking", "Consulting", "Healthcare",
  "Education", "Marketing / Advertising", "Engineering", "Retail / E-commerce",
  "Media / Entertainment", "Legal", "Manufacturing", "Government / Public Sector",
  "Startup", "Telecommunications", "Energy", "Other",
];

export const EXPERIENCE_OPTIONS = [
  "Less than 1 year", "1 year", "2 years", "3 years", "4 years",
  "5 years", "6-10 years", "10+ years",
];

// "What brings you to Kommunitea?" — maps onto lookingFor
export const BRINGS_YOU_OPTIONS = [
  { value: "networking", label: "Networking" },
  { value: "jobs", label: "Jobs" },
  { value: "referrals", label: "Referrals" },
  { value: "accommodation", label: "Accommodation" },
  { value: "collaboration", label: "Projects" },
  { value: "hiring", label: "Hiring" },
];
