export type CustomQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "yes_no" | "number";
  options?: string[];
  required: boolean;
};

export type JobFormConfig = {
  require_phone: boolean;
  require_resume: boolean;
  require_linkedin: boolean;
  require_portfolio: boolean;
  require_cover_letter: boolean;
  require_notice_period: boolean;
  require_expected_salary: boolean;
  custom_questions: CustomQuestion[];
};

export type Job = {
  id: string;
  name: string;
  department: string;
  no_of_recruitment: number;
  applicants_count: number;
  state: "open" | "closed" | "draft";
  salary_range: string;
  location: string;
  work_policy: "Remote" | "Hybrid" | "On-site";
  employment_type: "Full-time" | "Contract" | "Part-time" | "Internship";
  experience_level: "Entry" | "Mid" | "Senior" | "Lead" | "Executive";
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  closing_date: string;
  form_config: JobFormConfig;
};

export const DEFAULT_JOBS: Job[] = [
  {
    id: "JOB-001",
    name: "Senior Full Stack Engineer",
    department: "Engineering",
    no_of_recruitment: 3,
    applicants_count: 8,
    state: "open",
    salary_range: "$110,000 - $140,000",
    location: "Remote / Dubai HQ",
    work_policy: "Remote",
    employment_type: "Full-time",
    experience_level: "Senior",
    description: "We are seeking an experienced Full Stack Engineer to lead the architecture and scaling of our enterprise ERP and CRM cloud ecosystem. You will build high-throughput TypeScript/Next.js services, resilient database schemas, and intuitive real-time UI components.",
    responsibilities: [
      "Architect and ship resilient React/Next.js frontends and Node.js microservices.",
      "Optimize PostgreSQL queries, caching layers, and high-concurrency background jobs.",
      "Collaborate with Product Managers and Designers to deliver mission-critical ERP features.",
      "Mentor mid-level engineers and drive code review excellence."
    ],
    requirements: [
      "5+ years of production experience with TypeScript, React, Next.js, and Node.js.",
      "Deep understanding of relational databases (PostgreSQL/MySQL) and caching (Redis).",
      "Experience building mission-critical B2B or SaaS cloud platforms.",
      "Strong communication skills and ability to work in an asynchronous, remote-first team."
    ],
    benefits: [
      "Competitive base salary + equity options.",
      "100% remote flexibility with home office stipend.",
      "Comprehensive global health insurance coverage.",
      "Annual $3,000 learning and conference budget.",
      "28 paid vacation days + company-wide recharge weeks."
    ],
    closing_date: "2026-11-30",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: true,
      require_cover_letter: false,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "How many years of hands-on Next.js / TypeScript production experience do you have?",
          type: "number",
          required: true
        },
        {
          id: "q2",
          question: "What is your current notice period?",
          type: "select",
          options: ["Immediate (Available now)", "1 to 2 Weeks", "1 Month", "2 Months or more"],
          required: true
        },
        {
          id: "q3",
          question: "Have you previously worked on high-scale ERP or multi-tenant SaaS systems?",
          type: "yes_no",
          required: true
        }
      ]
    }
  },
  {
    id: "JOB-002",
    name: "Enterprise Account Executive",
    department: "Sales",
    no_of_recruitment: 2,
    applicants_count: 5,
    state: "open",
    salary_range: "$80,000 - $120,000 + Commission",
    location: "New York / Hybrid",
    work_policy: "Hybrid",
    employment_type: "Full-time",
    experience_level: "Mid",
    description: "Drive high-velocity B2B sales cycles for mid-market and enterprise accounts. You will manage incoming inbound leads, perform consultative demos of our all-in-one ERP/POS suite, and negotiate annual contracts.",
    responsibilities: [
      "Execute consultative product demos for C-level executives and business owners.",
      "Manage end-to-end sales pipelines from qualified demo to contract close.",
      "Collaborate with solution engineers on RFPs and custom multi-branch rollouts."
    ],
    requirements: [
      "3+ years in B2B SaaS closing roles with demonstrated quota achievement.",
      "Exceptional presentation and objection handling skills.",
      "Familiarity with CRM pipelines and enterprise software procurement."
    ],
    benefits: [
      "Uncapped commission structure.",
      "Hybrid flexible work arrangement.",
      "Premium health & dental plans.",
      "Annual president club trips for top performers."
    ],
    closing_date: "2026-12-15",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: true,
      require_portfolio: false,
      require_cover_letter: true,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "What was your average annual quota and quota attainment percentage in your last role?",
          type: "text",
          required: true
        },
        {
          id: "q2",
          question: "Do you have experience selling ERP, POS, or financial software solutions?",
          type: "yes_no",
          required: true
        }
      ]
    }
  },
  {
    id: "JOB-003",
    name: "Executive Culinary Chef & Kitchen Manager",
    department: "Operations",
    no_of_recruitment: 1,
    applicants_count: 3,
    state: "open",
    salary_range: "$65,000 - $85,000",
    location: "London / On-site",
    work_policy: "On-site",
    employment_type: "Full-time",
    experience_level: "Lead",
    description: "Manage high-volume kitchen operations, food costing, recipe standardization, and Kitchen Display System (KDS) workflows across our flagship restaurant location.",
    responsibilities: [
      "Supervise daily line cooking, prep schedules, and recipe consistency.",
      "Monitor food cost percentages, inventory waste, and vendor purchase orders.",
      "Enforce rigorous food safety and hygiene standards."
    ],
    requirements: [
      "5+ years culinary leadership in high-standard restaurants or hospitality groups.",
      "Deep experience with recipe costing and digital KDS systems.",
      "Food Safety Management certification."
    ],
    benefits: [
      "Performance bonus tied to kitchen margin & guest ratings.",
      "Full culinary uniforms and knife allowance.",
      "Company health package."
    ],
    closing_date: "2026-11-20",
    form_config: {
      require_phone: true,
      require_resume: true,
      require_linkedin: false,
      require_portfolio: true,
      require_cover_letter: false,
      require_notice_period: true,
      require_expected_salary: true,
      custom_questions: [
        {
          id: "q1",
          question: "Do you hold a valid Level 3 Food Hygiene / HACCP Certification?",
          type: "yes_no",
          required: true
        }
      ]
    }
  }
];
