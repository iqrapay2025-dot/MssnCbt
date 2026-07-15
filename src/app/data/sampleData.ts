export type Subject = "English" | "Mathematics" | "Current Affairs" | "General Knowledge";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: number;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  nickname: string;
  score: number;
  sessions: number;
  avatar: string;
}

export interface UserSession {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  subjects: Record<Subject, { correct: number; total: number }>;
}

export const SAMPLE_QUESTIONS: Question[] = [
  // English Language (15 questions)
  {
    id: 1, subject: "English", topic: "Comprehension", difficulty: "Medium",
    question: "Choose the word that is closest in meaning to 'ELOQUENT':",
    options: ["Silent", "Articulate", "Confused", "Harsh"],
    correctIndex: 1,
    explanation: "'Eloquent' means fluent and persuasive in speaking or writing. 'Articulate' is the closest synonym."
  },
  {
    id: 2, subject: "English", topic: "Grammar", difficulty: "Easy",
    question: "Select the correct form of the verb: 'Neither the students nor the teacher ___ ready.'",
    options: ["are", "were", "is", "be"],
    correctIndex: 2,
    explanation: "When using 'neither...nor', the verb agrees with the subject closest to it — 'teacher' (singular), so 'is' is correct."
  },
  {
    id: 3, subject: "English", topic: "Vocabulary", difficulty: "Hard",
    question: "Which of the following is an antonym of 'GREGARIOUS'?",
    options: ["Sociable", "Outgoing", "Reclusive", "Friendly"],
    correctIndex: 2,
    explanation: "'Gregarious' means fond of company. Its antonym is 'reclusive', meaning avoiding the company of others."
  },
  {
    id: 4, subject: "English", topic: "Grammar", difficulty: "Medium",
    question: "Identify the figure of speech in: 'The pen is mightier than the sword.'",
    options: ["Simile", "Metaphor", "Hyperbole", "Personification"],
    correctIndex: 1,
    explanation: "This is a metaphor — it makes a direct comparison between the power of writing (pen) and military force (sword) without using 'like' or 'as'."
  },
  {
    id: 5, subject: "English", topic: "Comprehension", difficulty: "Easy",
    question: "What is the plural form of 'criterion'?",
    options: ["Criterions", "Criterias", "Criteria", "Criterium"],
    correctIndex: 2,
    explanation: "'Criterion' is a Greek-origin word. Its correct plural is 'criteria'."
  },
  {
    id: 6, subject: "English", topic: "Vocabulary", difficulty: "Medium",
    question: "Choose the word that best completes: 'The politician's speech was full of ___; he said nothing of substance.'",
    options: ["veracity", "rhetoric", "candor", "brevity"],
    correctIndex: 1,
    explanation: "'Rhetoric' can refer to language designed to persuade or impress but often lacking substance."
  },
  {
    id: 7, subject: "English", topic: "Grammar", difficulty: "Hard",
    question: "In which sentence is the subjunctive mood used correctly?",
    options: [
      "I wish she was here with us.",
      "If I was you, I would accept the offer.",
      "It is important that he be present at the meeting.",
      "She acts as if she was the manager."
    ],
    correctIndex: 2,
    explanation: "The subjunctive mood is used after expressions like 'it is important that'. The correct form is 'be', not 'is'."
  },
  {
    id: 8, subject: "English", topic: "Comprehension", difficulty: "Easy",
    question: "Which word is correctly spelled?",
    options: ["Accomodate", "Accommodate", "Acomodate", "Acommodate"],
    correctIndex: 1,
    explanation: "The correct spelling is 'Accommodate' — with two 'c's and two 'm's."
  },
  {
    id: 9, subject: "English", topic: "Grammar", difficulty: "Medium",
    question: "Choose the sentence with the correct use of a semicolon:",
    options: [
      "He studied hard; but he failed.",
      "She loves reading; novels, poetry, and essays.",
      "They arrived early; the event had not yet started.",
      "I went to the market; bought vegetables."
    ],
    correctIndex: 2,
    explanation: "A semicolon correctly joins two independent clauses. Option C has two complete, related independent clauses."
  },
  {
    id: 10, subject: "English", topic: "Vocabulary", difficulty: "Easy",
    question: "What does the word 'PERSPICACIOUS' mean?",
    options: ["Sweating excessively", "Having a ready insight", "Being overly cautious", "Extremely tired"],
    correctIndex: 1,
    explanation: "'Perspicacious' means having a ready insight into things; shrewd."
  },
  {
    id: 11, subject: "English", topic: "Grammar", difficulty: "Medium",
    question: "Select the correct option to complete the sentence: '___ of the two plans is acceptable to the committee.'",
    options: ["None", "Neither", "Both", "Each"],
    correctIndex: 1,
    explanation: "'Neither' is used when referring to two options in a negative context. Since there are only two plans, 'neither' is correct."
  },
  {
    id: 12, subject: "English", topic: "Comprehension", difficulty: "Hard",
    question: "What literary device is used in 'The stars danced playfully in the moonlit sky'?",
    options: ["Alliteration", "Onomatopoeia", "Personification", "Oxymoron"],
    correctIndex: 2,
    explanation: "Personification attributes human qualities (dancing playfully) to non-human entities (stars)."
  },
  {
    id: 13, subject: "English", topic: "Vocabulary", difficulty: "Hard",
    question: "Choose the correct meaning of the idiom 'to burn the candle at both ends':",
    options: [
      "To work during the day and night",
      "To be very wasteful",
      "To overwork oneself to exhaustion",
      "To celebrate excessively"
    ],
    correctIndex: 2,
    explanation: "'To burn the candle at both ends' means to exhaust oneself by working excessively, usually by staying up late and rising early."
  },
  {
    id: 14, subject: "English", topic: "Grammar", difficulty: "Easy",
    question: "Which of the following sentences is in the passive voice?",
    options: [
      "The dog chased the cat.",
      "The cat was chased by the dog.",
      "She baked a cake.",
      "He runs every morning."
    ],
    correctIndex: 1,
    explanation: "In passive voice, the subject receives the action. 'The cat was chased by the dog' places the cat (object) as the subject."
  },
  {
    id: 15, subject: "English", topic: "Comprehension", difficulty: "Medium",
    question: "The word 'EPHEMERAL' most closely means:",
    options: ["Eternal", "Short-lived", "Spiritual", "Powerful"],
    correctIndex: 1,
    explanation: "'Ephemeral' means lasting for a very short time."
  },

  // Mathematics (15 questions)
  {
    id: 16, subject: "Mathematics", topic: "Algebra", difficulty: "Easy",
    question: "Solve for x: 3x + 7 = 22",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
    explanation: "3x + 7 = 22 → 3x = 22 - 7 = 15 → x = 15 ÷ 3 = 5"
  },
  {
    id: 17, subject: "Mathematics", topic: "Geometry", difficulty: "Medium",
    question: "What is the area of a triangle with base 12 cm and height 8 cm?",
    options: ["48 cm²", "96 cm²", "40 cm²", "64 cm²"],
    correctIndex: 0,
    explanation: "Area of triangle = ½ × base × height = ½ × 12 × 8 = 48 cm²"
  },
  {
    id: 18, subject: "Mathematics", topic: "Number Theory", difficulty: "Easy",
    question: "What is the LCM of 4, 6, and 8?",
    options: ["12", "18", "24", "48"],
    correctIndex: 2,
    explanation: "LCM of 4, 6, 8: Multiples of 8 = 8, 16, 24... 24 is divisible by 4 (÷4=6) and 6 (÷6=4). LCM = 24."
  },
  {
    id: 19, subject: "Mathematics", topic: "Algebra", difficulty: "Medium",
    question: "If 2^x = 32, what is the value of x?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
    explanation: "2^1=2, 2^2=4, 2^3=8, 2^4=16, 2^5=32. Therefore x = 5."
  },
  {
    id: 20, subject: "Mathematics", topic: "Statistics", difficulty: "Easy",
    question: "Find the mean of: 4, 8, 6, 10, 12",
    options: ["7", "8", "9", "10"],
    correctIndex: 1,
    explanation: "Mean = Sum ÷ Count = (4+8+6+10+12) ÷ 5 = 40 ÷ 5 = 8"
  },
  {
    id: 21, subject: "Mathematics", topic: "Geometry", difficulty: "Medium",
    question: "What is the circumference of a circle with radius 7 cm? (π = 22/7)",
    options: ["22 cm", "44 cm", "154 cm", "88 cm"],
    correctIndex: 1,
    explanation: "Circumference = 2πr = 2 × (22/7) × 7 = 2 × 22 = 44 cm"
  },
  {
    id: 22, subject: "Mathematics", topic: "Algebra", difficulty: "Hard",
    question: "Simplify: (x² - 4) ÷ (x - 2)",
    options: ["x - 2", "x + 2", "x² + 2", "2x"],
    correctIndex: 1,
    explanation: "x² - 4 = (x+2)(x-2). Dividing by (x-2) gives (x+2)."
  },
  {
    id: 23, subject: "Mathematics", topic: "Number Theory", difficulty: "Medium",
    question: "What is 15% of 240?",
    options: ["32", "36", "40", "42"],
    correctIndex: 1,
    explanation: "15% of 240 = (15/100) × 240 = 0.15 × 240 = 36"
  },
  {
    id: 24, subject: "Mathematics", topic: "Trigonometry", difficulty: "Hard",
    question: "If sin θ = 3/5, what is cos θ?",
    options: ["4/5", "3/4", "5/3", "2/5"],
    correctIndex: 0,
    explanation: "Using Pythagoras: if sin θ = 3/5, opposite=3, hypotenuse=5, adjacent=√(25-9)=4. So cos θ = 4/5."
  },
  {
    id: 25, subject: "Mathematics", topic: "Statistics", difficulty: "Easy",
    question: "The mode of the data set {3, 5, 7, 5, 9, 5, 3} is:",
    options: ["3", "5", "7", "9"],
    correctIndex: 1,
    explanation: "The mode is the most frequently occurring value. '5' appears 3 times, more than any other number."
  },
  {
    id: 26, subject: "Mathematics", topic: "Algebra", difficulty: "Medium",
    question: "Solve: |2x - 4| = 6",
    options: ["x = 1 or x = 5", "x = -1 or x = 5", "x = 5 only", "x = -1 only"],
    correctIndex: 1,
    explanation: "|2x-4|=6 means 2x-4=6 (x=5) or 2x-4=-6 (2x=-2, x=-1). Answer: x = -1 or x = 5."
  },
  {
    id: 27, subject: "Mathematics", topic: "Geometry", difficulty: "Hard",
    question: "A rectangular field is 80m long and 60m wide. What is the length of its diagonal?",
    options: ["100 m", "120 m", "140 m", "80 m"],
    correctIndex: 0,
    explanation: "Diagonal = √(80² + 60²) = √(6400 + 3600) = √10000 = 100 m"
  },
  {
    id: 28, subject: "Mathematics", topic: "Number Theory", difficulty: "Easy",
    question: "Express 0.375 as a fraction in its simplest form:",
    options: ["3/8", "3/7", "5/8", "3/4"],
    correctIndex: 0,
    explanation: "0.375 = 375/1000 = 3/8 (dividing numerator and denominator by 125)."
  },
  {
    id: 29, subject: "Mathematics", topic: "Algebra", difficulty: "Medium",
    question: "If y = 3x² - 2x + 1, find y when x = 2",
    options: ["9", "11", "13", "15"],
    correctIndex: 0,
    explanation: "y = 3(2²) - 2(2) + 1 = 3(4) - 4 + 1 = 12 - 4 + 1 = 9",
  },
  {
    id: 30, subject: "Mathematics", topic: "Statistics", difficulty: "Hard",
    question: "The probability of picking a red ball from a bag containing 4 red, 3 blue, and 5 green balls is:",
    options: ["1/3", "1/4", "2/5", "4/12"],
    correctIndex: 0,
    explanation: "Total balls = 4+3+5=12. P(red) = 4/12 = 1/3"
  },

  // Current Affairs (10 questions)
  {
    id: 31, subject: "Current Affairs", topic: "Nigerian Politics", difficulty: "Easy",
    question: "Who is the current President of Nigeria as of 2024?",
    options: ["Muhammadu Buhari", "Bola Ahmed Tinubu", "Peter Obi", "Atiku Abubakar"],
    correctIndex: 1,
    explanation: "Bola Ahmed Tinubu became Nigeria's President on May 29, 2023, after winning the 2023 general election."
  },
  {
    id: 32, subject: "Current Affairs", topic: "International Affairs", difficulty: "Medium",
    question: "Which country hosted the 2023 BRICS Summit?",
    options: ["China", "Russia", "South Africa", "Brazil"],
    correctIndex: 2,
    explanation: "The 15th BRICS Summit was held in Johannesburg, South Africa in August 2023."
  },
  {
    id: 33, subject: "Current Affairs", topic: "Science & Technology", difficulty: "Easy",
    question: "What does 'AI' stand for in technology?",
    options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Integration", "Analog Interface"],
    correctIndex: 1,
    explanation: "AI stands for Artificial Intelligence — the simulation of human intelligence by computer systems."
  },
  {
    id: 34, subject: "Current Affairs", topic: "Nigerian Economy", difficulty: "Medium",
    question: "The Nigerian naira was officially floated in which year?",
    options: ["2021", "2022", "2023", "2024"],
    correctIndex: 2,
    explanation: "President Tinubu announced the unification and floating of the naira exchange rate shortly after taking office in June 2023."
  },
  {
    id: 35, subject: "Current Affairs", topic: "International Affairs", difficulty: "Easy",
    question: "The United Nations was established in which year?",
    options: ["1939", "1945", "1948", "1952"],
    correctIndex: 1,
    explanation: "The United Nations was founded on October 24, 1945, after World War II."
  },
  {
    id: 36, subject: "Current Affairs", topic: "Nigerian Education", difficulty: "Medium",
    question: "What is the full meaning of JAMB?",
    options: [
      "Joint Admission and Matriculation Bureau",
      "Joint Admission and Matriculation Board",
      "Joint Academic and Matriculation Board",
      "Junior Admission and Matriculation Board"
    ],
    correctIndex: 1,
    explanation: "JAMB stands for Joint Admissions and Matriculation Board — the body that conducts UTME in Nigeria."
  },
  {
    id: 37, subject: "Current Affairs", topic: "International Affairs", difficulty: "Hard",
    question: "Which African country was the first to withdraw from the International Criminal Court?",
    options: ["South Africa", "Kenya", "Burundi", "Nigeria"],
    correctIndex: 2,
    explanation: "Burundi was the first country to formally withdraw from the ICC, completing the process in October 2017."
  },
  {
    id: 38, subject: "Current Affairs", topic: "Nigerian History", difficulty: "Easy",
    question: "Nigeria gained independence from Britain in which year?",
    options: ["1958", "1960", "1963", "1965"],
    correctIndex: 1,
    explanation: "Nigeria gained independence from British colonial rule on October 1, 1960."
  },
  {
    id: 39, subject: "Current Affairs", topic: "Science & Technology", difficulty: "Medium",
    question: "What does 'GPS' stand for?",
    options: ["Global Positioning System", "General Positioning Satellite", "Geo-Precision System", "Global Precision Signal"],
    correctIndex: 0,
    explanation: "GPS stands for Global Positioning System — a satellite-based navigation system."
  },
  {
    id: 40, subject: "Current Affairs", topic: "Nigerian Politics", difficulty: "Hard",
    question: "The University of Ilorin was established in which year?",
    options: ["1970", "1975", "1980", "1985"],
    correctIndex: 1,
    explanation: "The University of Ilorin was established in 1975 as part of the federal government's university expansion program."
  },

  // General Knowledge (10 questions)
  {
    id: 41, subject: "General Knowledge", topic: "Geography", difficulty: "Easy",
    question: "What is the capital city of Nigeria?",
    options: ["Lagos", "Kano", "Abuja", "Ibadan"],
    correctIndex: 2,
    explanation: "Abuja has been the capital city of Nigeria since December 12, 1991, when it replaced Lagos."
  },
  {
    id: 42, subject: "General Knowledge", topic: "Science", difficulty: "Easy",
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctIndex: 2,
    explanation: "Gold's chemical symbol is Au, from the Latin word 'Aurum'."
  },
  {
    id: 43, subject: "General Knowledge", topic: "History", difficulty: "Medium",
    question: "Who was the first President of Nigeria?",
    options: ["Nnamdi Azikiwe", "Tafawa Balewa", "Yakubu Gowon", "Olusegun Obasanjo"],
    correctIndex: 0,
    explanation: "Dr. Nnamdi Azikiwe (Zik of Africa) was Nigeria's first President, serving from 1963 to 1966."
  },
  {
    id: 44, subject: "General Knowledge", topic: "Islam", difficulty: "Easy",
    question: "How many pillars of Islam are there?",
    options: ["3", "4", "5", "6"],
    correctIndex: 2,
    explanation: "There are Five Pillars of Islam: Shahada (faith), Salat (prayer), Zakat (charity), Sawm (fasting), and Hajj (pilgrimage)."
  },
  {
    id: 45, subject: "General Knowledge", topic: "Geography", difficulty: "Medium",
    question: "Which river is the longest in Nigeria?",
    options: ["River Benue", "River Niger", "River Osun", "River Kaduna"],
    correctIndex: 1,
    explanation: "The River Niger is the longest river in Nigeria, stretching about 4,180 km in total length across West Africa."
  },
  {
    id: 46, subject: "General Knowledge", topic: "Science", difficulty: "Medium",
    question: "The human body has how many bones?",
    options: ["186", "206", "226", "246"],
    correctIndex: 1,
    explanation: "An adult human body has 206 bones. Babies are born with approximately 270-300 bones, which fuse over time."
  },
  {
    id: 47, subject: "General Knowledge", topic: "History", difficulty: "Hard",
    question: "In what year was the first Islamic caliphate established?",
    options: ["610 CE", "622 CE", "632 CE", "750 CE"],
    correctIndex: 2,
    explanation: "The first Islamic Caliphate (Rashidun Caliphate) was established in 632 CE following the death of Prophet Muhammad (SAW)."
  },
  {
    id: 48, subject: "General Knowledge", topic: "Geography", difficulty: "Easy",
    question: "Kwara State, where UNILORIN is located, is nicknamed:",
    options: ["The Gateway State", "The Confluence State", "State of Harmony", "The Heartbeat of the Nation"],
    correctIndex: 2,
    explanation: "Kwara State is nicknamed 'State of Harmony', reflecting its diverse but peaceful coexistence of cultures."
  },
  {
    id: 49, subject: "General Knowledge", topic: "Science", difficulty: "Hard",
    question: "Which organ in the body produces insulin?",
    options: ["Liver", "Kidney", "Pancreas", "Spleen"],
    correctIndex: 2,
    explanation: "Insulin is produced by the beta cells in the islets of Langerhans within the pancreas."
  },
  {
    id: 50, subject: "General Knowledge", topic: "Islam", difficulty: "Medium",
    question: "What is the name of the night of revelation of the Quran?",
    options: ["Laylatul Qadr", "Laylatul Miraj", "Laylatul Bara'ah", "Laylatul Jumu'ah"],
    correctIndex: 0,
    explanation: "Laylatul Qadr (The Night of Power/Decree) is when the Quran was first revealed to Prophet Muhammad (SAW). It falls in the last 10 nights of Ramadan."
  },
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: "Aisha Abdullahi", nickname: "AishaA", score: 94, sessions: 32, avatar: "A" },
  { rank: 2, name: "Muhammad Yusuf", nickname: "MyYusuf", score: 91, sessions: 28, avatar: "M" },
  { rank: 3, name: "Fatimah Bello", nickname: "FatBello", score: 89, sessions: 41, avatar: "F" },
  { rank: 4, name: "Ibrahim Suleiman", nickname: "IbrahimS", score: 87, sessions: 25, avatar: "I" },
  { rank: 5, name: "Khadijah Umar", nickname: "KhadU", score: 85, sessions: 35, avatar: "K" },
  { rank: 6, name: "Abdulrahman Ola", nickname: "AbdulOla", score: 83, sessions: 19, avatar: "A" },
  { rank: 7, name: "Zainab Aliyu", nickname: "ZainabA", score: 82, sessions: 22, avatar: "Z" },
  { rank: 8, name: "Musa Adeyemi", nickname: "MusaAde", score: 80, sessions: 30, avatar: "M" },
  { rank: 9, name: "Habibah Idris", nickname: "HabibahI", score: 78, sessions: 27, avatar: "H" },
  { rank: 10, name: "Yusuf Kwara", nickname: "YKwara", score: 75, sessions: 18, avatar: "Y" },
  { rank: 11, name: "Aminat Garba", nickname: "AminatG", score: 73, sessions: 14, avatar: "A" },
  { rank: 12, name: "Bilal Hassan", nickname: "BilalH", score: 71, sessions: 20, avatar: "B" },
  { rank: 13, name: "Ruqayyah Nda", nickname: "RuqNda", score: 70, sessions: 16, avatar: "R" },
  { rank: 14, name: "Ahmad Ladan", nickname: "AhmadL", score: 68, sessions: 12, avatar: "A" },
  { rank: 15, name: "Safiyyah Oropo", nickname: "SafO", score: 65, sessions: 11, avatar: "S" },
];

