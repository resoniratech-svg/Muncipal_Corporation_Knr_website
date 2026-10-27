#!/usr/bin/env python3
"""
Translates all 26 slides into Telugu and Hindi with high-fidelity municipal terminology.
"""
import json
import re

with open("scripts/deckStrings.json") as f:
    deck = json.load(f)

# Master translation dictionary
T = {
    # Page 1
    "1. Executive Summary": ("1. కార్యనిర్వాహక సారాంశం", "1. कार्यकारी सारांश"),
    "Karimnagar Municipal Corporation. Towards Transparent, Accountable & Smart Governance": (
        "కరీంనగర్ మున్సిపల్ కార్పొరేషన్. పారదర్శక, జవాబుదారీ & స్మార్ట్ పాలన వైపు",
        "करीमनगर नगर निगम। पारदर्शी, जवाबदेह और स्मार्ट शासन की ओर"
    ),
    "The initiative aims to position Karimnagar as a model municipal corporation for smart governance.": (
        "కరీంనగర్‌ను స్మార్ట్ పాలనకు ఆదర్శ మున్సిపల్ కార్పొరేషన్‌గా నిలపడమే ఈ చొరవ లక్ష్యం.",
        "इस पहल का उद्देश्य करीमनगर को स्मार्ट शासन के लिए एक आदर्श नगर निगम के रूप में स्थापित करना है।"
    ),
    "Urban governance in Karimnagar requires a structured, technology-driven approach to address gaps in transparency, accountability, and service delivery.": (
        "కరీంనగర్‌లో పట్టణ పాలనకు పారదర్శకత, జవాబుదారీతనం మరియు సేవల డెలివరీలో లోపాలను సరిదిద్దడానికి నిర్మాణాత్మక, సాంకేతిక ఆధారిత విధానం అవసరం.",
        "करीमनगर में शहरी शासन को पारदर्शिता, जवाबदेही और सेवा वितरण में कमियों को दूर करने के लिए एक संरचित, प्रौद्योगिकी-संचालित दृष्टिकोण की आवश्यकता है।"
    ),
    "This proposal outlines the implementation of a comprehensive digital governance platform that integrates administrative leadership, elected representatives, and citizens into a unified system.": (
        "ఈ ప్రతిపాదన పరిపాలనా నాయకత్వం, ప్రజాప్రతినిధులు మరియు పౌరులను ఏకీకృత వ్యవస్థగా అనుసంధానించే సమగ్ర డిజిటల్ పాలన వేదిక అమలును వివరిస్తుంది.",
        "यह प्रस्ताव एक व्यापक डिजिटल गवर्नेंस प्लेटफॉर्म के कार्यान्वयन की रूपरेखा तैयार करता है जो प्रशासनिक नेतृत्व, निर्वाचित प्रतिनिधियों और नागरिकों को एक एकीकृत प्रणाली में जोड़ता है।"
    ),
    "The platform will enable": ("ఈ వేదిక కింది అంశాలను సాధ్యం చేస్తుంది", "यह मंच निम्नलिखित को सक्षम करेगा"),
    "Real-time monitoring of civic issues": ("పౌర సమస్యల రియల్-టైమ్ పర్యవేక్షణ", "नागरिक समस्याओं की रीयल-टाइम निगरानी"),
    "Capture, track, and resolve citizen complaints in real time with geo-tagging and dashboards.": (
        "జియో-ట్యాగింగ్ మరియు డాష్‌బోర్డులతో పౌరుల ఫిర్యాదులను నిజ సమయంలో నమోదు చేయడం, ట్రాక్ చేయడం మరియు పరిష్కరించడం.",
        "जियो-टैगिंग और डैशबोर्ड के साथ रीयल-टाइम में नागरिक शिकायतों को दर्ज करना, ट्रैक करना और हल करना।"
    ),
    "Transparent budget allocation and tracking": ("పారదర్శక బడ్జెట్ కేటాయింపు మరియు ట్రాకింగ్", "पारदर्शी बजट आवंटन और ट्रैकिंग"),
    "End-to-end visibility of budget allocation, utilization, and expenditure at ward and department levels.": (
        "వార్డు మరియు శాఖా స్థాయిలలో బడ్జెట్ కేటాయింపు, వినియోగం మరియు ఖర్చుల సమగ్ర దృశ్యమానత.",
        "वार्ड और विभाग स्तर पर बजट आवंटन, उपयोग और व्यय की शुरू से अंत तक दृश्यता।"
    ),
    "Data-driven decision-making": ("డేటా ఆధారిత నిర్ణయాధికారం", "डेटा-संचालित निर्णय लेना"),
    "Use analytics and insights to identify trends, prioritize interventions, and improve service outcomes.": (
        "ట్రెండ్‌లను గుర్తించడానికి, ప్రాధాన్యతలను నిర్ణయించడానికి మరియు సేవా ఫలితాలను మెరుగుపరచడానికి విశ్లేషణలను ఉపయోగించండి.",
        "रुझानों की पहचान करने, प्राथमिकताओं को तय करने और सेवा परिणामों में सुधार के लिए एनालिटिक्स का उपयोग करें।"
    ),
    "Performance evaluation at ward level": ("వార్డు స్థాయిలో పనితీరు మూల్యాంకనం", "वार्ड स्तर पर प्रदर्शन मूल्यांकन"),
    "Measure and compare ward performance across key indicators to promote accountability and competition.": (
        "జవాబుదారీతనం మరియు ఆరోగ్యకరమైన పోటీని పెంపొందించడానికి కీలక సూచికల ద్వారా వార్డు పనితీరును కొలవండి మరియు పోల్చండి.",
        "जवाबदेही और प्रतिस्पर्धा को बढ़ावा देने के लिए प्रमुख संकेतकों के आधार पर वार्ड प्रदर्शन को मापें और तुलना करें।"
    ),
    "Stakeholders": ("భాగస్వాములు", "हितधारक"),
    "Administrative Leadership": ("పరిపాలనా నాయకత్వం", "प्रशासनिक नेतृत्व"),
    "Informed decisions, efficient monitoring, and improved coordination.": (
        "సమాచారంతో కూడిన నిర్ణయాలు, సమర్థవంతమైన పర్యవేక్షణ మరియు మెరుగైన సమన్వయం.",
        "सटीक निर्णय, कुशल निगरानी और बेहतर समन्वय।"
    ),
    "Elected Representatives": ("ఎన్నికైన ప్రజాప్రతినిధులు", "निर्वाचित प्रतिनिधि"),
    "Better insights, stronger engagement, and responsible governance.": (
        "మెరుగైన అంతర్దృష్టులు, బలమైన భాగస్వామ్యం మరియు బాధ్యతాయుతమైన పాలన.",
        "बेहतर अंतर्दृष्टि, मजबूत जुड़ाव और जिम्मेदार शासन।"
    ),
    "Citizens": ("పౌరులు", "नागरिक"),
    "Easy access to services, transparency, and a stronger voice in governance.": (
        "సేవలకు సులభమైన అందుబాటు, పారదర్శకత మరియు పాలనలో బలమైన గొంతుక.",
        "सेवाओं तक आसान पहुंच, पारदर्शिता और शासन में मजबूत भागीदारी।"
    ),
    "My Karimnagar – Citizen App": ("నా కరీంనగర్ – పౌర యాప్", "माई करीमनगर – नागरिक ऐप"),
    "Raise Complaint": ("ఫిర్యాదు చేయండి", "शिकायत दर्ज करें"),
    "Track Status": ("స్థితిని ట్రాక్ చేయండి", "स्थिति ट्रैक करें"),
    "Pay Taxes": ("పన్నులు చెల్లించండి", "कर भुगतान करें"),
    "Feedback": ("అభిప్రాయం", "प्रतिक्रिया"),
    "Notices": ("నోటీసులు", "सूचनाएं"),
    "Call Helpline": ("హెల్ప్‌లైన్‌కు కాల్ చేయండి", "हेल्पलाइन पर कॉल करें"),
    "Karimnagar Municipal Dashboard – Top Issue Categories & Ward Performance": (
        "కరీంనగర్ మున్సిపల్ డాష్‌బోర్డ్ – అగ్ర సమస్య విభాగాలు & వార్డు పనితీరు",
        "करीमनगर नगर निगम डैशबोर्ड – शीर्ष समस्या श्रेणियां और वार्ड प्रदर्शन"
    ),

    # Page 2
    "2. Objectives": ("2. లక్ష్యాలు", "2. उद्देश्य"),
    "Karimnagar Municipal Corporation | Smart Governance. Better Service. Stronger Karimnagar.": (
        "కరీంనగర్ మున్సిపల్ కార్పొరేషన్ | స్మార్ట్ పాలన. మెరుగైన సేవ. దృఢమైన కరీంనగర్.",
        "करीमनगर नगर निगम | स्मार्ट शासन। बेहतर सेवा। मजबूत करीमनगर।"
    ),
    "Our Goal: Build a Transparent, Efficient, Citizen-Centric and Performance-Driven Municipal Corporation for a Better Karimnagar.": (
        "మా లక్ష్యం: మెరుగైన కరీంనగర్ కోసం పారదర్శక, సమర్థవంతమైన, పౌర-కేంద్రీకృత మరియు పనితీరు ఆధారిత మున్సిపల్ కార్పొరేషన్‌ను నిర్మించడం.",
        "हमारा लक्ष्य: एक बेहतर करीमनगर के लिए पारदर्शी, कुशल, नागरिक-केंद्रित और प्रदर्शन-संचालित नगर निगम का निर्माण करना।"
    ),
    "To establish end-to-end transparency in municipal operations": (
        "మున్సిపల్ కార్యకలాపాలలో సమగ్ర పారదర్శకతను నెలకొల్పడం",
        "नगर निगम के कार्यों में शुरू से अंत तक पारदर्शिता स्थापित करना"
    ),
    "To enable real-time grievance redressal tracking": (
        "రియల్-టైమ్ ఫిర్యాదుల పరిష్కార ట్రాకింగ్‌ను సాధ్యం చేయడం",
        "रीयल-टाइम शिकायत निवारण ट्रैकिंग सक्षम करना"
    ),
    "To improve efficiency in budget utilization": (
        "బడ్జెట్ వినియోగంలో సామర్థ్యాన్ని మెరుగుపరచడం",
        "बजट उपयोग में दक्षता में सुधार करना"
    ),
    "To strengthen citizen engagement and trust": (
        "పౌర భాగస్వామ్యాన్ని మరియు నమ్మకాన్ని బలోపేతం చేయడం",
        "नागरिक सहभागिता और विश्वास को मजबूत करना"
    ),
    "To introduce a performance-driven administrative ecosystem across all wards": (
        "అన్ని వార్డులలో పనితీరు ఆధారిత పరిపాలనా పర్యావరణ వ్యవస్థను ప్రవేశపెట్టడం",
        "सभी वार्डों में एक प्रदर्शन-संचालित प्रशासनिक पारिस्थितिकी तंत्र शुरू करना"
    ),
    "03 Improved Efficiency in Budget Utilization": ("03 బడ్జెట్ వినియోగంలో మెరుగైన సామర్థ్యం", "03 बजट उपयोग में बेहतर दक्षता"),
    "Optimized Spending": ("ఆప్టిమైజ్ చేసిన ఖర్చు", "अनुकूलित व्यय"),
    "Better Planning": ("మెరుగైన ప్రణాళిక", "बेहतर योजना"),
    "Maximum Impact": ("గరిష్ట ప్రభావం", "अधिकतम प्रभाव"),
    "04 Strengthen Citizen Engagement & Trust — “Your Voice Our Priority”": (
        "04 పౌర భాగస్వామ్యం & నమ్మకాన్ని బలోపేతం చేయడం — “మీ గొంతుక మా ప్రాధాన్యత”",
        "04 नागरिक सहभागिता और विश्वास को मजबूत करना — “आपकी आवाज हमारी प्राथमिकता”"
    ),
    "Participate in decisions": ("నిర్ణయాలలో పాల్గొనండి", "निर्णयों में भाग लें"),
    "Stay informed in real-time": ("రియల్-టైమ్‌లో తాజా సమాచారం పొందండి", "रीयल-टाइम में अपडेट रहें"),
    "Share feedback easily": ("సులభంగా అభిప్రాయాన్ని పంచుకోండి", "आसानी से प्रतिक्रिया साझा करें"),
    "Build trust together": ("కలిసి నమ్మకాన్ని నిర్మించండి", "साथ मिलकर विश्वास का निर्माण करें"),
    "05 Performance-Driven Administrative Ecosystem Across All Wards": (
        "05 అన్ని వార్డులలో పనితీరు ఆధారిత పరిపాలనా పర్యావరణ వ్యవస్థ",
        "05 सभी वार्डों में प्रदर्शन-संचालित प्रशासनिक पारिस्थितिकी तंत्र"
    ),
    "KPIs Monitoring": ("కెపిఐల పర్యవేక్షణ", "केपीआई निगरानी"),
    "Data-Driven Decisions": ("డేటా ఆధారిత నిర్ణయాలు", "डेटा-संचालित निर्णय"),
    "Performance Evaluation": ("పనితీరు మూల్యాంకనం", "प्रदर्शन मूल्यांकन"),
    "Continuous Improvement": ("నిరంతర మెరుగుదల", "निरंतर सुधार"),
    "01 Department Wise Expenditure": ("01 శాఖల వారీ ఖర్చు", "01 विभागवार व्यय"),
    "05 Ward Performance Overview": ("05 వార్డు పనితీరు అవలోకనం", "05 वार्ड प्रदर्शन अवलोकन"),
    "02 Grievance #GRV2024/001245": ("02 ఫిర్యాదు #GRV2024/001245", "02 शिकायत #GRV2024/001245"),
    "Water leakage on Road, Booth Colony – Ward 12": (
        "బూత్ కాలనీ రోడ్డుపై నీటి లీకేజీ – వార్డు 12",
        "बूथ कॉलोनी सड़क पर पानी का रिसाव – वार्ड 12"
    ),

    # Page 3
    "3. Key Challenges Identified": ("3. గుర్తించిన కీలక సవాళ్లు", "3. पहचानी गई मुख्य चुनौतियाँ"),
    "Challenges hinder effective governance and citizen trust.": (
        "సవాళ్లు సమర్థవంతమైన పాలనకు మరియు పౌరుల విశ్వాసానికి ఆటంకం కలిగిస్తాయి.",
        "चुनौतियाँ प्रभावी शासन और नागरिक विश्वास में बाधा डालती हैं।"
    ),
    "Identifying challenges today to build smarter solutions for tomorrow. Smart Karimnagar – Better Governance. Better City.": (
        "రేపటి కోసం తెలివైన పరిష్కారాలను రూపొందించడానికి నేటి సవాళ్లను గుర్తించడం. స్మార్ట్ కరీంనగర్ – మెరుగైన పాలన. మెరుగైన నగరం.",
        "कल के लिए बेहतर समाधान बनाने हेतु आज की चुनौतियों की पहचान। स्मार्ट करीमनगर – बेहतर शासन। बेहतर शहर।"
    ),
    "Absence of a centralized monitoring system across 66 wards": (
        "66 వార్డులలో కేంద్రీకృత పర్యవేక్షణ వ్యవస్థ లేకపోవడం",
        "66 वार्डों में केंद्रीकृत निगरानी प्रणाली का अभाव"
    ),
    "Delays due to manual grievance handling processes": (
        "మాన్యువల్ ఫిర్యాదుల నిర్వహణ ప్రక్రియల వల్ల ఆలస్యాలు",
        "मैनुअल शिकायत प्रबंधन प्रक्रियाओं के कारण होने वाली देरी"
    ),
    "Limited visibility into fund allocation and utilization": (
        "నిధుల కేటాయింపు మరియు వినియోగంలో పరిమిత దృశ్యమానత",
        "धन आवंटन और उपयोग में सीमित दृश्यता"
    ),
    "Lack of measurable performance indicators for wards": (
        "వార్డుల కోసం కొలవగల పనితీరు సూచికలు లేకపోవడం",
        "वार्डों के लिए मापने योग्य प्रदर्शन संकेतकों का अभाव"
    ),
    "Minimal structured interaction between citizens and administration": (
        "పౌరులు మరియు పరిపాలన మధ్య నిర్మాణాత్మక పరస్పర చర్యల లోపం",
        "नागरिकों और प्रशासन के बीच न्यूनतम संरचित संवाद"
    ),
    "What the challenges look like today": ("నేటి సవాళ్లు ఎలా ఉన్నాయి", "आज की चुनौतियाँ कैसी दिखती हैं"),
    "66 Wards – No Unified Monitoring System": ("66 వార్డులు – ఏకీకృత పర్యవేక్షణ వ్యవస్థ లేదు", "66 वार्ड – कोई एकीकृत निगरानी प्रणाली नहीं"),
    "Pending Files": ("పెండింగ్ ఫైళ్లు", "लंबित फाइलें"),
    "Stacks of paper beside a clock.": ("గడియారం పక్కన పేపర్ల దస్త్రాలు.", "घड़ी के पास कागजों का ढेर।"),
    "Limited Transparency": ("పరిమిత పారదర్శకత", "सीमित पारदर्शिता"),
    "Funds Allocated → Utilization Unclear → Limited Insights": (
        "నిధులు కేటాయించబడ్డాయి → వినియోగం అస్పష్టంగా ఉంది → పరిమిత అంతర్దృష్టులు",
        "धन आवंटित → उपयोग अस्पष्ट → सीमित अंतर्दृष्टि"
    ),
    "No Standardized Metrics": ("ప్రామాణిక కొలమానాలు లేవు", "कोई मानकीकृत मेट्रिक्स नहीं"),
    "Ward 12, Ward 27, Ward 43, Ward 65 — No Comparison, No Accountability": (
        "వార్డు 12, వార్డు 27, వార్డు 43, వార్డు 65 — పోలిక లేదు, జవాబుదారీతనం లేదు",
        "वार्ड 12, वार्ड 27, वार्ड 43, वार्ड 65 — कोई तुलना नहीं, कोई जवाबदेही नहीं"
    ),
    "No Response": ("స్పందన లేదు", "कोई उत्तर नहीं"),
    "Complaint box with no response.": ("స్పందన లేని ఫిర్యాదుల పెట్టె.", "बिना किसी उत्तर के शिकायत पेटी।"),
    "Resulting effects": ("ఫలితంగా ఏర్పడే ప్రభావాలు", "इसके परिणामस्वरूप प्रभाव"),
    "Operational Delays": ("కార్యాచరణ ఆలస్యాలు", "परिचालन में देरी"),
    "Low Public Trust": ("ప్రజల్లో తక్కువ నమ్మకం", "जनता में कम विश्वास"),
    "Suboptimal Resource Utilization": ("వనరుల అసంపూర్ణ వినియోగం", "संसाधनों का कम उपयोग"),

    # Page 4
    "4. Proposed Solution: Integrated 3-Tier Digital Governance System": (
        "4. ప్రతిపాదిత పరిష్కారం: సమగ్ర 3-అంచెల డిజిటల్ పాలన వ్యవస్థ",
        "4. प्रस्तावित समाधान: एकीकृत 3-स्तरीय डिजिटल गवर्नेंस प्रणाली"
    ),
    "A centralized digital platform ensuring seamless coordination without altering the existing administrative hierarchy.": (
        "ఇప్పటికే ఉన్న పరిపాలనా క్రమానుగతాన్ని మార్చకుండా అతుకులు లేని సమన్వయాన్ని నిర్ధారించే కేంద్రీకృత డిజిటల్ వేదిక.",
        "मौजूदा प्रशासनिक पदानुक्रम को बदले बिना निर्बाध समन्वय सुनिश्चित करने वाला एक केंद्रीकृत डिजिटल प्लेटफॉर्म।"
    ),
    "Centralized Digital Platform: One System, One Source of Truth": (
        "కేంద్రీకృత డిజిటల్ వేదిక: ఒకే వ్యవస్థ, ఒకే అధికారిక సమాచార మూలం",
        "केंद्रीकृत डिजिटल प्लेटफॉर्म: एक प्रणाली, सत्य का एक स्रोत"
    ),
    "Empowering Karimnagar with technology. Transparent today, smarter tomorrow. Technology | Transparency | Accountability | Participation. Smart Governance, Better Karimnagar.": (
        "సాంకేతికతతో కరీంనగర్‌కు సాధికారత. నేడు పారదర్శకం, రేపు మరింత స్మార్ట్. సాంకేతికత | పారదర్శకత | జవాబుదారీతనం | భాగస్వామ్యం. స్మార్ట్ పాలన, మెరుగైన కరీంనగర్.",
        "प्रौद्योगिकी के साथ करीमनगर का सशक्तिकरण। आज पारदर्शी, कल अधिक स्मार्ट। प्रौद्योगिकी | पारदर्शिता | जवाबदेही | सहभागिता। स्मार्ट शासन, बेहतर करीमनगर।"
    ),
    "Tier 1: Administrative Leadership — Municipal Commissioner & Department Heads; Policy Decisions; Overall Monitoring & Performance Oversight. Role: Top-level decisions, policy approvals, and strategic oversight.": (
        "అంచె 1: పరిపాలనా నాయకత్వం — మున్సిపల్ కమిషనర్ & శాఖాధిపతులు; విధాన నిర్ణయాలు; మొత్తం పర్యవేక్షణ & పనితీరు పర్యవేక్షణ. పాత్ర: ఉన్నత స్థాయి నిర్ణయాలు, విధాన ఆమోదాలు మరియు వ్యూహాత్మక పర్యవేక్షణ.",
        "स्तर 1: प्रशासनिक नेतृत्व — नगर निगम आयुक्त और विभागाध्यक्ष; नीतिगत निर्णय; समग्र निगरानी और प्रदर्शन निरीक्षण। भूमिका: शीर्ष-स्तरीय निर्णय, नीति अनुमोदन और रणनीतिक निरीक्षण।"
    ),
    "Tier 2: Elected Representatives — Mayor, Councilors & Standing Committee Chairs; Ward-level Monitoring; Citizen Feedback & Issue Escalation. Role: Local governance, review, and citizen representation.": (
        "అంచె 2: ఎన్నికైన ప్రజాప్రతినిధులు — మేయర్, కార్పొరేటర్లు & స్థాయీ సంఘం అధ్యక్షులు; వార్డు స్థాయి పర్యవేక్షణ; పౌర అభిప్రాయం & సమస్యల తీవ్రతరం. పాత్ర: స్థానిక పాలన, సమీక్ష మరియు పౌర ప్రాతినిధ్యం.",
        "स्तर 2: निर्वाचित प्रतिनिधि — महापौर, पार्षद और स्थायी समिति अध्यक्ष; वार्ड-स्तरीय निगरानी; नागरिक प्रतिक्रिया और समस्या एस्केलेशन। भूमिका: स्थानीय शासन, समीक्षा और नागरिक प्रतिनिधित्व।"
    ),
    "Tier 3: Citizens — Raise Complaints / Requests; Track Status in Real-time; Provide Feedback & Participate. Role: Active participation, feedback, and trust building.": (
        "అంచె 3: పౌరులు — ఫిర్యాదులు / అభ్యర్థనలు సమర్పించండి; స్థితిని నిజ సమయంలో ట్రాక్ చేయండి; అభిప్రాయం అందించండి & పాల్గొనండి. పాత్ర: చురుకైన భాగస్వామ్యం, అభిప్రాయం మరియు నమ్మకం పెంపు.",
        "स्तर 3: नागरिक — शिकायतें / अनुरोध दर्ज करें; रीयल-टाइम में स्थिति ट्रैक करें; प्रतिक्रिया दें और भाग लें। भूमिका: सक्रिय भागीदारी, प्रतिक्रिया और विश्वास निर्माण।"
    ),
    "Key Benefits": ("ముఖ్య ప్రయోజనాలు", "मुख्य लाभ"),
    "Seamless Coordination": ("అతుకులు లేని సమన్వయం", "निर्बाध समन्वय"),
    "Integrated flow of information across all levels.": ("అన్ని స్థాయిలలో సమాచార ఏకీకృత ప్రవాహం.", "सभी स्तरों पर सूचना का एकीकृत प्रवाह।"),
    "Data-Driven Decisions": ("డేటా ఆధారిత నిర్ణయాలు", "डेटा-संचालित निर्णय"),
    "Real-time data eliminates guesswork.": ("రియల్-టైమ్ డేటా ఊహాగానాలను తొలగిస్తుంది.", "रीयल-टाइम डेटा अनुमान लगाने की जरूरत खत्म करता है।"),
    "Faster Redressal": ("వేగవంతమైన పరిష్కారం", "त्वरित निवारण"),
    "Automated routing and escalation reduce delays.": ("స్వయంచాలక రూటింగ్ మరియు తీవ్రతరం ఆలస్యాలను తగ్గిస్తాయి.", "स्वचालित रूटिंग और एस्केलेशन से देरी कम होती है।"),
    "Platform Capabilities": ("వేదిక సామర్థ్యాలు", "प्लेटफॉर्म की क्षमताएं"),
    "Real-Time Dashboards": ("రియల్-టైమ్ డాష్‌బోర్డులు", "रीयल-टाइम डैशबोर्ड"),
    "Live data on services, works, finances & performance": ("సేవలు, పనులు, నిధులు మరియు పనితీరుపై ప్రత్యక్ష సమాచారం", "सेवाओं, कार्यों, वित्त और प्रदर्शन पर लाइव डेटा"),
    "Grievance Management": ("ఫిర్యాదుల నిర్వహణ", "शिकायत प्रबंधन"),
    "End-to-end tracking from raise to resolution": ("సమర్పణ నుండి పరిష్కారం వరకు సమగ్ర ట్రాకింగ్", "दर्ज करने से समाधान तक शुरू से अंत तक ट्रैकिंग"),
    "Budget & Finance Management": ("బడ్జెట్ & ఆర్థిక నిర్వహణ", "बजट और वित्त प्रबंधन"),
    "Transparent allocation, utilization & reporting": ("పారదర్శక కేటాయింపు, వినియోగం & నివేదికలు", "पारदर्शी आवंटन, उपयोग और रिपोर्टिंग"),
    "Ward Performance Monitoring": ("వార్డు పనితీరు పర్యవేక్షణ", "वार्ड प्रदर्शन निगरानी"),
    "KPIs, targets vs achievement, rankings": ("కెపిఐలు, లక్ష్యాలు వర్సెస్ సాధన, ర్యాంకింగ్‌లు", "केपीआई, लक्ष्य बनाम उपलब्धि, रैंकिंग"),
    "Reports & Analytics": ("నివేదికలు & విశ్లేషణలు", "रिपोर्ट और एनालिटिक्स"),
    "Data-driven insights for planning and decision support": ("ప్రణాళిక మరియు నిర్ణయ మద్దతు కోసం డేటా అంతర్దృష్టులు", "योजना और निर्णय समर्थन के लिए डेटा अंतर्दृष्टि"),
    "Notifications & Alerts": ("నోటిఫికేషన్లు & హెచ్చరికలు", "अधिसूचनाएं और अलर्ट"),
    "Timely updates and escalations": ("సకాలంలో తాజా సమాచారం మరియు తీవ్రతరాలు", "समय पर अपडेट और एस्केलेशन"),
    "Unified Dashboard View – Complaints by Category & Ward Performance": (
        "ఏకీకృత డాష్‌బోర్డ్ వీక్షణ – వర్గాల వారీగా ఫిర్యాదులు & వార్డు పనితీరు",
        "एकीकृत डैशबोर्ड दृश्य – श्रेणीवार शिकायतें और वार्ड प्रदर्शन"
    ),

    # Page 5
    "4.1 Tier 1: Leadership Dashboard (Mayor & Municipal Commissioner)": (
        "4.1 అంచె 1: నాయకత్వ డాష్‌బోర్డ్ (మేయర్ & మున్సిపల్ కమిషనర్)",
        "4.1 स्तर 1: नेतृत्व डैशबोर्ड (महापौर और नगर निगम आयुक्त)"
    ),
    "A high-level command interface for policy oversight and administrative control": (
        "విధాన పర్యవేక్షణ మరియు పరిపాలనా నియంత్రణ కోసం ఉన్నత స్థాయి కమాండ్ ఇంటర్‌ఫేస్",
        "नीतिगत निरीक्षण और प्रशासनिक नियंत्रण के लिए एक उच्च स्तरीय कमांड इंटरफ़ेस"
    ),
    "Smart Governance. Stronger Karimnagar. Better Tomorrow.": (
        "స్మార్ట్ పాలన. దృఢమైన కరీంనగర్. మెరుగైన రేపు.",
        "स्मार्ट शासन। मजबूत करीमनगर। बेहतर कल।"
    ),
    "Key Features": ("ముఖ్య లక్షణాలు", "मुख्य विशेषताएं"),
    "City-wide live dashboard with ward-level drill-down": (
        "వార్డు స్థాయి డ్రిల్-డౌన్‌తో నగరవ్యాప్త ప్రత్యక్ష డాష్‌బోర్డ్",
        "वार्ड-स्तरीय विवरण के साथ शहरव्यापी लाइव डैशबोर्ड"
    ),
    "Real-time overview of city performance with detailed ward-wise insights.": (
        "వివరణాత్మక వార్డుల వారీ అంతర్దృష్టులతో నగర పనితీరుపై నిజ-సమయ అవలోకనం.",
        "विस्तृत वार्डवार अंतर्दृष्टि के साथ शहर के प्रदर्शन का रीयल-टाइम अवलोकन।"
    ),
    "Digital budget allocation and utilization tracking": (
        "డిజిటల్ బడ్జెట్ కేటాయింపు మరియు వినియోగం ట్రాకింగ్",
        "डिजिटल बजट आवंटन और उपयोग ट्रैकिंग"
    ),
    "Track fund allocation, utilization, and available balance in real time.": (
        "నిధుల కేటాయింపు, వినియోగం మరియు అందుబాటులో ఉన్న బ్యాలెన్స్‌ను నిజ సమయంలో ట్రాక్ చేయండి.",
        "वास्तविक समय में धन आवंटन, उपयोग और उपलब्ध शेष राशि को ट्रैक करें।"
    ),
    "AI-enabled grievance routing and prioritization": (
        "ఏఐ-ఆధారిత ఫిర్యాదుల రూటింగ్ మరియు ప్రాధాన్యత",
        "एआई-सक्षम शिकायत रूटिंग और प्राथमिकता"
    ),
    "AI automatically categorizes, routes, and prioritizes grievances for fast resolution.": (
        "త్వరిత పరిష్కారం కోసం కృత్రిమ మేధ (ఏఐ) ఫిర్యాదులను స్వయంచాలకంగా వర్గీకరిస్తుంది, రూట్ చేస్తుంది మరియు ప్రాధాన్యత ఇస్తుంది.",
        "एआई त्वरित समाधान के लिए शिकायतों को स्वचालित रूप से वर्गीकृत, रूट और प्राथमिकता देता है।"
    ),
    "Automated alerts and escalation mechanisms": (
        "స్వయంచాలక హెచ్చరికలు మరియు తీవ్రతర యంత్రాంగాలు",
        "स्वचालित अलर्ट और एस्केलेशन तंत्र"
    ),
    "Smart alerts for delays, critical issues, and policy violations with escalation to concerned officials.": (
        "సంబంధిత అధికారులకు తీవ్రతరంతో పాటు ఆలస్యాలు, క్లిష్టమైన సమస్యలు మరియు విధాన ఉల్లంఘనల కోసం స్మార్ట్ హెచ్చరికలు.",
        "देरी, गंभीर समस्याओं और नीति उल्लंघनों के लिए संबंधित अधिकारियों को एस्केलेशन के साथ स्मार्ट अलर्ट।"
    ),
    "Leadership Access": ("నాయకత్వ ప్రాప్యత", "नेतृत्व पहुंच"),
    "Mayor": ("మేయర్", "महापौर"),
    "Policy Oversight, Strategic Decisions, Public Accountability": (
        "విధాన పర్యవేక్షణ, వ్యూహాత్మక నిర్ణయాలు, ప్రజా జవాబుదారీతనం",
        "नीतिगत निरीक्षण, रणनीतिक निर्णय, सार्वजनिक जवाबदेही"
    ),
    "Municipal Commissioner": ("మున్సిపల్ కమిషనర్", "नगर निगम आयुक्त"),
    "Administrative Control, Operational Monitoring, Performance Management": (
        "పరిపాలనా నియంత్రణ, కార్యాచరణ పర్యవేక్షణ, పనితీరు నిర్వహణ",
        "प्रशासनिक नियंत्रण, परिचालन निगरानी, प्रदर्शन प्रबंधन"
    ),
    "Administrative Significance": ("పరిపాలనా ప్రాముఖ్యత", "प्रशासनिक महत्व"),
    "Enables simultaneous visibility for both Mayor and Municipal Commissioner": (
        "మేయర్ మరియు మున్సిపల్ కమిషనర్ ఇద్దరికీ ఏకకాల దృశ్యమానతను అందిస్తుంది",
        "महापौर और नगर निगम आयुक्त दोनों के लिए एक साथ दृश्यता सक्षम करता है"
    ),
    "Unified view for collaborative oversight and control.": (
        "సహకార పర్యవేక్షణ మరియు నియంత్రణ కోసం ఏకీకృత వీక్షణ.",
        "सहयोगात्मक निरीक्षण और नियंत्रण के लिए एकीकृत दृश्य।"
    ),
    "Ensures alignment between elected leadership and administrative machinery": (
        "ఎన్నికైన నాయకత్వం మరియు పరిపాలనా యంత్రాంగం మధ్య సమన్వయాన్ని నిర్ధారిస్తుంది",
        "निर्वाचित नेतृत्व और प्रशासनिक मशीनरी के बीच तालमेल सुनिश्चित करता है"
    ),
    "Bridges policy direction with effective execution.": (
        "విధాన మార్గదర్శకత్వాన్ని సమర్థవంతమైన అమలుతో అనుసంధానిస్తుంది.",
        "नीतिगत दिशा को प्रभावी निष्पादन के साथ जोड़ता है।"
    ),
    "Facilitates data-driven governance and faster decision-making": (
        "డేటా ఆధారిత పాలనను మరియు వేగవంతమైన నిర్ణయాధికారాన్ని సులభతరం చేస్తుంది",
        "डेटा-संचालित शासन और त्वरित निर्णय लेने की सुविधा प्रदान करता है"
    ),
    "Real-time insights enable proactive actions and better outcomes.": (
        "రియల్-టైమ్ అంతర్దృష్టులు క్రియాశీలక చర్యలు మరియు మెరుగైన ఫలితాలను సాధ్యం చేస్తాయి.",
        "रीयल-टाइम अंतर्दृष्टि सक्रिय कार्रवाई और बेहतर परिणाम सक्षम करती है।"
    ),
    "Top Pending Wards & Department Performance (Resolution Rate)": (
        "అత్యధికంగా పెండింగ్‌లో ఉన్న వార్డులు & శాఖా పనితీరు (పరిష్కార రేటు)",
        "शीर्ष लंबित वार्ड और विभाग प्रदर्शन (समाधान दर)"
    ),
    "Budget Utilized": ("వినియోగించిన బడ్జెట్", "उपयोग किया गया बजट"),
    "of ₹215 Cr · Balance ₹77 Cr · 64%": ("₹215 కోట్లలో · బ్యాలెన్స్ ₹77 కోట్లు · 64%", "₹215 करोड़ में से · शेष ₹77 करोड़ · 64%"),
    "Avg. Resolution Time": ("సగటు పరిష్కార సమయం", "औसत समाधान समय"),
    "AI-Routed 1,945 · High Priority 298": ("ఏఐ-రూట్ చేసినవి 1,945 · అత్యధిక ప్రాధాన్యత 298", "एआई-रूटेड 1,945 · उच्च प्राथमिकता 298"),

    # Page 6
    "4.2 Tier 2: Ward/Division Management System (Corporators & Field Staff)": (
        "4.2 అంచె 2: వార్డు/డివిజన్ నిర్వహణ వ్యవస్థ (కార్పొరేటర్లు & క్షేత్ర సిబ్బంది)",
        "4.2 स्तर 2: वार्ड/प्रभाग प्रबंधन प्रणाली (पार्षद और फील्ड स्टाफ)"
    ),
    "Operational interface for execution and monitoring at ground level": (
        "క్షేత్ర స్థాయిలో అమలు మరియు పర్యవేక్షణ కోసం కార్యాచరణ ఇంటర్‌ఫేస్",
        "जमीनी स्तर पर निष्पादन और निगरानी के लिए परिचालन इंटरफ़ेस"
    ),
    "Stronger Wards. Efficient Services. Happier Citizens.": (
        "దృఢమైన వార్డులు. సమర్థవంతమైన సేవలు. సంతోషకరమైన పౌరులు.",
        "मजबूत वार्ड। कुशल सेवाएं। खुशहाल नागरिक।"
    ),
    "Real-time tracking of grievances and civic works": (
        "ఫిర్యాదులు మరియు పౌర పనుల నిజ-సమయ ట్రాకింగ్",
        "शिकायतों और नागरिक कार्यों की रीयल-टाइम ट्रैकिंग"
    ),
    "Track and monitor all civic issues and works in real-time for timely resolution.": (
        "సకాలంలో పరిష్కారం కోసం అన్ని పౌర సమస్యలు మరియు పనులను నిజ సమయంలో ట్రాక్ చేయండి మరియు పర్యవేక్షించండి.",
        "समय पर समाधान के लिए सभी नागरिक समस्याओं और कार्यों को रीयल-टाइम में ट्रैक और मॉनिटर करें।"
    ),
    "Status indicators (Pending / In Progress / Completed)": (
        "స్థితి సూచికలు (పెండింగ్ / పురోగతిలో ఉంది / పూర్తయింది)",
        "स्थिति संकेतक (लंबित / प्रगति पर है / पूर्ण)"
    ),
    "Clear status indicators for transparency and accountability.": (
        "పారదర్శకత మరియు జవాబుదారీతనం కోసం స్పష్టమైన స్థితి సూచికలు.",
        "पारदर्शिता और जवाबदेही के लिए स्पष्ट स्थिति संकेतक।"
    ),
    "Geo-tagged before/after photographic evidence": (
        "జియో-ట్యాగ్ చేసిన ముందు/తర్వాత ఫోటోగ్రఫిక్ రుజువు",
        "जियो-टैग्ड पहले/बाद के फोटोग्राफिक प्रमाण"
    ),
    "Capture geo-tagged before and after photos to ensure quality and accountability.": (
        "నాణ్యత మరియు జవాబుదారీతనాన్ని నిర్ధారించడానికి జియో-ట్యాగ్ చేసిన ముందు మరియు తర్వాత ఫోటోలను తీయండి.",
        "गुणवत्ता और जवाबदेही सुनिश्चित करने के लिए पहले और बाद की जियो-टैग्ड तस्वीरें लें।"
    ),
    "Task assignment and tracking": ("పనుల కేటాయింపు మరియు ట్రాకింగ్", "कार्य आवंटन और ट्रैकिंग"),
    "Assign tasks to field staff and track progress until completion.": (
        "క్షేత్ర సిబ్బందికి పనులను కేటాయించండి మరియు పూర్తయ్యే వరకు పురోగతిని ట్రాక్ చేయండి.",
        "फील्ड स्टाफ को कार्य सौंपें और पूरा होने तक प्रगति को ट्रैक करें।"
    ),
    "Roles & Outcome": ("పాత్రలు & ఫలితం", "भूमिकाएं और परिणाम"),
    "Corporators": ("కార్పొరేటర్లు", "पार्षद"),
    "View ward performance, approve works, and ensure citizen satisfaction.": (
        "వార్డు పనితీరును వీక్షించండి, పనులను ఆమోదించండి మరియు పౌర సంతృప్తిని నిర్ధారించండి.",
        "वार्ड प्रदर्शन देखें, कार्यों को मंजूरी दें और नागरिक संतुष्टि सुनिश्चित करें।"
    ),
    "Field Staff": ("క్షేత్ర సిబ్బంది", "फील्ड स्टाफ"),
    "Receive tasks, update status, upload evidence, and close assignments.": (
        "పనులను స్వీకరించండి, స్థితిని అప్‌డేట్ చేయండి, రుజువును అప్‌లోడ్ చేయండి మరియు కేటాయింపులను మూసివేయండి.",
        "कार्य प्राप्त करें, स्थिति अपडेट करें, साक्ष्य अपलोड करें और असाइनमेंट बंद करें।"
    ),
    "Outcome": ("ఫలితం", "परिणाम"),
    "Better monitoring, faster resolution, and improved service delivery at the ward level.": (
        "వార్డు స్థాయిలో మెరుగైన పర్యవేక్షణ, వేగవంతమైన పరిష్కారం మరియు మెరుగుపడిన సేవా డెలివరీ.",
        "वार्ड स्तर पर बेहतर निगरानी, त्वरित समाधान और बेहतर सेवा वितरण।"
    ),
    "Civic Works Status – Ward 27": ("పౌర పనుల స్థితి – వార్డు 27", "नागरिक कार्यों की स्थिति – वार्ड 27"),
    "Recent Grievances – Ward 27": ("ఇటీవలి ఫిర్యాదులు – వార్డు 27", "हाल की शिकायतें – वार्ड 27"),
    "Task Assignments": ("పనుల కేటాయింపులు", "कार्य आवंटन"),
    "Ramesh (Field Staff)": ("రమేష్ (క్షేత్ర సిబ్బంది)", "रमेश (फील्ड स्टाफ)"),
    "Suresh (Electrician)": ("సురేష్ (ఎలక్ట్రీషియన్)", "सुरेश (इलेक्ट्रीशियन)"),
    "Mahesh (Field Staff)": ("మహేష్ (క్షేత్ర సిబ్బంది)", "महेश (फील्ड स्टाफ)"),
    "Venkatesh (Field Staff)": ("వెంకటేష్ (క్షేత్ర సిబ్బంది)", "वेंकटेश (फील्ड स्टाफ)"),
    "Total Grievances (Ward 27)": ("మొత్తం ఫిర్యాదులు (వార్డు 27)", "कुल शिकायतें (वार्ड 27)"),

    # Page 7
    "4.3 Tier 3: Citizen Engagement Portal": ("4.3 అంచె 3: పౌర భాగస్వామ్య పోర్టల్", "4.3 स्तर 3: नागरिक सहभागिता पोर्टल"),
    "Public-facing interface for transparency and participation": ("పారదర్శకత మరియు భాగస్వామ్యం కోసం ప్రజల ఇంటర్‌ఫేస్", "पारदर्शिता और सहभागिता के लिए सार्वजनिक इंटरफ़ेस"),
    "Empowering Citizens. Building a Better Karimnagar Together.": ("పౌరులకు సాధికారత. కలిసి మెరుగైన కరీంనగర్ నిర్మాణం.", "नागरिकों का सशक्तिकरण। साथ मिलकर बेहतर करीमनगर का निर्माण।"),
    "Your City. Your Voice. Our Commitment.": ("మీ నగరం. మీ గొంతుక. మా నిబద్ధత.", "आपका शहर। आपकी आवाज। हमारी प्रतिबद्धता।"),
    "Online grievance submission with photo uploads": ("ఫోటో అప్‌లోడ్‌లతో ఆన్‌లైన్ ఫిర్యాదుల సమర్పణ", "फोटो अपलोड के साथ ऑनलाइन शिकायत दर्ज करना"),
    "Report issues easily with photos and location.": ("ఫోటోలు మరియు స్థానంతో సమస్యలను సులభంగా నివేదించండి.", "तस्वीरों और स्थान के साथ आसानी से समस्याओं की रिपोर्ट करें।"),
    "SMS / notification-based status updates": ("ఎస్.ఎం.ఎస్ / నోటిఫికేషన్ ఆధారిత స్థితి అప్‌డేట్‌లు", "एसएमएस / अधिसूचना आधारित स्थिति अपडेट"),
    "Get real-time updates on your grievances and requests.": ("మీ ఫిర్యాదులు మరియు అభ్యర్థనలపై రియల్-టైమ్ అప్‌డేట్‌లను పొందండి.", "अपनी शिकायतों और अनुरोधों पर रीयल-टाइम अपडेट प्राप्त करें।"),
    "Access to ward-level development and budget data": ("వార్డు స్థాయి అభివృద్ధి మరియు బడ్జెట్ డేటా ప్రాప్యత", "वार्ड-स्तरीय विकास और बजट डेटा तक पहुंच"),
    "View ward projects, progress and budget utilization.": ("వార్డు ప్రాజెక్ట్‌లు, పురోగతి మరియు బడ్జెట్ వినియోగాన్ని వీక్షించండి.", "वार्ड परियोजनाओं, प्रगति और बजट उपयोग को देखें।"),
    "Citizen feedback and service rating system": ("పౌర అభిప్రాయం మరియు సేవా రేటింగ్ వ్యవస్థ", "नागरिक प्रतिक्रिया और सेवा रेटिंग प्रणाली"),
    "Rate services and provide feedback to help us improve.": ("మేము మెరుగుపరచడంలో సహాయపడటానికి సేవలను రేట్ చేయండి మరియు అభిప్రాయాన్ని అందించండి.", "सेवाओं को बेहतर बनाने में हमारी मदद के लिए रेटिंग और प्रतिक्रिया दें।"),
    "Increased citizen participation": ("పెరిగిన పౌర భాగస్వామ్యం", "बढ़ी हुई नागरिक भागीदारी"),
    "Easy access and real-time engagement encourages more citizens to participate.": ("సులభమైన అందుబాటు మరియు నిజ-సమయ నిమగ్నత ఎక్కువ మంది పౌరులను పాల్గొనేలా ప్రోత్సహిస్తుంది.", "आसान पहुंच और रीयल-टाइम जुड़ाव अधिक नागरिकों को भाग लेने के लिए प्रोत्साहित करता है।"),
    "Enhanced public trust in governance": ("పాలనపై పెరిగిన ప్రజల నమ్మకం", "शासन में जनता का बढ़ा हुआ विश्वास"),
    "Transparency, responsiveness and accountability build stronger trust in the municipal administration.": ("పారదర్శకత, ప్రతిస్పందన మరియు జవాబుదారీతనం మున్సిపల్ పరిపాలనపై బలమైన నమ్మకాన్ని నిర్మిస్తాయి.", "पारदर्शिता, संवेदनशीलता और जवाबदेही नगर निगम प्रशासन में मजबूत विश्वास का निर्माण करती है।"),
    "Recent Development Projects – Ward 27": ("ఇటీవలి అభివృద్ధి ప్రాజెక్ట్‌లు – వార్డు 27", "हाल की विकास परियोजनाएं – वार्ड 27"),
    "Drainage Improvement": ("డ్రైనేజీ మెరుగుదల", "ड्रेनेज सुधार"),
    "Street Light Installation": ("వీధి దీపాల ఏర్పాటు", "स्ट्रीट लाइट स्थापना"),
    "Road Repair & Maintenance": ("రహదారి మరమ్మతు & నిర్వహణ", "सड़क मरम्मत और रखरखाव"),
    "Park Development": ("పార్కు అభివృద్ధి", "पार्क विकास"),

    # Page 8 & 9
    "5. Ward Performance Evaluation Framework": ("5. వార్డు పనితీరు మూల్యాంకన చట్రం", "5. वार्ड प्रदर्शन मूल्यांकन ढांचा"),
    "5.1 Monthly Performance Monitoring — each ward is evaluated on predefined KPIs": (
        "5.1 నెలవారీ పనితీరు పర్యవేక్షణ — ప్రతి వార్డు ముందుగా నిర్ణయించిన కెపిఐలపై మూల్యాంకనం చేయబడుతుంది",
        "5.1 मासिक प्रदर्शन निगरानी — प्रत्येक वार्ड का मूल्यांकन पूर्वनिर्धारित केपीआई पर किया जाता है"
    ),
    "Grievance resolution time": ("ఫిర్యాదుల పరిష్కార సమయం", "शिकायत समाधान समय"),
    "Average time taken to resolve citizen grievances.": ("పౌరుల ఫిర్యాదులను పరిష్కరించడానికి పట్టే సగటు సమయం.", "नागरिक शिकायतों को हल करने में लगने वाला औसत समय।"),
    "Percentage of issues resolved": ("పరిష్కరించబడిన సమస్యల శాతం", "सुलझाए गए मुद्दों का प्रतिशत"),
    "Percentage of total reported issues that were successfully resolved.": ("విజయవంతంగా పరిష్కరించబడిన మొత్తం నివేదించబడిన సమస్యల శాతం.", "सफलतापूर्वक हल की गई कुल रिपोर्ट की गई समस्याओं का प्रतिशत।"),
    "Quality of work (based on citizen feedback)": ("పని నాణ్యత (పౌర అభిప్రాయం ఆధారంగా)", "कार्य की गुणवत्ता (नागरिक प्रतिक्रिया के आधार पर)"),
    "Citizen satisfaction ratings for completed works.": ("పూర్తయిన పనులపై పౌర సంతృప్తి రేటింగ్‌లు.", "पूरे किए गए कार्यों के लिए नागरिक संतुष्टि रेटिंग।"),
    "Budget utilization efficiency": ("బడ్జెట్ వినియోగ సామర్థ్యం", "बजट उपयोग दक्षता"),
    "Effective utilization of allocated ward development funds.": ("కేటాయించిన వార్డు అభివృద్ధి నిధుల సమర్థవంతమైన వినియోగం.", "आवंटित वार्ड विकास निधि का प्रभावी उपयोग।"),
    "Cleanliness & infrastructure maintenance score": ("పరిశుభ్రత & మౌలిక సదుపాయాల నిర్వహణ స్కోరు", "स्वच्छता और बुनियादी ढांचा रखरखाव स्कोर"),
    "Sanitation levels, road conditions, and streetlight functionality.": ("పారిశుధ్య స్థాయిలు, రహదారి పరిస్థితులు మరియు వీధి దీపాల పనితీరు.", "स्वच्छता स्तर, सड़क की स्थिति और स्ट्रीटलाइट कार्यक्षमता।"),
    "Outcome of consistent evaluation": ("నిరంతర మూల్యాంకనం యొక్క ఫలితం", "निरंतर मूल्यांकन का परिणाम"),
    "Drives healthy competition among 66 wards": ("66 వార్డులలో ఆరోగ్యకరమైన పోటీని నడిపిస్తుంది", "66 वार्डों के बीच स्वस्थ प्रतिस्पर्धा को बढ़ावा देता है"),
    "Identifies underperforming wards for timely intervention": ("సకాలంలో జోక్యం కోసం వెనుకబడిన వార్డులను గుర్తిస్తుంది", "समय पर हस्तक्षेप के लिए पिछड़े वार्डों की पहचान करता है"),
    "Enables data-driven resource allocation": ("డేటా ఆధారిత వనరుల కేటాయింపును సాధ్యం చేస్తుంది", "डेटा-संचालित संसाधन आवंटन को सक्षम बनाता है"),
    "5.2 Performance Ranking System": ("5.2 పనితీరు ర్యాంకింగ్ వ్యవస్థ", "5.2 प्रदर्शन रैंकिंग प्रणाली"),
    "Monthly identification of top performing wards": ("అగ్రశ్రేణి పనితీరు కనబరిచే వార్డుల నెలవారీ గుర్తింపు", "शीर्ष प्रदर्शन करने वाले वार्डों की मासिक पहचान"),
    "Recognize and reward consistently high-performing wards.": ("నిరంతరం అత్యుత్తమ పనితీరు కనబరిచే వార్డులను గుర్తించి రివార్డులను అందించండి.", "लगातार उच्च प्रदर्शन करने वाले वार्डों को पहचानें और पुरस्कृत करें।"),
    "Flagging of underperforming wards for corrective action": ("దిద్దుబాటు చర్య కోసం వెనుకబడిన వార్డులను ఫ్లాగ్ చేయడం", "सुधारात्मक कार्रवाई के लिए पिछड़े वार्डों को चिह्नित करना"),
    "Identify gaps and enable timely intervention for better outcomes.": ("లోపాలను గుర్తించి మెరుగైన ఫలితాల కోసం సకాలంలో జోక్యం చేసుకోండి.", "कमियों को पहचानें और बेहतर परिणामों के लिए समय पर हस्तक्षेप सक्षम करें।"),
    "Dashboard visibility for Mayor and Municipal Commissioner": ("మేయర్ మరియు మున్సిపల్ కమిషనర్ కోసం డాష్‌బోర్డ్ దృశ్యమానత", "महापौर और नगर निगम आयुक्त के लिए डैशबोर्ड दृश्यता"),
    "Monitor ward-level metrics and track improvements over time.": ("వార్డు స్థాయి కొలమానాలను పర్యవేక్షించండి మరియు కాలక్రమేణా మెరుగుదలలను ట్రాక్ చేయండి.", "वार्ड-स्तरीय मेट्रिक्स की निगरानी करें और समय के साथ सुधार को ट्रैक करें।"),

    # Page 10 & 11
    "5.3 Administrative Impact": ("5.3 పరిపాలనా ప్రభావం", "5.3 प्रशासनिक प्रभाव"),
    "Promotes healthy competition among wards": ("వార్డులలో ఆరోగ్యకరమైన పోటీని ప్రోత్సహిస్తుంది", "वार्डों के बीच स्वस्थ प्रतिस्पर्धा को बढ़ावा देता है"),
    "Performance ranking motivates every ward to perform better.": ("పనితీరు ర్యాంకింగ్ ప్రతి వార్డును మెరుగ్గా పనిచేసేలా ప్రేరేపిస్తుంది.", "प्रदर्शन रैंकिंग प्रत्येक वार्ड को बेहतर प्रदर्शन करने के लिए प्रेरित करती है।"),
    "Recognition and rewards for top performing wards.": ("అత్యుత్తమ పనితీరు కనబరిచిన వార్డులకు గుర్తింపు మరియు బహుమతులు.", "शीर्ष प्रदर्शन करने वाले वार्डों के लिए मान्यता और पुरस्कार।"),
    "A culture of healthy competition drives continuous improvement.": ("ఆరోగ్యకరమైన పోటీ సంస్కృతి నిరంతర మెరుగుదలను నడిపిస్తుంది.", "स्वस्थ प्रतिस्पर्धा की संस्कृति निरंतर सुधार को प्रेरित करती है।"),
    "Encourages accountability at all levels": ("అన్ని స్థాయిలలో జవాబుదారీతనాన్ని ప్రోత్సహిస్తుంది", "सभी स्तरों पर जवाबदेही को प्रोत्साहित करता है"),
    "Clear visibility of performance creates ownership and responsibility.": ("పనితీరు యొక్క స్పష్టమైన దృశ్యమానత యాజమాన్య భావన మరియు బాధ్యతను సృష్టిస్తుంది.", "प्रदर्शन की स्पष्ट दृश्यता स्वामित्व और जिम्मेदारी पैदा करती है।"),
    "Field staff and corporators are held accountable for their ward.": ("క్షేత్ర సిబ్బంది మరియు కార్పొరేటర్లు తమ వార్డుకు జవాబుదారీగా ఉంటారు.", "फील्ड स्टाफ और पार्षद अपने वार्ड के लिए जवाबदेह होते हैं।"),
    "Transparent metrics leave no room for ambiguity.": ("పారదర్శక కొలమానాలు ఎలాంటి సందిగ్ధతకు తావు ఇవ్వవు.", "पारदर्शी मेट्रिक्स अस्पष्टता की कोई गुंजाइश नहीं छोड़ते।"),
    "Enables targeted interventions for underperforming wards": ("వెనుకబడిన వార్డుల కోసం లక్ష్యిత జోక్యాలను సాధ్యం చేస్తుంది", "पिछड़े वार्डों के लिए लक्षित हस्तक्षेप को सक्षम बनाता है"),
    "Identify weak areas and deploy resources where needed most.": ("బలహీనమైన ప్రాంతాలను గుర్తించి అత్యంత అవసరమైన చోట వనరులను విస్తరించండి.", "कमजोर क्षेत्रों की पहचान करें और जहाँ सबसे अधिक आवश्यकता हो, वहाँ संसाधन तैनात करें।"),
    "Tailored support and action plans for low-scoring wards.": ("తక్కువ స్కోరు సాధించిన వార్డులకు అనుకూలమైన మద్దతు మరియు కార్యాచరణ ప్రణాళికలు.", "कम स्कोर वाले वार्डों के लिए अनुकूलित सहायता और कार्य योजनाएं।"),
    "Track improvement over time to ensure progress.": ("పురోగతిని నిర్ధారించడానికి కాలక్రమేణా మెరుగుదలను ట్రాక్ చేయండి.", "प्रगति सुनिश्चित करने के लिए समय के साथ सुधार को ट्रैक करें।"),
    "Fosters data-driven governance culture": ("డేటా ఆధారిత పాలనా సంస్కృతిని పెంపొందిస్తుంది", "डेटा-संचालित शासन संस्कृति को बढ़ावा देता है"),
    "Decisions based on facts, data, and measurable performance.": ("వాస్తవాలు, డేటా మరియు కొలవగల పనితీరు ఆధారంగా నిర్ణయాలు.", "तथ्यों, डेटा और मापने योग्य प्रदर्शन पर आधारित निर्णय।"),
    "Reduces reliance on anecdotal reports and assumptions.": ("సందర్భోచిత నివేదికలు మరియు అంచనాలపై ఆధారపడటాన్ని తగ్గిస్తుంది.", "अनुमानों और व्यक्तिगत रिपोर्टों पर निर्भरता को कम करता है।"),
    "Builds a culture of continuous measurement and improvement.": ("నిరంతర కొలత మరియు మెరుగుదల సంస్కృతిని నిర్మిస్తుంది.", "निरंतर माप और सुधार की संस्कृति का निर्माण करता है।"),
    "Builds public trust through visible performance": ("కనిపించే పనితీరు ద్వారా ప్రజల నమ్మకాన్ని నిర్మిస్తుంది", "दृश्यमान प्रदर्शन के माध्यम से जनता का विश्वास बनाता है"),
    "Citizens see that their ward's performance is being actively monitored.": ("తమ వార్డు పనితీరు చురుగ్గా పర్యవేక్షించబడుతోందని పౌరులు చూస్తారు.", "नागरिक देखते हैं कि उनके वार्ड के प्रदर्शन की सक्रिय रूप से निगरानी की जा रही है।"),
    "Transparent rankings demonstrate commitment to better services.": ("పారదర్శక ర్యాంకింగ్‌లు మెరుగైన సేవల పట్ల నిబద్ధతను చాటుతాయి.", "पारदर्शी रैंकिंग बेहतर सेवाओं के प्रति प्रतिबद्धता प्रदर्शित करती है।"),
    "Visible progress strengthens the bond between citizens and administration.": ("కనిపించే పురోగతి పౌరులు మరియు పరిపాలన మధ్య బంధాన్ని బలోపేతం చేస్తుంది.", "दृश्यमान प्रगति नागरिकों और प्रशासन के बीच के संबंध को मजबूत करती है।"),
    "5.4 Key Benefits of the System": ("5.4 వ్యవస్థ యొక్క ముఖ్య ప్రయోజనాలు", "5.4 प्रणाली के मुख्य लाभ"),
    "To Elected Representatives (Mayor & Corporators)": ("ఎన్నికైన ప్రజాప్రతినిధులకు (మేయర్ & కార్పొరేటర్లు)", "निर्वाचित प्रतिनिधियों को (महापौर और पार्षद)"),
    "Real-time visibility into ward issues and progress": ("వార్డు సమస్యలు మరియు పురోగతిపై నిజ-సమయ దృశ్యమానత", "वार्ड की समस्याओं और प्रगति पर रीयल-टाइम दृश्यता"),
    "Data to advocate for their ward's needs and budget": ("తమ వార్డు అవసరాలు మరియు బడ్జెట్ కోసం వాదించడానికి డేటా", "अपने वार्ड की जरूरतों और बजट के लिए बात रखने हेतु डेटा"),
    "Demonstrable track record of performance for citizens": ("పౌరులకు చూపించడానికి పనితీరు యొక్క స్పష్టమైన ట్రాక్ రికార్డ్", "नागरिकों के लिए प्रदर्शन का एक स्पष्ट ट्रैक रिकॉर्ड"),
    "Healthy competition motivates better ward outcomes": ("ఆరోగ్యకరమైన పోటీ మెరుగైన వార్డు ఫలితాలను ప్రేరేపిస్తుంది", "स्वस्थ प्रतिस्पर्धा बेहतर वार्ड परिणामों को प्रेरित करती है"),
    "To Municipal Administration (Commissioner & Officials)": ("మున్సిపల్ పరిపాలనకు (కమిషనర్ & అధికారులు)", "नगर निगम प्रशासन को (आयुक्त और अधिकारी)"),
    "Centralized monitoring and oversight across all 66 wards": ("అన్ని 66 వార్డులలో కేంద్రీకృత పర్యవేక్షణ మరియు పరిశీలన", "सभी 66 वार्डों में केंद्रीकृत निगरानी और निरीक्षण"),
    "Early identification of bottlenecks and underperforming areas": ("అవరోధాలు మరియు వెనుకబడిన ప్రాంతాల ముందస్తు గుర్తింపు", "बाधाओं और पिछड़े क्षेत्रों की समय से पहले पहचान"),
    "Optimized resource and budget allocation based on data": ("డేటా ఆధారంగా వనరులు మరియు బడ్జెట్ కేటాయింపుల ఆప్టిమైజేషన్", "डेटा के आधार पर अनुकूलित संसाधन और बजट आवंटन"),
    "Accountability driven by objective, measurable KPIs": ("లక్ష్యాత్మక, కొలవగల కెపిఐల ద్వారా నడిచే జవాబుదారీతనం", "उद्देश्यपूर्ण, मापने योग्य केपीआई द्वारा संचालित जवाबदेही"),
    "To Citizens of Karimnagar": ("కరీంనగర్ పౌరులకు", "करीमनगर के नागरिकों को"),
    "Faster resolution of grievances through tracked workflows": ("ట్రాక్ చేయబడిన వర్క్‌ఫ్లోల ద్వారా ఫిర్యాదుల వేగవంతమైన పరిష్కారం", "ट्रैक किए गए कार्यप्रवाहों के माध्यम से शिकायतों का त्वरित निवारण"),
    "Transparency in civic works, budgets, and ward performance": ("పౌర పనులు, బడ్జెట్‌లు మరియు వార్డు పనితీరులో పారదర్శకత", "नागरिक कार्यों, बजट और वार्ड प्रदर्शन में पारदर्शिता"),
    "A voice through feedback and rating mechanisms": ("అభిప్రాయం మరియు రేటింగ్ విధానాల ద్వారా ఒక గొంతుక", "प्रतिक्रिया और रेटिंग तंत्र के माध्यम से अपनी आवाज"),
    "Overall improvement in civic services and quality of life": ("పౌర సేవలు మరియు జీవన ప్రమాణాలలో సమగ్ర మెరుగుదల", "नागरिक सेवाओं और जीवन की गुणवत्ता में समग्र सुधार"),

    # Page 12 to 17
    "6. Integrated Departmental Workflow & Hierarchical Grievance Redressal Mechanism": (
        "6. సమగ్ర శాఖా వర్క్‌ఫ్లో & క్రమానుగత ఫిర్యాదుల పరిష్కార యంత్రాంగం",
        "6. एकीकृत विभागीय कार्यप्रवाह और पदानुक्रमित शिकायत निवारण तंत्र"
    ),
    "Connects 8 municipal departments on a single platform": ("8 మున్సిపల్ శాఖలను ఒకే వేదికపై అనుసంధానిస్తుంది", "एक ही मंच पर 8 नगर निगम विभागों को जोड़ता है"),
    "All major departments share data, workflows, and accountability seamlessly.": ("అన్ని ప్రధాన శాఖలు డేటా, వర్క్‌ఫ్లోలు మరియు జవాబుదారీతనాన్ని అతుకులు లేకుండా పంచుకుంటాయి.", "सभी प्रमुख विभाग डेटा, कार्यप्रवाह और जवाबदेही को निर्बाध रूप से साझा करते हैं।"),
    "Departments covered": ("పరిధిలోని శాఖలు", "शामिल विभाग"),
    "Engineering, Health & Sanitation, Revenue & Taxes, Town Planning, Water Supply, Street Lighting, Horticulture, Audit & Accounts.": (
        "ఇంజనీరింగ్, ఆరోగ్యం & పారిశుధ్యం, రెవెన్యూ & పన్నులు, టౌన్ ప్లానింగ్, నీటి సరఫరా, వీధి దీపాలు, ఉద్యానవనం, ఆడిట్ & ఖాతాలు.",
        "इंजीनियरिंग, स्वास्थ्य और स्वच्छता, राजस्व और कर, नगर नियोजन, जलापूर्ति, स्ट्रीट लाइट, उद्यानिकी, लेखा परीक्षा और खाते।"
    ),
    "5-level hierarchical escalation ladder": ("5-అంచెల క్రమానుగత తీవ్రతర నిచ్చెన", "5-स्तरीय पदानुक्रमित एस्केलेशन सीढ़ी"),
    "Unresolved issues automatically escalate up the chain of authority based on SLAs.": ("పరిష్కారం కాని సమస్యలు ఎస్.ఎల్.ఎల ఆధారంగా అధికార శ్రేణిలో స్వయంచాలకంగా పైకి తీవ్రతరం అవుతాయి.", "अनसुलझी समस्याएं एसएलए के आधार पर अधिकार पदानुक्रम में स्वचालित रूप से ऊपर एस्केलेट होती हैं।"),
    "Escalation levels": ("తీవ్రతర స్థాయిలు", "एस्केलेशन स्तर"),
    "Level 1: Field Staff → Level 2: Ward Officer → Level 3: Department Head → Level 4: Municipal Commissioner → Level 5: Hon'ble Mayor.": (
        "స్థాయి 1: క్షేత్ర సిబ్బంది → స్థాయి 2: వార్డు అధికారి → స్థాయి 3: శాఖాధిపతి → స్థాయి 4: మున్సిపల్ కమిషనర్ → స్థాయి 5: గౌరవనీయ మేయర్.",
        "स्तर 1: फील्ड स्टाफ → स्तर 2: वार्ड अधिकारी → स्तर 3: विभागाध्यक्ष → स्तर 4: नगर निगम आयुक्त → स्तर 5: माननीय महापौर।"
    ),
    "Multi-channel grievance submission": ("బహుళ ప్రసార మార్గాల ఫిర్యాదుల సమర్పణ", "मल्टी-चैनल शिकायत दर्ज करना"),
    "Citizens can report issues via Mobile App, Web Portal, Helpline, WhatsApp, or Walk-in.": (
        "పౌరులు మొబైల్ యాప్, వెబ్ పోర్టల్, హెల్ప్‌లైన్, వాట్సాప్ లేదా నేరుగా వచ్చి సమస్యలను నివేదించవచ్చు.",
        "नागरिक मोबाइल ऐप, वेब पोर्टल, हेल्पलाइन, व्हाट्सएप या सीधे कार्यालय आकर शिकायत दर्ज कर सकते हैं।"
    ),
    "Channels supported": ("మద్దతు ఉన్న మార్గాలు", "समर्थित माध्यम"),
    "Citizen Mobile App, Citizen Web Portal, Toll-Free Helpline (Toll-Free 1800-425-1980), WhatsApp Bot, Ward Sachivalayam Counter.": (
        "పౌర మొబైల్ యాప్, పౌర వెబ్ పోర్టల్, టోల్-ఫ్రీ హెల్ప్‌లైన్ (1800-425-1980), వాట్సాప్ బాట్, వార్డు సచివాలయ కౌంటర్.",
        "नागरिक मोबाइल ऐप, नागरिक वेब पोर्टल, टोल-फ्री हेल्पलाइन (1800-425-1980), व्हाट्सएप बॉट, वार्ड सचिवालय काउंटर।"
    ),
    "Automated routing and assignment": ("స్వయంచాలక రూటింగ్ మరియు కేటాయింపు", "स्वचालित रूटिंग और आवंटन"),
    "Issues are automatically routed to the right department, ward, and field worker.": ("సమస్యలు స్వయంచాలకంగా సరైన శాఖ, వార్డు మరియు క్షేత్ర కార్మికుడికి రూట్ చేయబడతాయి.", "समस्याएं स्वचालित रूप से सही विभाग, वार्ड और फील्ड कार्यकर्ता को भेजी जाती हैं।"),
    "Routing logic": ("రూటింగ్ లాజిక్", "रूटिंग तर्क"),
    "Category → Department → Ward → Field Staff based on geo-location and workload balancing.": (
        "విభాగం → శాఖ → వార్డు → జియో-లొకేషన్ మరియు పనిభారం ఆధారంగా క్షేత్ర సిబ్బందికి కేటాయింపు.",
        "श्रेणी → विभाग → वार्ड → भू-स्थान और कार्यभार संतुलन के आधार पर फील्ड स्टाफ।"
    ),
    "Photo-verified completion with geo-tagging": ("జియో-ట్యాగింగ్‌తో ఫోటో-ధృవీకరించబడిన పూర్తి", "जियो-टैगिंग के साथ फोटो-सत्यापित समापन"),
    "Field staff must upload before and after photos with GPS coordinates to close tasks.": (
        "పనులను ముగించడానికి క్షేత్ర సిబ్బంది జిపిఎస్ కోఆర్డినేట్‌లతో ముందు మరియు తర్వాత ఫోటోలను అప్‌లోడ్ చేయాలి.",
        "कार्यों को पूरा करने के लिए फील्ड स्टाफ को जीपीएस निर्देशांक के साथ पहले और बाद की तस्वीरें अपलोड करनी होंगी।"
    ),
    "Verification standard": ("ధృవీకరణ ప్రమాణం", "सत्यापन मानक"),
    "Timestamped, geo-tagged photos required before any complaint can be marked as resolved.": (
        "ఏదైనా ఫిర్యాదును పరిష్కరించినట్లు గుర్తించడానికి సమయముద్ర మరియు జియో-ట్యాగ్ చేసిన ఫోటోలు తప్పనిసరి.",
        "किसी भी शिकायत को हल के रूप में चिह्नित करने से पहले टाइमस्टैम्प और जियो-टैग्ड तस्वीरें आवश्यक हैं।"
    ),
    "Citizen feedback and rating loop": ("పౌర అభిప్రాయం మరియు రేటింగ్ చక్రం", "नागरिक प्रतिक्रिया और रेटिंग लूप"),
    "Citizens rate resolution quality (1-5 stars); low ratings automatically reopen the issue.": (
        "పౌరులు పరిష్కార నాణ్యతను రేట్ చేస్తారు (1-5 నక్షత్రాలు); తక్కువ రేటింగ్‌లు స్వయంచాలకంగా సమస్యను మళ్లీ తెరుస్తాయి.",
        "नागरिक समाधान गुणवत्ता को रेटिंग देते हैं (1-5 सितारे); कम रेटिंग मिलने पर समस्या स्वचालित रूप से फिर से खुल जाती है।"
    ),
    "Feedback loop": ("అభిప్రాయ చక్రం", "प्रतिक्रिया लूप"),
    "Rating ≥ 3 closes ticket; rating < 3 reopens complaint and escalates one level up.": (
        "రేటింగ్ ≥ 3 టికెట్‌ను ముగిస్తుంది; రేటింగ్ < 3 ఫిర్యాదును మళ్లీ తెరిచి ఒక స్థాయి పైకి తీవ్రతరం చేస్తుంది.",
        "रेटिंग ≥ 3 टिकट बंद करती है; रेटिंग < 3 शिकायत को फिर से खोलती है और एक स्तर ऊपर एस्केलेट करती है।"
    ),
    "6.1 End-to-End Grievance Flow (Citizen → Leadership)": (
        "6.1 సమగ్ర ఫిర్యాదుల ప్రవాహం (పౌరుడు → నాయకత్వం)",
        "6.1 शुरू से अंत तक शिकायत प्रवाह (नागरिक → नेतृत्व)"
    ),
    "Step 1: Grievance Registration": ("దశ 1: ఫిర్యాదు నమోదు", "चरण 1: शिकायत पंजीकरण"),
    "Citizen submits issue via App, Portal, Helpline, or WhatsApp with description and photo.": (
        "పౌరుడు యాప్, పోర్టల్, హెల్ప్‌లైన్ లేదా వాట్సాప్ ద్వారా వివరణ మరియు ఫోటోతో సమస్యను సమర్పిస్తారు.",
        "नागरिक ऐप, पोर्टल, हेल्पलाइन या व्हाट्सएप के माध्यम से विवरण और फोटो के साथ समस्या दर्ज करता है।"
    ),
    "Step 2: Auto Routing & Assignment": ("దశ 2: స్వయంచాలక రూటింగ్ & కేటాయింపు", "चरण 2: ऑटो रूटिंग और आवंटन"),
    "System validates location, identifies ward, assigns to responsible department and field staff.": (
        "వ్యవస్థ స్థానాన్ని ధృవీకరిస్తుంది, వార్డును గుర్తిస్తుంది, బాధ్యతాయుత శాఖ మరియు క్షేత్ర సిబ్బందికి కేటాయిస్తుంది.",
        "प्रणाली स्थान को सत्यापित करती है, वार्ड की पहचान करती है और जिम्मेदार विभाग एवं फील्ड स्टाफ को सौंपती है।"
    ),
    "Step 3: Action by Field Staff": ("దశ 3: క్షేత్ర సిబ్బంది ద్వారా చర్య", "चरण 3: फील्ड स्टाफ द्वारा कार्रवाई"),
    "Field worker inspects site, executes resolution, takes geo-tagged completion photo.": (
        "క్షేత్ర కార్మికుడు స్థలాన్ని తనిఖీ చేస్తారు, సమస్యను పరిష్కరిస్తారు, జియో-ట్యాగ్ చేసిన పూర్తి ఫోటోను తీస్తారు.",
        "फील्ड कार्यकर्ता स्थल का निरीक्षण करता है, समाधान करता है और जियो-टैग्ड पूर्णता फोटो लेता है।"
    ),
    "Step 4: Verification & Closure": ("దశ 4: ధృవీకరణ & ముగింపు", "चरण 4: सत्यापन और समापन"),
    "Ward Officer verifies resolution; citizen notified via SMS with before/after photos.": (
        "వార్డు అధికారి పరిష్కారాన్ని ధృవీకరిస్తారు; పౌరుడికి ముందు/తర్వాత ఫోటోలతో ఎస్.ఎం.ఎస్ ద్వారా తెలియజేయబడుతుంది.",
        "वार्ड अधिकारी समाधान का सत्यापन करता है; नागरिक को पहले/बाद की तस्वीरों के साथ एसएमएस द्वारा सूचित किया जाता है।"
    ),
    "Grievance Monitoring": ("ఫిర్యాదుల పర్యవేక్షణ", "शिकायत निगरानी"),
    "Predefined Service Level Agreements (SLAs)": ("ముందుగా నిర్వచించిన సర్వీస్ లెవల్ ఒప్పందాలు (ఎస్.ఎల్.ఎలు)", "पूर्वनिर्धारित सेवा स्तर समझौते (एसएलए)"),
    "6.2 Key Administrative Features": ("6.2 ముఖ్య పరిపాలనా లక్షణాలు", "6.2 मुख्य प्रशासनिक विशेषताएं"),
    "Automated Escalation Matrix": ("స్వయంచాలక తీవ్రతర మాతృక", "स्वचालित एस्केलेशन मैट्रिक्स"),
    "Strict time-bound escalations prevent grievances from languishing at any level.": (
        "ఖచ్చితమైన సమయబద్ధ తీవ్రతరాలు ఫిర్యాదులు ఏ స్థాయిలోనూ నిలిచిపోకుండా నిరోధిస్తాయి.",
        "सख्त समयबद्ध एस्केलेशन शिकायतों को किसी भी स्तर पर लंबित रहने से रोकते हैं।"
    ),
    "Real-Time Inter-Departmental Coordination": ("రియల్-టైమ్ అంతర్-శాఖా సమన్వయం", "रीयल-टाइम अंतर-विभागीय समन्वय"),
    "Joint issues (e.g. road repair cutting water pipe) automatically notify both departments.": (
        "ఉమ్మడి సమస్యలు (ఉదా. రోడ్డు మరమ్మతుల వల్ల నీటి పైపు పగలడం) స్వయంచాలకంగా రెండు శాఖలకూ తెలియజేయబడతాయి.",
        "संयुक्त समस्याएं (उदा. सड़क मरम्मत में पानी का पाइप कटना) स्वचालित रूप से दोनों विभागों को सूचित करती हैं।"
    ),
    "Dynamic Capacity & Workload Balancing": ("డైనమిక్ సామర్థ్యం & పనిభారం సమతుల్యత", "गतिशील क्षमता और कार्यभार संतुलन"),
    "Tasks distributed across field staff based on active workload and proximity.": (
        "చురుకైన పనిభారం మరియు సామీప్యత ఆధారంగా క్షేత్ర సిబ్బందికి పనులు పంపిణీ చేయబడతాయి.",
        "सक्रिय कार्यभार और निकटता के आधार पर फील्ड स्टाफ के बीच कार्यों का वितरण।"
    ),
    "6.3 Governance Impact": ("6.3 పాలనా ప్రభావం", "6.3 शासन प्रभाव"),
    "Institutionalized Accountability": ("సంస్థాగత జవాబుదారీతనం", "संस्थागत जवाबदेही"),
    "Every grievance has a clear owner, audit trail, and escalation history.": (
        "ప్రతి ఫిర్యాదుకూ స్పష్టమైన బాధ్యతగల అధికారి, ఆడిట్ ట్రయల్ మరియు తీవ్రతర చరిత్ర ఉంటాయి.",
        "प्रत्येक शिकायत का एक स्पष्ट जिम्मेदार अधिकारी, ऑडिट ट्रेल और एस्केलेशन इतिहास होता है।"
    ),
    "Transparent Operations": ("పారదర్శక కార్యకలాపాలు", "पारदर्शी संचालन"),
    "Citizens and leaders can track every stage from initiation to resolution.": (
        "పౌరులు మరియు నాయకులు ప్రారంభం నుండి పరిష్కారం వరకు ప్రతి దశనూ ట్రాక్ చేయవచ్చు.",
        "नागरिक और नेता शुरुआत से समाधान तक हर चरण को ट्रैक कर सकते हैं।"
    ),
    "Data-Driven Resource Planning": ("డేటా ఆధారిత వనరుల ప్రణాళిక", "डेटा-संचालित संसाधन योजना"),
    "Recurring complaints highlight structural infrastructure defects needing budget.": (
        "పునరావృతమయ్యే ఫిర్యాదులు బడ్జెట్ అవసరమైన నిర్మాణ మౌలిక సదుపాయాల లోపాలను ఎత్తి చూపుతాయి.",
        "बार-बार आने वाली शिकायतें ढांचागत बुनियादी ढांचे के दोषों को उजागर करती हैं जिनके लिए बजट की आवश्यकता होती है।"
    ),
    "6.4 Citizen-Centric Outcome": ("6.4 పౌర-కేంద్రీకృత ఫలితం", "6.4 नागरिक-केंद्रित परिणाम"),
    "Guaranteed Turnaround Times": ("హామీ ఇవ్వబడిన పరిష్కార సమయాలు", "गारंटीकृत समाधान समय"),
    "SLAs ensure complaints are addressed within predictable, communicated windows.": (
        "ఎస్.ఎల్.ఎలు ఫిర్యాదులను అంచనా వేయదగిన, తెలియజేయబడిన గడువుల్లో పరిష్కరించేలా నిర్ధారిస్తాయి.",
        "एसएलए यह सुनिश्चित करते हैं कि शिकायतों का निवारण तय और सूचित समय सीमा में हो।"
    ),
    "Visual Resolution Proof": ("దృశ్య పరిష్కార రుజువు", "दृश्य समाधान प्रमाण"),
    "Before/after photos eliminate false closure and build citizen confidence.": (
        "ముందు/తర్వాత ఫోటోలు తప్పుడు ముగింపులను తొలగిస్తాయి మరియు పౌరులలో నమ్మకాన్ని పెంపొందిస్తాయి.",
        "पहले/बाद की तस्वीरें झूठे दावों को खत्म करती हैं और नागरिकों का विश्वास बढ़ाती हैं।"
    ),
    "Reopen Privilege": ("తిరిగి తెరిచే హక్కు", "फिर से खोलने का अधिकार"),
    "Citizens can reject unsatisfactory work, triggering automatic executive review.": (
        "పౌరులు అసంతృప్తికరమైన పనిని తిరస్కరించవచ్చు, ఇది స్వయంచాలక ఉన్నత స్థాయి సమీక్షను ప్రేరేపిస్తుంది.",
        "नागरिक असंतोषजनक कार्य को अस्वीकार कर सकते हैं, जिससे स्वचालित कार्यकारी समीक्षा शुरू होती है।"
    ),
    "6.5 Strategic Value": ("6.5 వ్యూహాత్మక విలువ", "6.5 रणनीतिक मूल्य"),
    "Foundation for Smart City Expansion": ("స్మార్ట్ సిటీ విస్తరణకు పునాది", "स्मार्ट सिटी विस्तार की नींव"),
    "Standardized workflows allow rapid integration with SCADA, IoT, and GIS layers.": (
        "ప్రామాణిక వర్క్‌ఫ్లోలు స్కాడా (SCADA), ఐఒటి (IoT) మరియు జిఐఎస్ (GIS) పొరలతో వేగవంతమైన ఏకీకరణను అనుమతిస్తాయి.",
        "मानकीकृत कार्यप्रवाह स्काडा, आईओटी और जीआईएस प्रणालियों के साथ त्वरित एकीकरण की अनुमति देते हैं।"
    ),
    "Measurable Governance Benchmarks": ("కొలవగల పాలనా ప్రమాణాలు", "मापने योग्य शासन मानक"),
    "Enables comparative benchmarking with top smart cities across India.": (
        "భారతదేశంలోని అగ్రశ్రేణి స్మార్ట్ నగరాలతో పోలిక మరియు బెంచ్‌మార్కింగ్‌ను సాధ్యం చేస్తుంది.",
        "भारत के शीर्ष स्मार्ट शहरों के साथ तुलनात्मक मूल्यांकन सक्षम करता है।"
    ),
    "Sustainable Administrative Transformation": ("స్థిరమైన పరిపాలనా పరివర్తన", "सतत प्रशासनिक परिवर्तन"),
    "Institutional knowledge remains preserved in digital workflows beyond personnel changes.": (
        "సిబ్బంది మారినప్పటికీ సంస్థాగత జ్ఞానం డిజిటల్ వర్క్‌ఫ్లోలలో భద్రంగా ఉంటుంది.",
        "कर्मचारियों के बदलने के बावजूद संस्थागत ज्ञान डिजिटल कार्यप्रवाह में सुरक्षित रहता है।"
    ),

    # Pages 19 to 24 (Government Communication & Monitoring)
    "8. Government Communication & Public Notification System": (
        "8. ప్రభుత్వ సమాచార మార్పిడి & ప్రజా నోటిఫికేషన్ వ్యవస్థ",
        "8. सरकारी संचार और सार्वजनिक अधिसूचना प्रणाली"
    ),
    "Multi-Channel Broadcast": ("బహుళ ప్రసార మార్గాల ప్రసారం", "मल्टी-चैनल प्रसारण"),
    "Emergency Alerts": ("అత్యవసర హెచ్చరికలు", "आपातकालीन अलर्ट"),
    "Send instant disaster and flood warnings to targeted wards.": (
        "లక్ష్యిత వార్డులకు తక్షణ విపత్తు మరియు వరద హెచ్చరికలను పంపండి.",
        "लक्षित वार्डों को तत्काल आपदा और बाढ़ की चेतावनी भेजें।"
    ),
    "Public Works Updates": ("ప్రజా పనుల తాజా సమాచారం", "सार्वजनिक कार्यों के अपडेट"),
    "Notify residents before road closures or water supply disruptions.": (
        "రహదారుల మూసివేత లేదా నీటి సరఫరా అంతరాయాలకు ముందు నివాసితులకు తెలియజేయండి.",
        "सड़क बंद होने या पानी की आपूर्ति में रुकावट से पहले निवासियों को सूचित करें।"
    ),
    "Citizen Advisory": ("పౌర సలహాలు", "नागरिक सलाह"),
    "Seasonal health advisories, vaccination drives, and sanitation campaigns.": (
        "కాలానుగుణ ఆరోగ్య సలహాలు, టీకా డ్రైవ్‌లు మరియు పారిశుధ్య ప్రచారాలు.",
        "मौसमी स्वास्थ्य परामर्श, टीकाकरण अभियान और स्वच्छता अभियान।"
    ),
    "Tax & Billing Notices": ("పన్ను & బిల్లింగ్ నోటీసులు", "कर और बिलिंग सूचनाएं"),
    "Property tax due reminders with direct digital payment links.": (
        "నేరుగా డిజిటల్ చెల్లింపు లింక్‌లతో ఆస్తి పన్ను గడువు రిమైండర్‌లు.",
        "सीधे डिजिटल भुगतान लिंक के साथ संपत्ति कर देय अनुस्मारक।"
    ),
    "8.2 Communication Channels": ("8.2 సమాచార ప్రసార మార్గాలు", "8.2 संचार माध्यम"),
    "Mobile App Push Notifications": ("మొబైల్ యాప్ పుష్ నోటిఫికేషన్లు", "मोबाइल ऐप पुश सूचनाएं"),
    "SMS Gateway": ("ఎస్.ఎం.ఎస్ గేట్‌వే", "एसएमएस गेटवे"),
    "Public Web Portal": ("ప్రజా వెబ్ పోర్టల్", "सार्वजनिक वेब पोर्टल"),
    "Digital Signage & Notice Boards": ("డిజిటల్ బోర్డులు & నోటీసు బోర్డులు", "डिजिटल साइनेज और नोटिस बोर्ड"),
    "8.3 Administrative Benefits": ("8.3 పరిపాలనా ప్రయోజనాలు", "8.3 प्रशासनिक लाभ"),
    "Targeted Ward Communication": ("లక్ష్యిత వార్డు సమాచార మార్పిడి", "लक्षित वार्ड संचार"),
    "Broadcast notices only to affected wards to avoid notification fatigue.": (
        "అనవసరమైన నోటిఫికేషన్లను నివారించడానికి ప్రభావిత వార్డులకు మాత్రమే నోటీసులను ప్రసారం చేయండి.",
        "अनावश्यक सूचनाओं से बचने के लिए केवल प्रभावित वार्डों को नोटिस प्रसारित करें।"
    ),
    "Delivery Audit & Verification": ("డెలివరీ ఆడిట్ & ధృవీకరణ", "वितरण ऑडिट और सत्यापन"),
    "Track SMS and push delivery rates with timestamps and carrier logs.": (
        "సమయముద్రలు మరియు క్యారియర్ లాగ్‌లతో ఎస్.ఎం.ఎస్ మరియు పుష్ డెలివరీ రేట్లను ట్రాక్ చేయండి.",
        "टाइमस्टैम्प और कैरियर लॉग के साथ एसएमएस और पुश डिलीवरी दरों को ट्रैक करें।"
    ),
    "8.4 Citizen Impact": ("8.4 పౌర ప్రభావం", "8.4 नागरिक प्रभाव"),
    "Zero Information Gap": ("సమాచార లోపం లేకపోవడం", "शून्य सूचना अंतर"),
    "Residents receive critical updates without depending on third-party rumors.": (
        "నివాసితులు తప్పుడు ప్రచారాలపై ఆధారపడకుండా కీలకమైన అధికారిక సమాచారాన్ని పొందుతారు.",
        "नागरिक बिना किसी अफवाह पर निर्भर हुए सीधे महत्वपूर्ण अपडेट प्राप्त करते हैं।"
    ),
    "Proactive Preparedness": ("క్రియాశీలక సన్నద్ధత", "सक्रिय तत्परता"),
    "Early alerts for water shortages allow households to store water in advance.": (
        "నీటి కొరతపై ముందస్తు హెచ్చరికలు గృహాలు ముందుగానే నీటిని నిల్వ చేసుకోవడానికి అనుమతిస్తాయి.",
        "पानी की कमी की पूर्व चेतावनी से परिवार पहले से पानी का भंडारण कर सकते हैं।"
    ),
    "9. Governance & Monitoring Mechanism": ("9. పాలన & పర్యవేక్షణ యంత్రాంగం", "9. शासन और निगरानी तंत्र"),
    "Central monitoring by Municipal Commissioner's office with city-wide real-time visibility.": (
        "నగరవ్యాప్త రియల్-టైమ్ దృశ్యమానతతో మున్సిపల్ కమిషనర్ కార్యాలయం ద్వారా కేంద్రీకృత పర్యవేక్షణ.",
        "शहरव्यापी रीयल-टाइम दृश्यता के साथ नगर निगम आयुक्त कार्यालय द्वारा केंद्रीकृत निगरानी।"
    ),
    "Periodic review meetings using live dashboard metrics to address bottlenecks.": (
        "సమస్యలను పరిష్కరించడానికి ప్రత్యక్ష డాష్‌బోర్డ్ కొలమానాలను ఉపయోగించి కాలానుగుణ సమీక్షా సమావేశాలు.",
        "बाधाओं को दूर करने के लिए लाइव डैशबोर्ड मेट्रिक्स का उपयोग करके आवधिक समीक्षा बैठकें।"
    ),
    "Automated monthly performance reports and ward rankings.": (
        "స్వయంచాలక నెలవారీ పనితీరు నివేదికలు మరియు వార్డు ర్యాంకింగ్‌లు.",
        "स्वचालित मासिक प्रदर्शन रिपोर्ट और वार्ड रैंकिंग।"
    ),
    "6-Step Automated escalation of critical issues and SLA breaches to senior leadership.": (
        "కీలక సమస్యలు మరియు ఎస్.ఎల్.ఎ ఉల్లంఘనలను ఉన్నత నాయకత్వానికి చేరవేసే 6-దశల స్వయంచాలక తీవ్రతరం.",
        "वरिष्ठ नेतृत्व को गंभीर समस्याओं और एसएलए उल्लंघनों का 6-चरणीय स्वचालित एस्केलेशन।"
    ),
    "Monthly Performance Report – May 2024": ("నెలవారీ పనితీరు నివేదిక – మే 2024", "मासिक प्रदर्शन रिपोर्ट – मई 2024"),
    "Commissioner's Command Office": ("కమిషనర్ కమాండ్ కార్యాలయం", "आयुक्त कमान कार्यालय"),
    "Total City Complaints": ("మొత్తం నగర ఫిర్యాదులు", "शहर की कुल शिकायतें"),
    "Central Repository (May)": ("కేంద్ర నిల్వ (మే)", "केंद्रीय भंडार (मई)"),
    "Resolved Complaints": ("పరిష్కరించబడిన ఫిర్యాదులు", "हल की गई शिकायतें"),
    "Verified with Evidence": ("రుజువుతో ధృవీకరించబడింది", "प्रमाण के साथ सत्यापित"),
    "Active Operations": ("చురుకైన కార్యకలాపాలు", "सक्रिय संचालन"),
    "Critical SLA Breaches": ("క్లిష్టమైన ఎస్.ఎల్.ఎ ఉల్లంఘనలు", "गंभीर एसएलए उल्लंघन"),
    "Requires Direct Action": ("ప్రత్యక్ష చర్య అవసరం", "प्रत्यक्ष कार्रवाई आवश्यक"),
    "6-Step Automated Escalation Flow (Slide 24 exact)": (
        "6-దశల స్వయంచాలక తీవ్రతర ప్రవాహం (స్లైడ్ 24)",
        "6-चरणीय स्वचालित एस्केलेशन प्रवाह (स्लाइड 24)"
    ),
    "Automated escalation triggers when departmental SLAs are breached": (
        "శాఖా ఎస్.ఎల్.ఎలు ఉల్లంఘించబడినప్పుడు స్వయంచాలక తీవ్రతరం ప్రేరేపించబడుతుంది",
        "विभागीय एसएलए का उल्लंघन होने पर स्वचालित एस्केलेशन शुरू होता है"
    ),
    "Step 1: Issue Logged / Detected": ("దశ 1: సమస్య నమోదు / గుర్తింపు", "चरण 1: समस्या दर्ज / पहचानी गई"),
    "Citizen or sensor logs grievance with SLA counter": ("పౌరుడు లేదా సెన్సార్ ఎస్.ఎల్.ఎ కౌంటర్‌తో ఫిర్యాదును నమోదు చేస్తుంది", "नागरिक या सेंसर एसएलए काउंटर के साथ शिकायत दर्ज करता है"),
    "Step 2: SLA Breach Exceeded": ("దశ 2: ఎస్.ఎల్.ఎ గడువు ముగిసింది", "चरण 2: एसएलए समय सीमा समाप्त"),
    "Target hours elapsed without field status update": ("క్షేత్ర స్థితి అప్‌డేట్ లేకుండా నిర్దేశిత గంటలు గడిచిపోయాయి", "फील्ड स्थिति अपडेट के बिना निर्धारित घंटे बीत गए"),
    "Step 3: Automatic Escalation": ("దశ 3: స్వయంచాలక తీవ్రతరం", "चरण 3: स्वचालित एस्केलेशन"),
    "System triggers high-priority alert without manual intervention": ("మాన్యువల్ జోక్యం లేకుండా వ్యవస్థ అధిక-ప్రాధాన్యత హెచ్చరికను ప్రేరేపిస్తుంది", "प्रणाली बिना मानवीय हस्तक्षेप के उच्च प्राथमिकता अलर्ट ट्रिगर करती है"),
    "Step 4: Alert Sent to Leadership": ("దశ 4: నాయకత్వానికి హెచ్చరిక పంపబడింది", "चरण 4: नेतृत्व को अलर्ट भेजा गया"),
    "Delivered to Commissioner, Addl Commissioner & HoD dashboard": ("కమిషనర్, అదనపు కమిషనర్ & హెచ్‌ఒడి డాష్‌బోర్డ్‌కు పంపబడింది", "आयुक्त, अतिरिक्त आयुक्त और विभागाध्यक्ष के डैशबोर्ड पर भेजा गया"),
    "Step 5: Review & Action Taken": ("దశ 5: సమీక్ష & తీసుకున్న చర్య", "चरण 5: समीक्षा और की गई कार्रवाई"),
    "Command directive issued; emergency resource dispatched": ("కమాండ్ ఆదేశం జారీ చేయబడింది; అత్యవసర వనరులు పంపబడ్డాయి", "कमांड निर्देश जारी; आपातकालीन संसाधन भेजे गए"),
    "Step 6: Issue Resolved & Closed": ("దశ 6: సమస్య పరిష్కరించబడింది & ముగిసింది", "चरण 6: समस्या हल और बंद"),
    "Photo proof uploaded, citizen notified & feedback recorded": ("ఫోటో రుజువు అప్‌లోడ్ చేయబడింది, పౌరుడికి తెలియజేయబడింది & అభిప్రాయం నమోదు చేయబడింది", "फोटो प्रमाण अपलोड, नागरिक को सूचित और प्रतिक्रिया दर्ज"),
    "Real-Time System Audit Trail & SLA Activity": ("నిజ-సమయ వ్యవస్థ ఆడిట్ ట్రయల్ & ఎస్.ఎల్.ఎ కార్యాచరణ", "रीयल-टाइम सिस्टम ऑडिट ट्रेल और एसएलए गतिविधि"),
    "Live timestamped log of automated escalations, status shifts, and leadership directives": (
        "స్వయంచాలక తీవ్రతరాలు, స్థితి మార్పులు మరియు నాయకత్వ ఆదేశాల ప్రత్యక్ష సమయముద్రిత లాగ్",
        "स्वचालित एस्केलेशन, स्थिति परिवर्तन और नेतृत्व निर्देशों का लाइव टाइमस्टैम्प्ड लॉग"
    ),
    "Actor / User": ("కర్త / వినియోగదారుడు", "उपयोगकर्ता / कर्ता"),
    "Action Type": ("చర్య రకం", "कार्रवाई का प्रकार"),
    "Resource / Target": ("వనరు / లక్ష్యం", "संसाधन / लक्ष्य"),
    "Audit Details": ("ఆడిట్ వివరాలు", "ऑडिट विवरण"),
    "Timestamp": ("సమయముద్ర", "समय"),
    "Real-Time Visibility": ("నిజ-సమయ దృశ్యమానత", "रीयल-टाइम दृश्यता"),
    "Across entire city": ("నగరం అంతటా", "पूरे शहर में"),
    "Automatic Escalation": ("స్వయంచాలక తీవ్రతరం", "स्वचालित एस्केलेशन"),
    "When SLA is breached": ("ఎస్.ఎల్.ఎ ఉల్లంఘించబడినప్పుడు", "जब एसएलए का उल्लंघन होता है"),
    "Direct Action": ("ప్రత్యక్ష చర్య", "सीधी कार्रवाई"),
    "Leadership intervention": ("నాయకత్వ జోక్యం", "नेतृत्व का हस्तक्षेप"),
    "Citizen Feedback": ("పౌర అభిప్రాయం", "नागरिक प्रतिक्रिया"),
    "Verified resolution": ("ధృవీకరించబడిన పరిష్కారం", "सत्यापित समाधान"),

    # Slides 25 & 26 (Already partially in implementation, reinforced here)
    "10. Conclusion & Way Forward": ("10. ముగింపు & భవిష్యత్ మార్గం", "10. निष्कर्ष और आगे की राह"),
    "Transformational step towards smart urban governance in Karimnagar.": (
        "కరీంనగర్‌లో స్మార్ట్ పట్టణ పాలన వైపు పరివర్తనాత్మక అడుగు.",
        "करीमनगर में स्मार्ट शहरी शासन की दिशा में एक परिवर्तनकारी कदम।"
    ),
    "Core gains: Greater Efficiency, Enhanced Transparency, Measurable Performance Outcomes.": (
        "ప్రధాన ప్రయోజనాలు: అధిక సామర్థ్యం, మెరుగైన పారదర్శకత, కొలవగల పనితీరు ఫలితాలు.",
        "मुख्य लाभ: अधिक दक्षता, बढ़ी हुई पारदर्शिता, मापने योग्य प्रदर्शन परिणाम।"
    ),
    "5 Impact Areas: Citizen-Centric Services, Data-Driven Governance, Financial Transparency, Ward Empowerment, Institutional Strengthening.": (
        "5 ప్రభావ రంగాలు: పౌర-కేంద్రీకృత సేవలు, డేటా ఆధారిత పాలన, ఆర్థిక పారదర్శకత, వార్డు సాధికారత, సంస్థాగత బలోపేతం.",
        "5 प्रभाव क्षेत्र: नागरिक-केंद्रित सेवाएं, डेटा-संचालित शासन, वित्तीय पारदर्शिता, वार्ड सशक्तिकरण, संस्थागत मजबूती।"
    ),
    "5-Step Way Forward: Adopt → Capacity Building → Continuous Optimization → Collaborate → Scale & Innovate.": (
        "5-దశల భవిష్యత్ మార్గం: స్వీకరించడం → సామర్థ్య పెంపు → నిరంతర ఆప్టిమైజేషన్ → సహకారం → విస్తరణ & ఆవిష్కరణ.",
        "5-चरणीय आगे की राह: अपनाना → क्षमता निर्माण → निरंतर अनुकूलन → सहयोग → विस्तार और नवाचार।"
    ),
    "11. Request for Approval": ("11. ఆమోదం కోసం అభ్యర్థన", "11. अनुमोदन हेतु अनुरोध"),
    "Approval sought to initiate: 1) Development & deployment of digital governance platform, 2) Pilot implementation in 5 selected wards, 3) Formation of monitoring committee.": (
        "ఈ క్రింది వాటిని ప్రారంభించడానికి ఆమోదం కోరబడుతోంది: 1) డిజిటల్ పాలన వేదిక అభివృద్ధి & విస్తరణ, 2) ఎంపిక చేసిన 5 వార్డులలో పైలట్ అమలు, 3) పర్యవేక్షణ కమిటీ ఏర్పాటు.",
        "शुरू करने के लिए अनुमोदन मांगा गया: 1) डिजिटल गवर्नेंस प्लेटफॉर्म का विकास और तैनाती, 2) 5 चयनित वार्डों में प्रायोगिक कार्यान्वयन, 3) निगरानी समिति का गठन।"
    ),
    "Your approval today, a better Karimnagar tomorrow.": (
        "నేడు మీ ఆమోదం, రేపు మెరుగైన కరీంనగర్.",
        "आज आपका अनुमोदन, कल एक बेहतर करीमनगर।"
    ),
    "Expected Outcomes: Improved Efficiency, Enhanced Transparency, Better Citizen Experience, Data-Driven Decisions, Stronger Governance.": (
        "ఆశించిన ఫలితాలు: మెరుగైన సామర్థ్యం, పెరిగిన పారదర్శకత, మెరుగైన పౌర అనుభవం, డేటా ఆధారిత నిర్ణయాలు, బలమైన పాలన.",
        "अपेक्षित परिणाम: बेहतर दक्षता, बढ़ी हुई पारदर्शिता, बेहतर नागरिक अनुभव, डेटा-संचालित निर्णय, मजबूत शासन।"
    ),
}

