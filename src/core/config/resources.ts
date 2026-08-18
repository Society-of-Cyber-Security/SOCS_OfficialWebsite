export type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "roadmap" | "tool" | "writeup" | "blog";
  tags: string[];
};

export const resources: Resource[] = [
  { id: "1", title: "Web Security Fundamentals", description: "A complete step-by-step roadmap to go from beginner to discovering your first bug.", url: "#", category: "roadmap", tags: ["Beginner", "Web"] },
  { id: "2", title: "Advanced XSS Payloads", description: "Learn how to bypass modern WAFs using polyglots and obscure encoding techniques.", url: "#", category: "roadmap", tags: ["Advanced", "Web"] },
  { id: "3", title: "Network Penetration Testing", description: "A comprehensive guide to scanning, enumerating, and exploiting corporate network environments.", url: "#", category: "roadmap", tags: ["Network", "Intermediate"] },
  { id: "4", title: "Cloud Security Path", description: "Understanding AWS/GCP IAM misconfigurations and how to spot them.", url: "#", category: "roadmap", tags: ["Cloud", "AWS"] },
  
  { id: "5", title: "Burp Suite Extensions", description: "Our curated list of the most essential Burp plugins for modern web app testing.", url: "#", category: "tool", tags: ["Tools", "Web"] },
  { id: "6", title: "Custom OSINT Framework", description: "A collection of scripts we use for automated intelligence gathering on targets.", url: "#", category: "tool", tags: ["OSINT", "Python"] },
  { id: "7", title: "Automated Fuzzer (Go)", description: "An incredibly fast directory and parameter fuzzer built by our alumni.", url: "#", category: "tool", tags: ["Go", "Fuzzing"] },
  { id: "8", title: "Decompiler Suite", description: "Must-have tools for reverse engineering compiled binaries.", url: "#", category: "tool", tags: ["RE", "Assembly"] },

  { id: "9", title: "HTB: Obscurity Writeup", description: "A detailed walkthrough of the HackTheBox machine Obscurity.", url: "#", category: "writeup", tags: ["HTB", "Linux", "Python"] },
  { id: "10", title: "Flare-On Challenge 1", description: "How we solved the first challenge of FireEye's Flare-On competition.", url: "#", category: "writeup", tags: ["Malware", "RE"] },
  { id: "11", title: "PicoCTF Web Exploits", description: "A breakdown of the hardest web challenges from PicoCTF 2025.", url: "#", category: "writeup", tags: ["Web", "CTF"] },
  { id: "12", title: "Defcon Quals 2026", description: "Our team's approach to the blockchain smart contract vulnerability challenge.", url: "#", category: "writeup", tags: ["Crypto", "Blockchain"] },

  { id: "13", title: "Zero-Click Attacks Explained", description: "Deep dive into how modern zero-click exploits work on mobile devices.", url: "#", category: "blog", tags: ["Mobile", "Exploitation"] },
  { id: "14", title: "Defcon 32 Experience", description: "What our team learned at the world's biggest hacker conference.", url: "#", category: "blog", tags: ["Community", "Events"] },
  { id: "15", title: "The Future of AI Security", description: "How LLMs are changing the landscape of offensive and defensive security.", url: "#", category: "blog", tags: ["AI", "Research"] },
  { id: "16", title: "Building a Cyber Lab", description: "A guide on setting up a home lab for malware analysis.", url: "#", category: "blog", tags: ["Infrastructure", "Lab"] }
];