export const SCORE_HISTORY = [
  { date: "Jun 1", score: 52 },
  { date: "Jun 5", score: 58 },
  { date: "Jun 10", score: 61 },
  { date: "Jun 15", score: 65 },
  { date: "Jun 20", score: 70 },
  { date: "Jun 25", score: 68 },
  { date: "Jul 1", score: 74 },
  { date: "Jul 5", score: 78 },
  { date: "Jul 10", score: 76 },
  { date: "Jul 14", score: 82 },
];

export const RADAR_DATA = [
  { subject: "English", score: 82, fullMark: 100 },
  { subject: "Mathematics", score: 68, fullMark: 100 },
  { subject: "Current Affairs", score: 90, fullMark: 100 },
  { subject: "General Knowledge", score: 85, fullMark: 100 },
];

export const ADMIN_USERS = [
  { id: "u1", name: "Aisha Abdullahi", nickname: "AishaA", sessions: 32, lastActive: "2024-07-14 10:23", avgScore: 94, streak: 12 },
  { id: "u2", name: "Muhammad Yusuf", nickname: "MyYusuf", sessions: 28, lastActive: "2024-07-14 09:15", avgScore: 91, streak: 8 },
  { id: "u3", name: "Fatimah Bello", nickname: "FatBello", sessions: 41, lastActive: "2024-07-13 22:40", avgScore: 89, streak: 15 },
  { id: "u4", name: "Ibrahim Suleiman", nickname: "IbrahimS", sessions: 25, lastActive: "2024-07-14 08:00", avgScore: 87, streak: 5 },
  { id: "u5", name: "Khadijah Umar", nickname: "KhadU", sessions: 35, lastActive: "2024-07-12 18:30", avgScore: 85, streak: 3 },
  { id: "u6", name: "Abdulrahman Ola", nickname: "AbdulOla", sessions: 19, lastActive: "2024-07-14 11:05", avgScore: 83, streak: 7 },
  { id: "u7", name: "Zainab Aliyu", nickname: "ZainabA", sessions: 22, lastActive: "2024-07-13 16:20", avgScore: 82, streak: 0 },
  { id: "u8", name: "Musa Adeyemi", nickname: "MusaAde", sessions: 30, lastActive: "2024-07-14 07:45", avgScore: 80, streak: 10 },
];

export const SUBJECT_TOPICS: Record<Subject, { name: string; progress: number }[]> = {
  English: [
    { name: "Comprehension", progress: 75 },
    { name: "Grammar", progress: 60 },
    { name: "Vocabulary", progress: 80 },
    { name: "Essay Writing", progress: 45 },
    { name: "Summary Writing", progress: 50 },
  ],
  Mathematics: [
    { name: "Algebra", progress: 70 },
    { name: "Geometry", progress: 55 },
    { name: "Statistics", progress: 65 },
    { name: "Trigonometry", progress: 40 },
    { name: "Number Theory", progress: 80 },
  ],
  "Current Affairs": [
    { name: "Nigerian Politics", progress: 85 },
    { name: "International Affairs", progress: 70 },
    { name: "Nigerian Economy", progress: 60 },
    { name: "Science & Technology", progress: 75 },
    { name: "Nigerian History", progress: 90 },
  ],
  "General Knowledge": [
    { name: "Geography", progress: 80 },
    { name: "Science", progress: 65 },
    { name: "History", progress: 70 },
    { name: "Islam", progress: 95 },
  ],
};
