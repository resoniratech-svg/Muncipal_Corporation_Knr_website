export interface DeckItem {
  title: string;
  text?: string;
}

export interface DeckSectionBlock {
  heading: string;
  items: DeckItem[];
}

export interface DeckSlide {
  page: number;
  title: string;
  subtitle?: string;
  bannerTagline: string;
  footerTagline: string;
  keyPoints: string[];
  sections?: DeckSectionBlock[];
  tables?: { title: string; headers: string[]; rows: (string | number)[][] }[];
  metrics?: { label: string; value: string; sub?: string }[];
  targetRoute?: string;
  fullTranscription: string;
}

// Pages 1–23 are transcribed verbatim from the 26-page proposal PDF.
export const DECK_SLIDES: DeckSlide[] = [
  {
    page: 1,
    title: "1. Executive Summary",
    bannerTagline: "Karimnagar Municipal Corporation. Towards Transparent, Accountable & Smart Governance",
    footerTagline: "The initiative aims to position Karimnagar as a model municipal corporation for smart governance.",
    keyPoints: [
      "Urban governance in Karimnagar requires a structured, technology-driven approach to address gaps in transparency, accountability, and service delivery.",
      "This proposal outlines the implementation of a comprehensive digital governance platform that integrates administrative leadership, elected representatives, and citizens into a unified system.",
    ],
    sections: [
      {
        heading: "The platform will enable",
        items: [
          { title: "Real-time monitoring of civic issues", text: "Capture, track, and resolve citizen complaints in real time with geo-tagging and dashboards." },
          { title: "Transparent budget allocation and tracking", text: "End-to-end visibility of budget allocation, utilization, and expenditure at ward and department levels." },
          { title: "Data-driven decision-making", text: "Use analytics and insights to identify trends, prioritize interventions, and improve service outcomes." },
          { title: "Performance evaluation at ward level", text: "Measure and compare ward performance across key indicators to promote accountability and competition." },
        ],
      },
      {
        heading: "Stakeholders",
        items: [
          { title: "Administrative Leadership", text: "Informed decisions, efficient monitoring, and improved coordination." },
          { title: "Elected Representatives", text: "Better insights, stronger engagement, and responsible governance." },
          { title: "Citizens", text: "Easy access to services, transparency, and a stronger voice in governance." },
        ],
      },
      {
        heading: "My Karimnagar – Citizen App",
        items: [
          { title: "Raise Complaint" }, { title: "Track Status" }, { title: "Pay Taxes" },
          { title: "Feedback" }, { title: "Notices" }, { title: "Call Helpline" },
        ],
      },
    ],
    tables: [
      {
        title: "Karimnagar Municipal Dashboard – Top Issue Categories & Ward Performance",
        headers: ["Top Issue Category", "Share", "Ward", "Performance"],
        rows: [
          ["Drainage", "35%", "Ward 1", "85%"],
          ["Roads", "26%", "Ward 2", "72%"],
          ["Water Supply", "20%", "Ward 3", "68%"],
          ["Street Lights", "12%", "Ward 4", "90%"],
          ["Others", "5%", "Ward 5", "75%"],
        ],
      },
    ],
    metrics: [
      { label: "Total Complaints", value: "1,245", sub: "▲12%" },
      { label: "In Progress", value: "320", sub: "▲8%" },
      { label: "Resolved", value: "925", sub: "▲15%" },
      { label: "Open", value: "180", sub: "▼5%" },
      { label: "Allocated (FY 2024-25)", value: "₹350 Cr" },
      { label: "Utilized", value: "₹215 Cr" },
      { label: "Balance", value: "₹135 Cr" },
      { label: "Utilization", value: "61%" },
    ],
    targetRoute: "/",
    fullTranscription: `Laptop mock-up "Karimnagar Municipal Dashboard" (sidebar: Dashboard, Civic Issues, Budget Tracking, Ward Performance, Reports, Citizens, Settings) with Civic Issues – Real Time map. Phone mock-up "My Karimnagar – Citizen App" (bottom nav: Home, Services, Alerts, Profile). Karimnagar Municipal Corporation emblem.`,
  },
  {
    page: 2,
    title: "2. Objectives",
    bannerTagline: "Karimnagar Municipal Corporation | Smart Governance. Better Service. Stronger Karimnagar.",
    footerTagline: "Our Goal: Build a Transparent, Efficient, Citizen-Centric and Performance-Driven Municipal Corporation for a Better Karimnagar.",
    keyPoints: [
      "To establish end-to-end transparency in municipal operations",
      "To enable real-time grievance redressal tracking",
      "To improve efficiency in budget utilization",
      "To strengthen citizen engagement and trust",
      "To introduce a performance-driven administrative ecosystem across all wards",
    ],
    sections: [
      {
        heading: "03 Improved Efficiency in Budget Utilization",
        items: [{ title: "Optimized Spending" }, { title: "Better Planning" }, { title: "Maximum Impact" }],
      },
      {
        heading: "04 Strengthen Citizen Engagement & Trust — “Your Voice Our Priority”",
        items: [{ title: "Participate in decisions" }, { title: "Stay informed in real-time" }, { title: "Share feedback easily" }, { title: "Build trust together" }],
      },
      {
        heading: "05 Performance-Driven Administrative Ecosystem Across All Wards",
        items: [{ title: "KPIs Monitoring" }, { title: "Data-Driven Decisions" }, { title: "Performance Evaluation" }, { title: "Continuous Improvement" }],
      },
    ],
    tables: [
      {
        title: "01 Department Wise Expenditure",
        headers: ["Department", "Budget (Cr)", "Utilized (Cr)", "%"],
        rows: [
          ["Engineering", "46.0", "34.5", "77%"],
          ["Sanitation", "30.0", "24.0", "80%"],
          ["Water Supply", "25.0", "18.5", "74%"],
          ["Health", "20.0", "15.0", "75%"],
          ["Others", "30.0", "23.0", "77%"],
        ],
      },
      {
        title: "05 Ward Performance Overview",
        headers: ["Ward", "Score (out of 100)", "Status"],
        rows: [
          ["Ward 1", "85", "Excellent"], ["Ward 2", "78", "Good"], ["Ward 3", "72", "Good"],
          ["Ward 4", "68", "Average"], ["Ward 5", "82", "Good"], ["Ward 6", "75", "Good"],
          ["Ward 7", "65", "Average"], ["Ward 8", "80", "Good"], ["Ward 9", "70", "Good"],
        ],
      },
    ],
    metrics: [
      { label: "Expenditure Overview", value: "75%", sub: "₹125 Cr of ₹166 Cr (approx.)" },
      { label: "02 Grievance #GRV2024/001245", value: "In Progress", sub: "Water leakage on Road, Booth Colony – Ward 12" },
    ],
    targetRoute: "/",
    fullTranscription: `02 Real-Time Grievance Redressal Tracking: Grievance Details #GRV2024/001245, In Progress. Raised on 16 May 2024, 10:30 AM. Status Timeline: Complaint Registered (16 May 2024, 11:15 AM), In Progress (16 May 2024, 11:15 AM), Assigned to Officer (16 May 2024), Resolved.`,
  },
  {
    page: 3,
    title: "3. Key Challenges Identified",
    bannerTagline: "Challenges hinder effective governance and citizen trust.",
    footerTagline: "Identifying challenges today to build smarter solutions for tomorrow. Smart Karimnagar – Better Governance. Better City.",
    keyPoints: [
      "Absence of a centralized monitoring system across 66 wards",
      "Delays due to manual grievance handling processes",
      "Limited visibility into fund allocation and utilization",
      "Lack of measurable performance indicators for wards",
      "Minimal structured interaction between citizens and administration",
    ],
    sections: [
      {
        heading: "What the challenges look like today",
        items: [
          { title: "66 Wards – No Unified Monitoring System" },
          { title: "Pending Files", text: "Stacks of paper beside a clock." },
          { title: "Limited Transparency", text: "Funds Allocated → Utilization Unclear → Limited Insights" },
          { title: "No Standardized Metrics", text: "Ward 12, Ward 27, Ward 43, Ward 65 — No Comparison, No Accountability" },
          { title: "No Response", text: "Complaint box with no response." },
        ],
      },
      {
        heading: "Resulting effects",
        items: [
          { title: "Poor Transparency" }, { title: "Delayed Services" }, { title: "Inefficient Fund Use" },
          { title: "Low Accountability" }, { title: "Low Citizen Engagement" },
        ],
      },
      {
        heading: "Addressing these challenges is critical to building a transparent, efficient, and citizen-centric Municipal Corporation.",
        items: [{ title: "Transparency" }, { title: "Efficiency" }, { title: "Accountability" }, { title: "Citizen Trust" }],
      },
    ],
    targetRoute: "/",
    fullTranscription: `Illustrations: map "66 WARDS – NO UNIFIED MONITORING SYSTEM"; "Pending Files" with clock; Funds Allocated → Utilization Unclear → Limited Insights; trend charts for Wards 12, 27, 43, 65 with "?"; complaint box "No Response".`,
  },
  {
    page: 4,
    title: "4. Proposed Solution: Integrated 3-Tier Digital Governance System",
    subtitle: "A centralized digital platform ensuring seamless coordination without altering the existing administrative hierarchy.",
    bannerTagline: "Centralized Digital Platform: One System, One Source of Truth",
    footerTagline: "Empowering Karimnagar with technology. Transparent today, smarter tomorrow. Technology | Transparency | Accountability | Participation. Smart Governance, Better Karimnagar.",
    keyPoints: [
      "Tier 1: Administrative Leadership — Municipal Commissioner & Department Heads; Policy Decisions; Overall Monitoring & Performance Oversight. Role: Top-level decisions, policy approvals, and strategic oversight.",
      "Tier 2: Elected Representatives — Mayor, Councilors & Standing Committee Chairs; Ward-level Monitoring; Citizen Feedback & Issue Escalation. Role: Local governance, review, and citizen representation.",
      "Tier 3: Citizens — Raise Complaints / Requests; Track Status in Real-time; Provide Feedback & Participate. Role: Active participation, feedback, and trust building.",
    ],
    sections: [
      {
        heading: "Key Benefits",
        items: [
          { title: "Seamless Coordination", text: "Integrated flow of information across all levels." },
          { title: "Transparency & Accountability", text: "Real-time tracking and public visibility." },
          { title: "Faster Decision-Making", text: "Timely data and insights for informed actions." },
          { title: "Efficiency & Cost Savings", text: "Optimized processes and better resource utilization." },
          { title: "Stronger Citizen Trust", text: "Open communication and responsive governance." },
        ],
      },
      {
        heading: "Platform Capabilities",
        items: [
          { title: "Real-Time Dashboards", text: "Live data on services, works, finances & performance" },
          { title: "Grievance Management", text: "End-to-end tracking from raise to resolution" },
          { title: "Budget & Finance Management", text: "Transparent allocation, utilization & reporting" },
          { title: "Ward Performance Monitoring", text: "KPIs, targets vs achievement, rankings" },
          { title: "Reports & Analytics", text: "Data-driven insights for planning and decision support" },
          { title: "Notifications & Alerts", text: "Timely updates and escalations" },
        ],
      },
      {
        heading: "Mobile Access for All",
        items: [
          { title: "Citizens", text: "Easy access & real-time updates" },
          { title: "Councilors", text: "Ward insights & grievance overview" },
          { title: "Officials", text: "Task management & performance tracking" },
        ],
      },
    ],
    tables: [
      {
        title: "Unified Dashboard View – Complaints by Category & Ward Performance",
        headers: ["Category", "Share", "Ward", "Performance"],
        rows: [
          ["Sanitation", "35%", "Ward 1", "85%"],
          ["Roads", "25%", "Ward 2", "72%"],
          ["Water Supply", "20%", "Ward 3", "68%"],
          ["Street Lights", "12%", "Ward 4", "90%"],
          ["Others", "8%", "Ward 5", "78%"],
        ],
      },
    ],
    metrics: [
      { label: "Total Complaints", value: "2,458", sub: "▲18%" },
      { label: "In Progress", value: "320" },
      { label: "Resolved", value: "1,980", sub: "▲20%" },
      { label: "Completion Rate", value: "80%" },
      { label: "Budget Utilized (FY 2024-25)", value: "₹215 Cr", sub: "of ₹315 Cr" },
    ],
    targetRoute: "/",
    fullTranscription: `Recent Complaints: Drainage Overflow – Ward 12 (In Progress); Street Light Not Working – Ward 27 (Resolved).`,
  },
  {
    page: 5,
    title: "4.1 Tier 1: Leadership Dashboard (Mayor & Municipal Commissioner)",
    bannerTagline: "A high-level command interface for policy oversight and administrative control",
    footerTagline: "Smart Governance. Stronger Karimnagar. Better Tomorrow.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Features",
        items: [
          { title: "City-wide live dashboard with ward-level drill-down", text: "Real-time overview of city performance with detailed ward-wise insights." },
          { title: "Digital budget allocation and utilization tracking", text: "Track fund allocation, utilization, and available balance in real time." },
          { title: "AI-enabled grievance routing and prioritization", text: "AI automatically categorizes, routes, and prioritizes grievances for fast resolution." },
          { title: "Automated alerts and escalation mechanisms", text: "Smart alerts for delays, critical issues, and policy violations with escalation to concerned officials." },
        ],
      },
      {
        heading: "Leadership Access",
        items: [
          { title: "Mayor", text: "Policy Oversight, Strategic Decisions, Public Accountability" },
          { title: "Municipal Commissioner", text: "Administrative Control, Operational Monitoring, Performance Management" },
        ],
      },
      {
        heading: "Administrative Significance",
        items: [
          { title: "Enables simultaneous visibility for both Mayor and Municipal Commissioner", text: "Unified view for collaborative oversight and control." },
          { title: "Ensures alignment between elected leadership and administrative machinery", text: "Bridges policy direction with effective execution." },
          { title: "Facilitates data-driven governance and faster decision-making", text: "Real-time insights enable proactive actions and better outcomes." },
        ],
      },
    ],
    tables: [
      {
        title: "Top Pending Wards & Department Performance (Resolution Rate)",
        headers: ["Ward", "Pending", "Department", "Resolution Rate"],
        rows: [
          ["Ward 27", "184", "Sanitation", "82%"],
          ["Ward 12", "142", "Roads", "76%"],
          ["Ward 33", "118", "Water Supply", "75%"],
          ["Ward 18", "95", "Engineering", "68%"],
          ["Ward 45", "76", "Street Lights", "75%"],
        ],
      },
    ],
    metrics: [
      { label: "Total Population", value: "6,10,000" },
      { label: "Total Wards", value: "66" },
      { label: "Total Complaints (Today)", value: "2,458" },
      { label: "In Progress", value: "1,102" },
      { label: "Resolved", value: "1,356" },
      { label: "Resolution Rate", value: "78%" },
      { label: "Budget Utilized", value: "₹138 Cr", sub: "of ₹215 Cr · Balance ₹77 Cr · 64%" },
      { label: "Avg. Resolution Time", value: "2.6 Days", sub: "AI-Routed 1,945 · High Priority 298" },
    ],
    targetRoute: "/leadership",
    fullTranscription: `Live Update: 10:30 AM. Ward-wise Overview legend: Excellent (80-100%), Good (60-79%), Average (40-59%), Poor (0-39%). Grievances by Category: Sanitation 35%, Roads 25%, Water Supply 15%, Street Lights 10%, Others 15%. Recent Alerts: High pendency in Ward 27 – Sanitation (10:15 AM), escalated to Sanitation Department; Budget utilization below 40% in 12 Wards (09:45 AM), review required; Water supply complaints rising in Wards 12, 18, 33 (09:20 AM), immediate attention needed.`,
  },
  {
    page: 6,
    title: "4.2 Tier 2: Ward/Division Management System (Corporators & Field Staff)",
    bannerTagline: "Operational interface for execution and monitoring at ground level",
    footerTagline: "Stronger Wards. Efficient Services. Happier Citizens.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Features",
        items: [
          { title: "Real-time tracking of grievances and civic works", text: "Track and monitor all civic issues and works in real-time for timely resolution." },
          { title: "Status indicators (Pending / In Progress / Completed)", text: "Clear status indicators for transparency and accountability." },
          { title: "Geo-tagged before/after photographic evidence", text: "Capture geo-tagged before and after photos to ensure quality and accountability." },
          { title: "Task assignment and tracking", text: "Assign tasks to field staff and track progress until completion." },
        ],
      },
      {
        heading: "Roles & Outcome",
        items: [
          { title: "Corporators", text: "View ward performance, approve works, and ensure citizen satisfaction." },
          { title: "Field Staff", text: "Receive tasks, update status, upload evidence, and close assignments." },
          { title: "Outcome", text: "Better monitoring, faster resolution, and improved service delivery at the ward level." },
        ],
      },
    ],
    tables: [
      {
        title: "Civic Works Status – Ward 27",
        headers: ["Works", "Total", "Pending", "In Progress", "Completed"],
        rows: [
          ["Road Works", "24", "06", "12", "06"],
          ["Drainage Works", "18", "04", "08", "06"],
          ["Street Lights", "42", "04", "18", "20"],
          ["Sanitation", "44", "12", "16", "14"],
        ],
      },
      {
        title: "Recent Grievances – Ward 27",
        headers: ["Issue", "Location", "Status", "Reported On"],
        rows: [
          ["Garbage not cleared", "Santoshnagar", "Pending", "18 May 2024"],
          ["Street light not working", "Huzurabad Road", "In Progress", "18 May 2024"],
          ["Water leakage", "Green Park Colony", "In Progress", "17 May 2024"],
          ["Drain overflow", "Ramakrishna Nagar", "Completed", "17 May 2024"],
          ["Road potholes", "SRR Thota", "Completed", "17 May 2024"],
        ],
      },
      {
        title: "Task Assignments",
        headers: ["Task", "Assigned To", "Due Date", "Status"],
        rows: [
          ["Clean garbage at Santoshnagar", "Ramesh (Field Staff)", "20 May 2024", "Pending"],
          ["Repair street light", "Suresh (Electrician)", "19 May 2024", "In Progress"],
          ["Desilt drain at Green Park Colony", "Mahesh (Field Staff)", "20 May 2024", "In Progress"],
          ["Fill potholes on SRR Thota Road", "Venkatesh (Field Staff)", "21 May 2024", "Completed"],
        ],
      },
    ],
    metrics: [
      { label: "Total Grievances (Ward 27)", value: "128" },
      { label: "Pending", value: "32" },
      { label: "In Progress", value: "56" },
      { label: "Completed", value: "40" },
      { label: "Overdue", value: "8" },
    ],
    targetRoute: "/ward",
    fullTranscription: `Before / After Evidence: Case ID GRV-2024-27-0045 (Drain Overflow, Ramakrishna Nagar, Completed, geo-tags 17.9860, 79.1188); Case ID GRV-2024-27-0082 (Street Light Not Working, Huzurabad Road, In Progress, geo-tags 18.0065, 79.1260).`,
  },
  {
    page: 7,
    title: "4.3 Tier 3: Citizen Engagement Portal",
    subtitle: "Public-facing interface for transparency and participation",
    bannerTagline: "Empowering Citizens. Building a Better Karimnagar Together.",
    footerTagline: "Your City. Your Voice. Our Commitment.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Features",
        items: [
          { title: "Online grievance submission with photo uploads", text: "Report issues easily with photos and location." },
          { title: "SMS / notification-based status updates", text: "Get real-time updates on your grievances and requests." },
          { title: "Access to ward-level development and budget data", text: "View ward projects, progress and budget utilization." },
          { title: "Citizen feedback and service rating system", text: "Rate services and provide feedback to help us improve." },
        ],
      },
      {
        heading: "Outcome",
        items: [
          { title: "Increased citizen participation", text: "Easy access and real-time engagement encourages more citizens to participate." },
          { title: "Enhanced public trust in governance", text: "Transparency, responsiveness and accountability build stronger trust in the municipal administration." },
        ],
      },
    ],
    tables: [
      {
        title: "Recent Development Projects – Ward 27",
        headers: ["Project", "Status", "Progress", "Budget", "Completion"],
        rows: [
          ["Drainage Improvement", "In Progress", "70%", "₹45.00 L", "Jun 2024"],
          ["Street Light Installation", "Completed", "100%", "₹22.50 L", "Apr 2024"],
          ["Road Repair & Maintenance", "In Progress", "40%", "₹38.00 L", "Jul 2024"],
          ["Park Development", "Planned", "0%", "₹30.00 L", "Aug 2024"],
        ],
      },
    ],
    metrics: [
      { label: "Total Grievances", value: "8,924" },
      { label: "In Progress", value: "2,341" },
      { label: "Completed", value: "6,123" },
      { label: "Overdue", value: "460" },
    ],
    targetRoute: "/citizen",
    fullTranscription: `Portal hero: "Together, Let's Build a Cleaner, Smarter Karimnagar. Report issues. Track progress. See the change." Ward Development Overview (Ward 27): Completed 65%, In Progress 25%, Planned 10%. Submit a Grievance form (Drainage Issue, Green Park Colony, Ward 27, "Drain water is overflowing on the road."). SMS updates for #GRV2024-00234: registered (10:15 AM), in progress (11:45 AM), resolved (04:20 PM). Rate Our Services: 5 stars "Excellent", "Very prompt and effective action. Thank you!"`,
  },
  {
    page: 8,
    title: "5. Ward Performance Evaluation Framework",
    subtitle: "To ensure continuous improvement, a monthly ward performance assessment system is proposed.",
    bannerTagline: "Measure. Monitor. Improve. Better Performance. Better Karimnagar.",
    footerTagline: "Consistent evaluation drives accountability and excellence at the ward level.",
    keyPoints: [],
    sections: [
      {
        heading: "5.1 Monthly Performance Monitoring — each ward is evaluated on predefined KPIs",
        items: [
          { title: "Grievance resolution time", text: "Average time taken to resolve citizen grievances." },
          { title: "Percentage of issues resolved", text: "Percentage of total reported issues that were successfully resolved." },
          { title: "Quality of work (based on citizen feedback)", text: "Average rating given by citizens on the quality of work completed." },
          { title: "Efficiency in budget utilization", text: "Percentage of allocated budget utilized effectively." },
          { title: "Cleanliness and infrastructure maintenance", text: "Assessment of cleanliness, sanitation and infrastructure upkeep in the ward." },
        ],
      },
      {
        heading: "Outcome",
        items: [
          { title: "Increased Accountability", text: "Data-driven evaluation ensures transparency and accountability of each ward." },
          { title: "Continuous Improvement", text: "Regular monitoring helps wards improve performance and service delivery." },
        ],
      },
    ],
    tables: [
      {
        title: "Ward Performance Ranking – May 2024",
        headers: ["Rank", "Ward", "Score", "Performance"],
        rows: [
          ["1", "Ward 12", "91", "Excellent"],
          ["2", "Ward 27 (You)", "85", "Very Good"],
          ["3", "Ward 33", "78", "Good"],
          ["4", "Ward 18", "67", "Average"],
          ["5", "Ward 45", "55", "Needs Improvement"],
        ],
      },
      {
        title: "Performance Improvement Action Plan",
        headers: ["KPI", "Current", "Target", "Action Plan", "Responsible Dept.", "Deadline"],
        rows: [
          ["Grievance Resolution Time", "2.4 Days", "≤ 2 Days", "Improve field response & faster escalation", "Sanitation Department", "30 Jun 2024"],
          ["Issues Resolved", "86%", "≥ 90%", "Increase manpower & monitor pending cases", "Health Department", "30 Jun 2024"],
          ["Quality of Work", "4.3 / 5", "≥ 4.5 / 5", "Ensure quality checks & citizen feedback", "Engineering Department", "30 Jun 2024"],
          ["Budget Utilization", "78%", "≥ 90%", "Plan better & avoid fund under-utilization", "Finance Department", "30 Jun 2024"],
          ["Cleanliness & Infra. Score", "80%", "≥ 90%", "Increase cleaning frequency & maintenance", "Sanitation Department", "30 Jun 2024"],
        ],
      },
    ],
    metrics: [
      { label: "Average Resolution Time", value: "2.4 Days", sub: "↓15% vs Apr 2024 · City 3.5" },
      { label: "Issues Resolved", value: "86%", sub: "↑8% · City 72%" },
      { label: "Quality of Work", value: "4.3 / 5", sub: "↑0.4 · City 3.8" },
      { label: "Budget Utilization", value: "78%", sub: "↑12% · City 65%" },
      { label: "Cleanliness & Infrastructure", value: "80%", sub: "↑10% · City 68%" },
      { label: "Overall – Ward 27", value: "85/100", sub: "Very Good · ↑9 points vs Apr 2024" },
    ],
    targetRoute: "/performance",
    fullTranscription: `Ward Performance Monitoring Dashboard – May 2024 (Ward 27 – Green Park Colony). KPI Trend Dec 2023 to May 2024. Performance Improvement Action Plan (targets ≤ 2 Days, ≥ 90%, ≥ 4.5 / 5, ≥ 90%, ≥ 90%; deadline 30 Jun 2024).`,
  },
  {
    page: 9,
    title: "5.2 Performance Ranking System",
    subtitle: "Data-driven ranking of wards to recognize excellence and drive improvement.",
    bannerTagline: "Recognize Performance. Drive Improvement. Better Wards. Better Karimnagar.",
    footerTagline: "Real-time insights enable leaders to recognize excellence and take timely actions for underperforming wards.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Features",
        items: [
          { title: "Monthly identification of top performing wards", text: "Recognize and reward consistently high-performing wards." },
          { title: "Flagging of underperforming wards for corrective action", text: "Identify gaps and enable timely intervention for better outcomes." },
          { title: "Dashboard visibility at leadership level", text: "Real-time insights for informed decision-making and accountability." },
          { title: "Goal", text: "Promote healthy competition, ensure accountability and deliver better services to citizens." },
        ],
      },
    ],
    tables: [
      {
        title: "Ward Performance Ranking – May 2024",
        headers: ["Rank", "Ward", "Score", "Grade", "Level", "Trend (vs Apr 2024)"],
        rows: [
          ["1", "Ward 27 – Green Park Colony", "89", "A+", "Excellent", "↑5"],
          ["2", "Ward 12 – Satellite Colony", "86", "A", "Very Good", "↑3"],
          ["3", "Ward 33 – Huzurabad Road", "78", "B+", "Good", "↑2"],
          ["4", "Ward 18 – Ramakrishna Nagar", "64", "B", "Average", "↓1"],
          ["5", "Ward 45 – LMD Colony", "52", "C", "Needs Improvement", "↓3"],
          ["6", "Ward 39 – Housing Board Colony", "47", "C", "Poor", "↓2"],
          ["7", "Ward 22 – Kaman", "41", "D", "Poor", "–"],
        ],
      },
    ],
    metrics: [
      { label: "Total Wards", value: "66" },
      { label: "Avg. Overall Score", value: "68.4/100" },
      { label: "Top Performing Ward", value: "Ward 27", sub: "89/100" },
      { label: "Underperforming Wards", value: "3", sub: "Score < 50" },
    ],
    targetRoute: "/performance",
    fullTranscription: `Performance Distribution (66 wards): Excellent (A+) 20%, Very Good (A) 30%, Good (B+) 25%, Average (B) 15%, Needs Improvement (C/D) 10%. Underperforming wards requiring immediate attention: Ward 45 – LMD Colony (52), Ward 39 – Housing Board Colony (47), Ward 22 – Kaman (41).`,
  },
  {
    page: 10,
    title: "5.3 Administrative Impact",
    subtitle: "The performance-driven digital governance system creates a transparent, accountable and efficient municipal administration.",
    bannerTagline: "Data. Transparency. Accountability. Better Governance. Better Karimnagar.",
    footerTagline: "Data-Driven. People-Centric. Performance-Focused. A Better Karimnagar.",
    keyPoints: [],
    sections: [
      {
        heading: "Promotes healthy competition among wards",
        items: [
          { title: "Performance ranking motivates every ward to perform better." },
          { title: "Recognition and rewards for top performing wards." },
          { title: "A culture of healthy competition drives continuous improvement." },
        ],
      },
      {
        heading: "Encourages accountability among corporators and officials",
        items: [
          { title: "Clear tracking of tasks, deadlines and outcomes." },
          { title: "Accountability enforced through real-time monitoring and public visibility." },
          { title: "Responsible leadership and responsive administration." },
        ],
      },
      {
        heading: "Enables targeted interventions by the Municipal Commissioner",
        items: [
          { title: "Real-time data helps identify gaps and bottlenecks." },
          { title: "Enables focused support and corrective actions where it is needed most." },
          { title: "Data-driven decisions for maximum impact." },
        ],
      },
      {
        heading: "Strengthens outcome-based governance (Plan → Execute → Evaluate → Better Outcomes)",
        items: [
          { title: "Focus shifts from activities to measurable outcomes." },
          { title: "Improved services, better infrastructure and higher citizen satisfaction." },
          { title: "Better services. Happier citizens. Stronger Karimnagar." },
        ],
      },
      {
        heading: "Overall Administrative Impact",
        items: [
          { title: "Higher Efficiency", text: "Streamlined processes reduce delays and improve service delivery." },
          { title: "Greater Transparency", text: "Public dashboards and data visibility build trust in governance." },
          { title: "Stronger Accountability", text: "Clear responsibilities and tracking ensure answerability." },
          { title: "Sustainable Development", text: "Effective utilization of resources leads to long-term impact and better quality of life." },
        ],
      },
    ],
    targetRoute: "/performance",
    fullTranscription: `Administrative impact of the performance-driven system: competition, accountability, targeted interventions, outcome-based governance.`,
  },
  {
    page: 11,
    title: "5.4 Key Benefits of the System",
    subtitle: "A smart digital ecosystem for transparent, accountable and efficient governance",
    bannerTagline: "Better Governance. Better Services. Better Karimnagar.",
    footerTagline: "One System. One Goal. One Karimnagar. Transparent. Accountable. Future-Ready.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Benefits",
        items: [
          { title: "End-to-end transparency across all administrative levels", text: "Complete visibility of processes, decisions and outcomes · Transparent fund allocation and utilization · Public access to ward-level data and performance" },
          { title: "Real-time monitoring and faster grievance resolution", text: "Real-time tracking of grievances and civic works · Automated alerts and escalations reduce delays · Citizens get faster responses and timely updates" },
          { title: "Data-backed planning and budgeting", text: "Data-driven insights for better planning · Efficient allocation of resources based on real needs · Improved budget utilization and outcome measurement" },
          { title: "Improved coordination between departments", text: "Seamless information flow across departments · Clear task assignment and progress tracking · Reduced duplication and improved teamwork" },
          { title: "Institutionalization of performance-based governance", text: "Regular performance evaluation of wards and officials · Rewards for top performers and support for lagging areas · Culture of accountability and continuous improvement" },
          { title: "Replicability as a state and national model", text: "Scalable, cost-effective and technology-driven model · Can be easily replicated by other cities and states · Positions Karimnagar as a leader in digital governance" },
        ],
      },
      {
        heading: "System Impact at a Glance",
        items: [
          { title: "Transparency", text: "Open, transparent and accessible governance" },
          { title: "Efficiency", text: "Faster decisions, better service delivery" },
          { title: "Citizen Satisfaction", text: "Responsive governance, happier citizens" },
          { title: "Accountability", text: "Measurable performance and clear responsibility" },
          { title: "Better Resource Use", text: "Optimized budgets, maximum impact" },
          { title: "Stronger Karimnagar", text: "Sustainable development for a better tomorrow" },
        ],
      },
      {
        heading: "Transforming Karimnagar through technology, data and people-centric governance.",
        items: [{ title: "Empowering Leaders" }, { title: "Enabling Officials" }, { title: "Engaging Citizens" }, { title: "Building a Better Karimnagar" }],
      },
    ],
    metrics: [
      { label: "Total Grievances", value: "4,682" },
      { label: "Resolved", value: "3,872" },
      { label: "In Progress", value: "650" },
      { label: "Overdue", value: "160" },
    ],
    targetRoute: "/performance",
    fullTranscription: `Ward Performance Dashboard mock-up – Ward Ranking: Ward 27 – 89, Ward 12 – 86, Ward 33 – 78, Ward 18 – 64, Ward 45 – 52.`,
  },
  {
    page: 12,
    title: "6. Integrated Departmental Workflow & Hierarchical Grievance Redressal Mechanism",
    subtitle: "To ensure seamless coordination and accountability, the proposed system will digitally connect all municipal departments under a unified platform.",
    bannerTagline: "One Platform. One Process. One Responsibility. Effective Grievance Redressal. Better KMC.",
    footerTagline: "Outcome: Effective Coordination. Accountable Governance. Happier Citizens.",
    keyPoints: [],
    sections: [
      {
        heading: "Integrated Departmental Workflow (Unified Digital Platform)",
        items: [
          { title: "Water Supply", text: "Water Supply, Leakage, Pipe Maintenance" },
          { title: "Engineering", text: "Roads, Buildings, Drainage, Bridges" },
          { title: "Sanitation", text: "Garbage Collection, Cleaning, Waste Management" },
          { title: "Electrical", text: "Street Lights, Electrical Maintenance" },
          { title: "Town Planning", text: "Building Approval, Land Use, Layout Planning" },
          { title: "Revenue", text: "Property Tax, Trade License, Land Records, Collections" },
          { title: "Health", text: "Public Health, Disease Control, Health Services" },
          { title: "IT & Data Management", text: "System Management, Data Analytics, Reporting" },
        ],
      },
      {
        heading: "Workflow Process",
        items: [
          { title: "Grievance Submitted", text: "By Citizen / Field Staff / Corporator" },
          { title: "Auto Routing", text: "System routes to the concerned department" },
          { title: "Acknowledgment", text: "Department acknowledges and assigns the task" },
          { title: "Action Taken", text: "Work executed and evidence uploaded" },
          { title: "Resolution & Closure", text: "Verified and closed with citizen feedback" },
        ],
      },
      {
        heading: "Hierarchical Grievance Redressal Mechanism",
        items: [
          { title: "Level 1 – Field Staff (Target: 2 Days)", text: "Receives and acts on grievance. Escalate if not resolved." },
          { title: "Level 2 – Department Officer (Target: 5 Days)", text: "Reviews and ensures resolution. Escalate if not resolved." },
          { title: "Level 3 – Head of Department (Target: 7 Days)", text: "Monitors and directs for resolution. Escalate if not resolved." },
          { title: "Level 4 – Municipal Commissioner (Target: 10 Days)", text: "Intervenes and ensures closure. Escalate if not resolved." },
          { title: "Level 5 – Mayor / Council (As Required)", text: "Final oversight and policy directive." },
        ],
      },
      {
        heading: "Escalation Triggers",
        items: [
          { title: "No action within prescribed time" }, { title: "Unsatisfactory resolution" },
          { title: "Repeated grievances on same issue" }, { title: "Citizen dissatisfaction (low rating)" },
          { title: "Critical / High impact issues" },
        ],
      },
      {
        heading: "Accountability & Transparency",
        items: [
          { title: "Real-time tracking at every level" }, { title: "Digital logs of actions and decisions" },
          { title: "Automatic alerts and notifications" }, { title: "Performance reporting and public dashboard" },
        ],
      },
      {
        heading: "Key Benefits",
        items: [
          { title: "Integrated Coordination", text: "All departments work together on a single platform" },
          { title: "Faster Resolution", text: "Defined timelines ensure quick and effective redressal" },
          { title: "Clear Accountability", text: "Role-based responsibility at every hierarchical level" },
          { title: "Data-Driven Decisions", text: "Insights help in planning, resource allocation and policy-making" },
          { title: "Citizen Satisfaction", text: "Transparent and timely resolution builds trust and confidence" },
        ],
      },
    ],
    targetRoute: "/workflow",
    fullTranscription: `Eight departments connected to the Unified Digital Platform; 5-step workflow; 5-level escalation hierarchy with targets 2, 5, 7, 10 days and As Required.`,
  },
  {
    page: 13,
    title: "6.1 End-to-End Grievance Flow (Citizen → Leadership)",
    subtitle: "A structured, hierarchy-based grievance redressal mechanism for transparent and timely resolution.",
    bannerTagline: "One Citizen. One Grievance. One System. End-to-End Resolution.",
    footerTagline: "Outcome: Faster Resolution ✔ Transparency ✔ Accountability ✔ Citizen Satisfaction ✔ Better Governance ✔",
    keyPoints: [],
    sections: [
      {
        heading: "End-to-End Grievance Flow",
        items: [
          { title: "1. Citizen Submission", text: "Citizen raises a complaint through the portal/app. Provides location, category, description and photo evidence. → Complaint ID Generated & Acknowledgement Sent to Citizen" },
          { title: "2. Ward-Level Routing (Corporator Level)", text: "Grievance is routed to the respective Ward Corporator. Corporator reviews, validates and categorizes the issue. → Issue Validated & Forwarded to Department" },
          { title: "3. Department Allocation", text: "Corporator assigns the issue to the concerned municipal department. Drainage issue → Engineering Department; Garbage issue → Sanitation Department. → Task Assigned & Department with Timeline" },
          { title: "4. Department Execution", text: "Department receives the task with defined timelines. Work is executed and updated in real time with proof (images/status). → Work Completed & Proof Uploaded" },
          { title: "5. Monitoring & Escalation", text: "System monitors progress in real time. If delays occur, automatic escalation is triggered to higher authorities. Full visibility at Municipal Commissioner and Mayor level. → Escalation Ensures Timely Resolution & Accountability" },
        ],
      },
      {
        heading: "Department Assignment",
        items: [
          { title: "Engineering", text: "Drainage, Roads" },
          { title: "Sanitation", text: "Garbage, Cleaning" },
          { title: "Water Supply", text: "Water, Leakage" },
          { title: "Others", text: "Electrical, Parks, etc." },
        ],
      },
      {
        heading: "Escalation Path (if not resolved within time)",
        items: [
          { title: "No Action / Delay", text: "No resolution within defined timeline" },
          { title: "Escalate to Higher Officer", text: "Assistant Engineer / Sanitary Inspector" },
          { title: "Escalate to Department Head", text: "Executive Engineer / Health Officer" },
          { title: "Escalate to Municipal Commissioner", text: "Review and directive for resolution" },
          { title: "Escalate to Mayor", text: "Final oversight and policy intervention" },
        ],
      },
      {
        heading: "Leadership Visibility — Municipal Commissioner and Mayor dashboards",
        items: [{ title: "Real-time dashboards" }, { title: "Data-driven insights" }, { title: "Timely decisions" }, { title: "Better outcomes" }],
      },
    ],
    metrics: [
      { label: "Total Grievances", value: "1,246" },
      { label: "In Progress", value: "312" },
      { label: "Resolved", value: "932" },
    ],
    targetRoute: "/workflow",
    fullTranscription: `Mock form: Location: Green Park Colony; Category: Drainage Issue; Description: Water logging on main road; Photo; SUBMIT. Corporator actions: Review / Validate / Categorize. Department execution steps: Work in Progress, Upload Proof, Update Status.`,
  },
  {
    page: 14,
    title: "6.2 Key Administrative Features",
    subtitle: "A unified digital ecosystem for efficient, accountable & transparent governance.",
    bannerTagline: "One System. All Departments. One Goal. Better Governance. Better Karimnagar.",
    footerTagline: "Digitally Connected. Accountably Delivered. Citizen Centric. Building a Smarter, Responsive & Transparent Karimnagar.",
    keyPoints: [
      "1. Department-wise Digital Integration: All departments operate within a single digital ecosystem, eliminating silos. Integrated. Connected. Accountable.",
    ],
    sections: [
      {
        heading: "2. Defined Accountability at Each Level — Clear Roles. Clear Responsibilities. Better Accountability.",
        items: [
          { title: "Citizen", text: "Raises issue/complaint through portal/app. Responsibility: Provide accurate information." },
          { title: "Corporator", text: "Validates, reviews & routes to department. Responsibility: Validate & ensure correct routing." },
          { title: "Department", text: "Executes the work within defined timelines. Responsibility: Timely execution & status updates." },
          { title: "Commissioner", text: "Monitors performance, ensures compliance. Responsibility: Oversight, escalation & policy intervention." },
        ],
      },
      {
        heading: "4. Real-Time Status Tracking — every action is logged, time-stamped, and visible to leadership",
        items: [
          { title: "Issue Raised", text: "10 May 2024, 10:15 AM" },
          { title: "Assigned to Department", text: "10 May 2024, 10:45 AM" },
          { title: "Work in Progress", text: "11 May 2024, 11:30 AM" },
          { title: "Work Completed, Proof Uploaded", text: "12 May 2024, 04:20 PM" },
          { title: "Resolved & Closed", text: "12 May 2024, 05:10 PM" },
        ],
      },
      {
        heading: "Key Outcomes",
        items: [{ title: "Faster Resolution" }, { title: "Improved Accountability" }, { title: "Transparent Governance" }, { title: "Citizen Satisfaction" }, { title: "Better City Services" }],
      },
    ],
    tables: [
      {
        title: "3. Time-Bound Service Delivery — On-Time Service. Every Time.",
        headers: ["Category", "Example", "SLA", "Escalation Level"],
        rows: [
          ["Water Supply", "Leakage Repair", "24 Hours", "Department Head → Commissioner"],
          ["Sanitation", "Garbage Not Collected", "48 Hours", "Department Head → Commissioner"],
          ["Engineering", "Road / Drainage Issue", "72 Hours", "Department Head → Commissioner"],
          ["Electrical", "Street Light Not Working", "48 Hours", "Department Head → Commissioner"],
          ["Town Planning", "Illegal Construction", "72 Hours", "Department Head → Commissioner"],
          ["Health", "Public Health Issue", "24 Hours", "Department Head → Commissioner"],
        ],
      },
    ],
    metrics: [
      { label: "Total Grievances", value: "12,458" },
      { label: "Resolved", value: "10,234" },
      { label: "In Progress", value: "1,874" },
      { label: "Overdue", value: "350" },
      { label: "SLA Performance", value: "85% On-Time", sub: "15% Delayed" },
    ],
    targetRoute: "/workflow",
    fullTranscription: `Leadership Dashboard View by Department: Engineering 30%, Sanitation 25%, Water Supply 15%, Electrical 10%, Town Planning 10%, Health 10%. Tags: Full Visibility | Time-Stamped Logs | Real-Time Updates | Data-Driven Decisions.`,
  },
  {
    page: 15,
    title: "6.3 Governance Impact",
    subtitle: "A unified digital grievance redressal system driving accountable, efficient and citizen-centric governance.",
    bannerTagline: "Stronger Governance. Greater Accountability. Better Karimnagar.",
    footerTagline: "One System. One Process. One Goal – Better Services for Every Citizen of Karimnagar.",
    keyPoints: [],
    sections: [
      {
        heading: "Governance Impact",
        items: [
          { title: "Ensures smooth flow of communication across hierarchy", text: "Real-time updates and status visibility at every level. Seamless coordination between citizen, corporator, departments and leadership." },
          { title: "Eliminates ambiguity in responsibility between departments", text: "Clearly defined roles and routing rules. Every task assigned to the right department with accountability." },
          { title: "Strengthens administrative accountability at every stage", text: "Every action is logged, time-stamped and traceable. Performance of corporators and departments is measurable and reviewable." },
          { title: "Enables data-driven supervision by Municipal Commissioner", text: "Real-time dashboards and analytics for informed decision-making. Identify problem areas, track performance and take timely interventions." },
          { title: "Reduces delays and manual dependency", text: "Automated routing, alerts and escalations. Digital documentation replaces paperwork and follow-ups." },
        ],
      },
      {
        heading: "Digital Governance Ecosystem — Grievance Flow at a Glance",
        items: [
          { title: "Citizen Raises Issue" }, { title: "Corporator Validates & Routes" }, { title: "Department Executes" },
          { title: "Commissioner Monitors & Reviews" }, { title: "Leadership Takes Action" },
        ],
      },
      {
        heading: "Overall Governance Impact",
        items: [
          { title: "Better Coordination", text: "Stronger collaboration across departments and hierarchy" },
          { title: "Faster Resolution", text: "Issues resolved quicker with real-time tracking and escalations" },
          { title: "Higher Accountability", text: "Clear responsibility at every level ensures ownership" },
          { title: "Smarter Decisions", text: "Data-driven insights enable proactive governance" },
          { title: "Citizens First", text: "Transparent and timely services build trust and satisfaction" },
        ],
      },
    ],
    metrics: [
      { label: "Total Grievances", value: "12,458" },
      { label: "Resolved", value: "10,234" },
      { label: "In Progress", value: "1,874" },
      { label: "Overdue", value: "350" },
      { label: "SLA Performance", value: "85% On-Time", sub: "15% Delayed" },
    ],
    targetRoute: "/workflow",
    fullTranscription: `Real-Time Governance Dashboard (Leadership View) by Department: Engineering 30%, Sanitation 25%, Water Supply 15%, Electrical 10%, Town Planning 10%, Revenue 10%. Transparency. Accountability. Efficiency. Visible • Measurable • Accountable • Efficient • Citizen-Centric.`,
  },
  {
    page: 16,
    title: "6.4 Citizen-Centric Outcome",
    subtitle: "A structured, transparent and responsive governance system that puts citizens at the center of every action.",
    bannerTagline: "Citizens First. Service Always. Better Karimnagar. Better Tomorrow.",
    footerTagline: "Happy Citizens. Stronger Trust. Better Karimnagar.",
    keyPoints: [
      "Citizens experience a structured and responsive governance system.",
      "Increased trust as complaints are: Acknowledged Instantly | Routed Transparently | Resolved Within Timelines",
    ],
    sections: [
      {
        heading: "Citizen Journey: Simple, Transparent, Effective",
        items: [
          { title: "Citizen raises a complaint", text: "Through portal / mobile app / helpline with photo & location." },
          { title: "Instant acknowledgment", text: "Complaint is acknowledged instantly with a unique ID. (Status: Acknowledged)" },
          { title: "Transparent routing", text: "Routed to the concerned ward corporator and department. (Status: Routed)" },
          { title: "Action taken", text: "Department executes the work within the defined timeline. (Status: In Progress)" },
          { title: "Resolved with proof", text: "Work completed with photo evidence and citizen notified. (Status: Resolved)" },
          { title: "Citizen feedback", text: "Citizen rates the service and provides feedback. (Status: Feedback Received)" },
        ],
      },
      {
        heading: "Most Importantly",
        items: [
          { title: "Citizens feel heard, respected, and valued.", text: "Their voice matters. Their concerns are our priority." },
          { title: "Builds a perception that the government is actively responding to their concerns.", text: "Stronger trust. Stronger community. Stronger Karimnagar." },
        ],
      },
      {
        heading: "Citizen-Centric Governance Delivers — Transparency at every step. Accountability at every level. Satisfaction at the end.",
        items: [{ title: "Faster Resolution" }, { title: "Transparent Process" }, { title: "Greater Trust" }, { title: "Higher Satisfaction" }, { title: "Better Governance" }],
      },
    ],
    targetRoute: "/citizen",
    fullTranscription: `Phone: My Complaint #CMP123456 — Acknowledged 10:15 AM, Routed to Department 10:20 AM, In Progress 11:30 AM, Work Completed 02:45 PM, Resolved 03:00 PM. Rate Your Experience (5 stars), SUBMIT.`,
  },
  {
    page: 17,
    title: "6.5 Strategic Value",
    subtitle: "This model ensures that governance is not just reactive, but system-driven, accountable, and citizen-focused, aligning with modern urban administration standards and smart governance principles.",
    bannerTagline: "Smart Governance. Stronger Cities. Better Karimnagar. Better Tomorrow.",
    footerTagline: "Not just reactive. System-driven. Accountable. Citizen-focused. Building a Better Karimnagar Together.",
    keyPoints: [],
    sections: [
      {
        heading: "Key Strategic Advantages",
        items: [
          { title: "System-Driven Governance", text: "Standardized workflows, digital integration and data-backed decisions ensure consistent and efficient governance." },
          { title: "Accountable at Every Level", text: "Clear roles, responsibilities and real-time monitoring drive accountability across citizen, corporator, departments and leadership." },
          { title: "Citizen-Focused Approach", text: "Citizens are at the center. Fast, transparent and respectful service delivery builds trust and satisfaction." },
          { title: "Data-Driven Decision Making", text: "Real-time dashboards and analytics enable informed planning, resource optimization and performance improvement." },
          { title: "Time-Bound and Efficient", text: "Defined SLAs, automated escalations and tracking reduce delays and ensure timely resolution." },
          { title: "Transparency and Trust", text: "End-to-end visibility of every action builds transparency, reduces ambiguity and enhances public trust." },
        ],
      },
      {
        heading: "System-Driven Governance Model — Integrated. Accountable. Citizen-Focused. Future-Ready.",
        items: [
          { title: "Citizen Centric", text: "Putting citizens first in every step." },
          { title: "Integrated Digital Ecosystem", text: "All departments connected on one platform." },
          { title: "Accountability at Every Level", text: "Defined roles, real-time tracking and clear ownership." },
          { title: "Data-Driven Decision Making", text: "Insights and analytics for smarter governance." },
          { title: "Time-Bound Service Delivery", text: "SLA-based resolution with automated escalation." },
          { title: "Transparency and Trust", text: "Open processes, real-time visibility and public confidence." },
        ],
      },
      {
        heading: "Smart Governance Principles Aligned",
        items: [{ title: "Data-Driven" }, { title: "Tech-Enabled" }, { title: "Transparent" }, { title: "Inclusive" }, { title: "Collaborative" }, { title: "Accountable" }],
      },
      {
        heading: "Strategic Outcomes — The Bottom Line: A system that listens, acts and delivers. A better experience for every citizen.",
        items: [
          { title: "Faster Resolution", text: "Issues resolved within timelines, improving citizen satisfaction." },
          { title: "Greater Accountability", text: "Every action is tracked, measured and accountable." },
          { title: "Higher Trust & Confidence", text: "Citizens trust a system that is transparent and responsive." },
          { title: "Better Resource Utilization", text: "Optimized planning and budgeting based on real-time data." },
          { title: "Sustainable Urban Development", text: "Efficient services contribute to cleaner, safer and smarter cities." },
          { title: "Smart Governance Leadership", text: "Empowers leaders with real-time insights to drive impactful decisions." },
        ],
      },
    ],
    targetRoute: "/workflow",
    fullTranscription: `Six strategic advantages, a six-part system-driven governance model, six aligned smart governance principles and six strategic outcomes.`,
  },
  {
    page: 18,
    title: "7. Implementation Strategy",
    subtitle: "A phased and structured approach for seamless deployment, adoption and sustained success.",
    bannerTagline: "Strategic Planning. Smart Execution. Better Karimnagar, Together.",
    footerTagline: "A phased approach. Measurable results. Better Services. Better Governance.",
    keyPoints: [],
    sections: [
      {
        heading: "Phase 1: Approval & System Design",
        items: [
          { title: "Requirement finalization", text: "Understand municipal needs and define functional & technical requirements." },
          { title: "Customization as per municipal workflows", text: "Configure system modules, workflows, roles, and approval hierarchies." },
          { title: "Leadership approval & go-ahead", text: "Final approval from leadership for pilot deployment." },
        ],
      },
      {
        heading: "Phase 2: Pilot Implementation",
        items: [
          { title: "Deployment in 5 selected wards/divisions", text: "Pilot the system in limited geographies to test workflows and integrations." },
          { title: "Training of officials and staff", text: "Conduct role-based training and handholding for smooth adoption." },
          { title: "Performance evaluation and feedback", text: "Measure performance, gather feedback, and identify improvement areas." },
        ],
      },
      {
        heading: "Phase 3: Full-Scale Rollout",
        items: [
          { title: "Expansion to all wards", text: "Scale the solution across all wards/divisions for city-wide coverage." },
          { title: "Continuous monitoring", text: "Real-time dashboards and analytics to track performance and service delivery." },
          { title: "System optimization", text: "Ongoing improvements based on data insights, feedback, and evolving needs." },
        ],
      },
      {
        heading: "Ongoing Success Factors",
        items: [
          { title: "Stakeholder Collaboration" }, { title: "Change Management & Communication" }, { title: "Data Security & Compliance" },
          { title: "Performance Tracking & Improvement" }, { title: "Citizen-Centric Focus" },
        ],
      },
    ],
    targetRoute: "/implementation",
    fullTranscription: `Phase 1 image: system design and workflows board (Grievance Redressal, Department Integration, Monitoring & Analytics, Reports & Dashboard). Phase 2 image: map with pilot wards and "Pilot Deployment" screen. Phase 3 image: Municipal Corporation building with location pins. No timeline, cost or vendor details are given on this slide.`,
  },
  {
    page: 19,
    title: "8. Government Communication & Public Notification System",
    subtitle: "A centralized notification and alert system for real-time communication from the Municipal Corporation to citizens.",
    bannerTagline: "Informed Citizens. Transparent Governance. Stronger Community.",
    footerTagline: "Real-time updates. Greater transparency. Better governance for every citizen.",
    keyPoints: [],
    sections: [
      {
        heading: "8.1 Key Features",
        items: [
          { title: "Emergency Alerts", text: "Instant notifications for critical situations such as Flood warnings, Heavy rainfall alerts, Public safety advisories, Road closures or disruptions. Timely alerts. Safer communities." },
          { title: "Government Decisions & Initiatives", text: "Updates on New government schemes, Development initiatives, Policy decisions affecting citizens. Stay informed. Stay connected." },
          { title: "Budget & Fund Allocation Transparency", text: "Notifications when funds are allocated to specific wards, new projects are approved, infrastructure works are initiated. Your tax. Your right to know." },
          { title: "Ward-Specific Updates", text: "Citizens receive localized notifications relevant to their ward. Examples: “Drainage work initiated in Ward 12”; “Road repair completed in your area”." },
        ],
      },
      {
        heading: "Multi-Channel Communication",
        items: [
          { title: "In-App Notifications" }, { title: "WhatsApp Alerts" }, { title: "SMS Alerts" },
          { title: "Email Alerts" }, { title: "Website Updates" }, { title: "Digital Display Boards" },
        ],
      },
      {
        heading: "Impact",
        items: [
          { title: "Increases transparency and trust" }, { title: "Improves citizen awareness" },
          { title: "Enables quick response" }, { title: "Strengthens public safety and engagement" },
        ],
      },
    ],
    targetRoute: "/notifications",
    fullTranscription: `Phone "Municipal Corporation – Notifications": Emergency Alert: Heavy rainfall alert in your area. Stay safe and avoid low-lying areas. (2 minutes ago); New Initiative: Smart Drainage Project launched in Ward 12. (1 hour ago); Funds Allocated: ₹2.5 Cr allocated for Road Development in Ward 8. (3 hours ago); Ward Update: Drainage work initiated in Ward 12. (5 hours ago). Budget Allocation checklist: Ward 1, 2, 3, 12.`,
  },
  {
    page: 20,
    title: "8.1 Key Features",
    subtitle: "Real-time notifications. Relevant updates. Informed citizens. Stronger community.",
    bannerTagline: "Timely Information. Transparent Governance. Better Karimnagar. Together.",
    footerTagline: "One Platform. Multiple Channels: Mobile App, SMS, Email, WhatsApp, Website, Public Display Systems.",
    keyPoints: [],
    sections: [
      {
        heading: "Emergency Alerts — Early alert. Quick action. Safer community.",
        items: [
          { title: "Flood Warnings", text: "Alerts about rising water levels and potential flooding." },
          { title: "Heavy Rainfall Alerts", text: "Timely updates on heavy rainfall and weather conditions." },
          { title: "Public Safety Advisories", text: "Important safety guidelines and precautionary measures." },
          { title: "Road Closures or Disruptions", text: "Real-time alerts on road blocks, diversions and traffic disruptions." },
        ],
      },
      {
        heading: "Government Decisions & Initiatives — Know the decisions. Be part of progress.",
        items: [
          { title: "New Government Schemes", text: "Information on newly launched schemes and how to benefit." },
          { title: "Development Initiatives", text: "Updates on ongoing and upcoming development projects." },
          { title: "Policy Decisions", text: "Notifications on policies and decisions that impact citizens." },
        ],
      },
      {
        heading: "Budget & Fund Allocation Transparency — Your money. Your right. Full transparency.",
        items: [
          { title: "Funds Allocated to Specific Wards", text: "Get notified when funds are allocated to your ward." },
          { title: "New Projects Approved", text: "Updates on approval of new projects in different areas." },
          { title: "Infrastructure Works Initiated", text: "Information on the start of infrastructure works and public utilities." },
        ],
      },
      {
        heading: "Ward-Specific Updates — Local updates. Relevant information. Stronger neighborhoods.",
        items: [
          { title: "Drainage work initiated in Ward 12", text: "Today, 10:30 AM" },
          { title: "Road repair completed in your area", text: "Today, 09:15 AM" },
          { title: "Street light maintenance scheduled in Ward 8", text: "Yesterday, 06:45 PM" },
        ],
      },
      {
        heading: "Benefits for Citizens",
        items: [{ title: "Timely Information" }, { title: "Better Preparedness" }, { title: "Increased Trust" }, { title: "Active Citizen Participation" }],
      },
    ],
    targetRoute: "/notifications",
    fullTranscription: `Deep dive into the four notification feature sets with a ward-specific updates phone screen.`,
  },
  {
    page: 21,
    title: "8.2 Communication Channels",
    subtitle: "Ensuring timely, accurate and inclusive communication with every citizen through multiple digital channels.",
    bannerTagline: "Right Information. Right Time. Better Karimnagar, Together.",
    footerTagline: "Why Multi-Channel Communication? Ensures no citizen is left behind.",
    keyPoints: [],
    sections: [
      {
        heading: "Mobile App Notifications — instant push notifications directly on citizens’ mobile devices",
        items: [
          { title: "Real-time Alerts", text: "Get emergency alerts, service updates and important announcements instantly." },
          { title: "Personalized & Localized", text: "Receive ward-specific updates and relevant information." },
          { title: "Easy Access", text: "Notifications are saved in the app for quick reference." },
        ],
      },
      {
        heading: "SMS Alerts (For Wider Reach) — text messages for citizens without smartphones, ensuring maximum reach",
        items: [
          { title: "Wider Reach", text: "Reaches every citizen, including those without internet or smartphones." },
          { title: "Short & Clear", text: "Concise and easy-to-understand messages in local language (where applicable)." },
          { title: "Timely & Reliable", text: "Delivered instantly for important updates, alerts and advisories." },
        ],
      },
      {
        heading: "Web Portal Dashboard Updates — centralized information hub on the municipal web portal for all citizens",
        items: [
          { title: "Centralized Information", text: "All announcements, schemes, projects and policies in one place." },
          { title: "Easy to Navigate", text: "User-friendly dashboard with categories for quick access." },
          { title: "Transparent & Up-to-date", text: "Regular updates ensure transparency and build public trust." },
        ],
      },
      {
        heading: "Why Multi-Channel Communication?",
        items: [
          { title: "Ensures no citizen is left behind" }, { title: "Delivers information faster and more effectively" },
          { title: "Improves public awareness and participation" }, { title: "Builds trust through timely and transparent updates" },
        ],
      },
    ],
    targetRoute: "/notifications",
    fullTranscription: `Lock-screen sample (10:30, Wednesday, 22 May). SMS sender "VM-MCKNRG" samples ending "– MCKNRG". Web portal menu: Dashboard, Announcements, Services, Schemes & Initiatives, Tenders, Projects, Reports, Contact Us. Latest Announcements: Emergency Alert (22 May 2024); New Scheme "Property Tax Rebate Scheme 2024-25" (21 May 2024); Project Update: Drainage work initiated in Ward 12 (22 May 2024).`,
  },
  {
    page: 22,
    title: "8.3 Administrative Benefits",
    subtitle: "A strong communication system empowers the administration to inform, engage and serve every citizen better.",
    bannerTagline: "Inform Today. Empower Tomorrow. Better Karimnagar, Together.",
    footerTagline: "Overall Impact: Better Governance, Informed Citizens, Faster Response, Stronger Communities.",
    keyPoints: [],
    sections: [
      {
        heading: "Administrative Benefits",
        items: [
          { title: "Ensures proactive communication from government to citizens", text: "Timely alerts and updates · Citizens stay informed in advance · Better preparedness and coordination" },
          { title: "Reduces misinformation and dependency on informal sources", text: "Rumors → official updates · Accurate and verified information · Less confusion and panic · Reliable source of truth for all" },
          { title: "Strengthens trust and transparency in governance", text: "Open Communication, Accountability, Transparency, Public Trust · Citizens feel heard and valued · More participation and cooperation · Stronger relationship with government" },
          { title: "Enables leadership to broadcast decisions instantly at scale", text: "Instant reach across all wards · Consistent and unified messaging · Quick implementation and impact" },
        ],
      },
      {
        heading: "Overall Impact",
        items: [{ title: "Better Governance" }, { title: "Informed Citizens" }, { title: "Faster Response" }, { title: "Stronger Communities" }],
      },
    ],
    targetRoute: "/notifications",
    fullTranscription: `Four administrative benefits of the communication system.`,
  },
  {
    page: 23,
    title: "8.4 Citizen Impact",
    subtitle: "Effective communication empowers citizens and builds a stronger, more connected community.",
    bannerTagline: "Inform. Engage. Empower. Better Karimnagar, Together.",
    footerTagline: "Connected Citizens. Engaged Community. Empowered Karimnagar.",
    keyPoints: [
      "This transforms governance from REACTIVE (complaints-based) to PROACTIVE (communication-driven)",
    ],
    sections: [
      {
        heading: "Citizens stay informed, aware, and connected — An informed citizen is an empowered citizen.",
        items: [
          { title: "Timely alerts and updates on important events, emergencies, and services." },
          { title: "Easy access to government decisions, schemes, and initiatives." },
          { title: "Ward-specific updates keep citizens informed about local developments." },
          { title: "Multiple channels ensure no one is left behind." },
        ],
      },
      {
        heading: "Increased participation in civic activities — When citizens participate, communities prosper.",
        items: [
          { title: "Citizens actively engage in discussions, surveys, and feedback." },
          { title: "Higher participation in public meetings, cleanliness drives, and community initiatives." },
          { title: "Collaborative efforts lead to better outcomes for the city." },
        ],
      },
      {
        heading: "Stronger perception of a responsive and active government — Trust today, stronger tomorrow. Together for a better Karimnagar.",
        items: [
          { title: "Transparent communication builds trust and confidence in governance." },
          { title: "Citizens see the government as accessible, accountable, and responsive." },
          { title: "Stronger relationship between citizens and administration for a better city." },
        ],
      },
      {
        heading: "Reactive",
        items: [
          { title: "Citizen Faces An Issue" }, { title: "Citizen Raises A Complaint" }, { title: "Long Delays & Follow-ups" },
          { title: "Uncertainty & Frustration" }, { title: "Low Satisfaction & Trust" },
        ],
      },
      {
        heading: "Proactive",
        items: [
          { title: "Government Shares Information Proactively" }, { title: "Citizen Stays Informed & Engaged" }, { title: "Timely Actions & Updates" },
          { title: "Confidence & Participation" }, { title: "High Satisfaction & Trust" },
        ],
      },
    ],
    targetRoute: "/notifications",
    fullTranscription: `Phone "Latest Updates": Emergency Alert (heavy rainfall alert for the next 24 hours, Today 10:30 AM); New Scheme (Property Tax Rebate Scheme 2024-25 launched, Today 09:15 AM); Project Update (Drainage work initiated in Ward 12, Today 08:45 AM); Road Repair Completed (road repair completed in your area, Yesterday 06:30 PM).`,
  },
  {
    page: 24,
    title: "9. Governance & Monitoring Mechanism",
    bannerTagline: "Monitor. Analyze. Act. Better Karimnagar, Together.",
    footerTagline: "Strong Governance. Timely Action. Better Karimnagar.",
    keyPoints: [
      "Central monitoring by Municipal Commissioner's office with city-wide real-time visibility.",
      "Periodic review meetings using live dashboard metrics to address bottlenecks.",
      "Automated monthly performance reports and ward rankings.",
      "6-Step Automated escalation of critical issues and SLA breaches to senior leadership."
    ],
    tables: [
      {
        title: "Monthly Performance Report – May 2024",
        headers: ["Rank", "Ward", "Resolution Rate", "Avg. TAT (Days)", "Citizen Satisfaction"],
        rows: [
          ["1", "Ward 12", "96%", "2.1", "4.6"],
          ["2", "Ward 8", "92%", "2.8", "4.3"],
          ["3", "Ward 5", "90%", "3.1", "4.2"],
        ]
      }
    ],
    metrics: [
      { label: "Total Complaints", value: "12,642 (approx.)" },
      { label: "Resolved", value: "10,328" },
      { label: "City Resolution Rate", value: "80.4%" }
    ],
    targetRoute: "/monitoring",
    fullTranscription: `4 Monitoring mechanisms: Central monitoring by Commissioner, Periodic review meetings, Monthly performance reports and rankings, Automated escalation. Report table May 2024. 6-step escalation workflow.`
  },
  {
    page: 25,
    title: "10. Conclusion & Way Forward",
    bannerTagline: "Municipal Corporation Karimnagar | Smart Governance. Better Services. Stronger Karimnagar.",
    footerTagline: "Together, let’s build a smarter, transparent, and more liveable Karimnagar.",
    keyPoints: [
      "Transformational step towards smart urban governance in Karimnagar.",
      "Core gains: Greater Efficiency, Enhanced Transparency, Measurable Performance Outcomes.",
      "5 Impact Areas: Citizen-Centric Services, Data-Driven Governance, Financial Transparency, Ward Empowerment, Institutional Strengthening.",
      "5-Step Way Forward: Adopt → Capacity Building → Continuous Optimization → Collaborate → Scale & Innovate."
    ],
    targetRoute: "/implementation",
    fullTranscription: `Conclusion text. Core gains. 5 key impact areas. Way forward 5 pillars (Adopt, Capacity Building, Continuous Optimization, Collaborate, Scale & Innovate). Karimnagar Smart City Platform phone mock.`
  },
  {
    page: 26,
    title: "11. Request for Approval",
    bannerTagline: "To take a decisive step towards smart, transparent and citizen-centric governance in Karimnagar.",
    footerTagline: "We seek your approval to move forward with this impactful initiative for the betterment of Karimnagar and its citizens.",
    keyPoints: [
      "Approval sought to initiate: 1) Development & deployment of digital governance platform, 2) Pilot implementation in 5 selected wards, 3) Formation of monitoring committee.",
      "Your approval today, a better Karimnagar tomorrow.",
      "Expected Outcomes: Improved Efficiency, Enhanced Transparency, Better Citizen Experience, Data-Driven Decisions, Stronger Governance."
    ],
    targetRoute: "/implementation",
    fullTranscription: `Subtitle: To take a decisive step... 3 Approval requests: Development & deployment, Pilot implementation, Formation of monitoring committee. Call-out box. Expected outcomes list. Closing approval box with signature block.`
  }
];