# Add all items to te and hi
te_deck = {}
hi_deck = {}

for k, (t_val, h_val) in T.items():
    te_deck[k.strip()] = t_val
    hi_deck[k.strip()] = h_val

# Fill any remaining deck strings from deckStrings.json with algorithmic & fallback translations
for page, items in deck.items():
    for item in items:
        s = item.strip()
        if s not in te_deck:
            # Check Ward pattern
            m = re.match(r"^Ward (\d+)(?: – (.+))?$", s)
            if m:
                w_num = m.group(1)
                colony = m.group(2)
                if colony:
                    te_deck[s] = f"వార్డు {w_num} – {colony}"
                    hi_deck[s] = f"वार्ड {w_num} – {colony}"
                else:
                    te_deck[s] = f"వార్డు {w_num}"
                    hi_deck[s] = f"वार्ड {w_num}"
                continue
            
            # Check percentage
            if re.match(r"^\d+%$", s):
                te_deck[s] = s
                hi_deck[s] = s
                continue
            
            # Numeric values
            if re.match(r"^₹?\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:Cr|L|Days|★/5|%))?$", s):
                te_deck[s] = s
                hi_deck[s] = s
                continue

            # Do not emit English fallback for text strings so they don't clobber real translations
            pass

print(f"Generated {len(te_deck)} deck translations for Telugu and Hindi")

# Write to src/i18n/locales/deckTranslations.ts
out_ts = """export const DECK_TRANSLATIONS: {
  te: Record<string, string>;
  hi: Record<string, string>;
} = {
  te: """ + json.dumps(te_deck, ensure_ascii=False, indent=2) + """,
  hi: """ + json.dumps(hi_deck, ensure_ascii=False, indent=2) + """
};
"""

with open("src/i18n/locales/deckTranslations.ts", "w", encoding="utf-8") as f:
    f.write(out_ts)

print("Successfully wrote src/i18n/locales/deckTranslations.ts")
