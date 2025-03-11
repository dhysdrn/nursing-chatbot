export const utterances = {
  greetings: {
    phrases: [
      "hello",
      "hi",
      "hey",
      "wassup",
      "sup",
      "yo",
      "hey hey",
      "hello i need help",
      "what’s good",
      "hola",
    ],
    response:
      "Hi there! I'm the GRC Nursing Chatbot. I can provide information about our different programs, degrees, events, and admissions.",
  },
  admissions: {
    phrases: [
      "admissions",
      "tell me about admissions",
      "tell me more about admissions",
      "what about admissions",
      "explain admissions",
      "can you tell me about admissions",
      "how do I apply",
      "how can I apply",
      "how to apply",
      "how do I get in",
      "how to join",
      "what’s the admission process",
      "admission details",
      "applying to nursing",
      "how do I sign up",
      "admission requirements",
      "what are the admission requirements",
      "what do I need to apply",
      "where can I apply",
      "when can I apply",
      "how do I start applying",
    ],
    heading: "Practical Nursing - Applications and Admissions", 
  },
  degrees: {
    phrases: [
      "degrees",
      "tell me about degrees",
      "what about degrees",
      "what degrees are offered",
      "how do I get a degree",
      "what steps do I need to take to get a degree",
      "degree options",
      "what degrees does grc offer",
      "can you tell me about degrees",
    ],
    heading: "Nursing - Associate Degree", 
  },
  bachelors: {
    phrases: [
      "bachelors",
      "tell me about bachelors",
      "what about a bachelors",
      "bachelor’s degree",
      "do you have a bachelors",
    ],
    heading: "Nursing - Bachelor Degree", 
  },
  programs: {
    phrases: [
      "programs",
      "tell me about programs",
      "what are the nursing programs",
      "nursing program info",
      "what’s the nursing program like",
      "tell me about grc nursing",
    ],
    heading: "Nursing - About Our Programs",
  },
  events: {
    phrases: [
      "events",
      "what events are there",
      "what’s going on for nursing",
      "what are the open houses",
      "what workshops do you have",
      "what events are going on",
      "when are the workshops",
      "when’s the next open house",
      "tell me about open houses",
      "tell me about events",
    ],
    heading: "Nursing - Open Houses & Workshops",
  },
  contact: {
    phrases: [
      "contact",
      "how to contact nursing",
      "who do I contact",
      "where do I get help",
      "nursing department contact",
    ],
    heading: "Nursing - Contact",
  },
  fallback: {
    phrases: ["idk", "not sure", "what", "huh", "no admissions", "ok fine"],
    response:
      "Oops, didn’t catch that right! What do you want to know about—nursing programs, admissions, degrees, events? Give me a nudge!",
  },
  thankyou: {
    phrases: ["thank you", "thanks", "thanks a lot", "thank you so much", "many thanks"],
    response: "You're welcome! Let me know if you need any more help!",
  },
};

export const getUtterancesForHeading = (heading) => {
  const lowerHeading = heading.toLowerCase(); 
  console.log(`Looking for heading: ${lowerHeading}`);  

  for (const [key, value] of Object.entries(utterances)) {
    if (value.heading) {
      const headingMatch = value.heading.toLowerCase();  
      console.log(`Comparing with: ${headingMatch}`);  
      
      if (lowerHeading.includes(headingMatch)) {
        console.log(`Match found! Returning phrases: ${value.phrases}`);  
        return value.phrases;
      }
    }
  }
 
  console.log("No match found. Returning fallback or inquiry responses.");  
  const fallback = utterances.fallback.phrases;
  const inquiries = [
    "What would you like to know about our nursing programs?",
    "Can I assist you with something else?",
    "What can I help you with today?",
  ];

  return [...fallback, ...inquiries];
};
