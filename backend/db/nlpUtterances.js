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
    heading: "Admission Requirements",
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
    heading: "About Our Programs", // Changed to a broader section
    filter: [
      "degree",
      "associate",
      "bachelor",
      "bsn",
      "pre-nursing",
      "practical nursing",
    ], // Filters for general degree info
  },
  associate_degree: {
    // New intent for specific associate degree queries
    phrases: [
      "tell me about the associate degree",
      "associate in pre-nursing",
      "apren-dta/mrp",
      "practical nursing associates",
    ],
    heading: "About Our Programs",
    filter: [
      "associate in pre-nursing",
      "apren-dta/mrp",
      "practical nursing associates",
    ], // Specific keywords
  },
  bachelors: {
    phrases: [
      "bachelors",
      "tell me about bachelors",
      "what about a bachelors",
      "bachelor’s degree",
      "do you have a bachelors",
    ],
    heading: "About Our Programs", // Changed to a broader section
    filter: ["bachelor", "bsn", "lpn to bsn", "bachelor of science"], // Filters for bachelor’s info
  },
  bsn_program: {
    // New intent for specific BSN queries
    phrases: [
      "tell me about the bsn program",
      "lpn to bsn",
      "bachelor of science in nursing",
    ],
    heading: "About Our Programs",
    filter: ["lpn to bsn", "bachelor of science in nursing", "bsn program"], // Specific keywords
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
    heading: "About Our Programs",
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
    heading: "Open Houses & Workshops",
  },
  contact: {
    phrases: [
      "contact",
      "how to contact nursing",
      "who do I contact",
      "where do I get help",
      "nursing department contact",
    ],
    heading: "Contact Information",
  },
  fallback: {
    phrases: ["idk", "not sure", "what", "huh", "no admissions", "ok fine"],
    response:
      "Oops, didn’t catch that right! What do you want to know about—nursing programs, admissions, degrees, events? Give me a nudge!",
  },
};

export const getUtterancesForHeading = (heading) => {
  const lowerHeading = heading.toLowerCase();
  for (const [key, value] of Object.entries(utterances)) {
    if (value.heading && lowerHeading.includes(key)) {
      return value.phrases;
    }
  }
  return [];
};
