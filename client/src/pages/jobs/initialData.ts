const allJobs = [
  {
    id: 0,
    industry: "Recruitment",
    companyDescription: "The mission of Kinderpedia is to use digital tools to transform education, by optimizing the administrative processes and placing parent-teacher-student collaboration right at the core of the learning act.",
    location: "Singapore (remote)",
    skills: {
      1: "Strong understanding of HTML5, cross-browser and cross-domain compatibility",
      2: "Good knowledge of Javascript (ES6+), JSON and AJAX",
      3: "Experience in consuming APIs, asynchronous code execution (async, await, Promise)"
    },
    noOfEmployees: "11-40",
    isRecruiting: "Actively recruiting",
    jobTitle: "Junior frontend developer",
    tasks: {
      1: "Build responsive user interfaces",
      2: "Write clean, commented code",
      3: "Optimize app for modularity and speed"
    },
    jobDescription: "We are looking for a highly resourceful and innovative developer with extensive experience as Web Developer who hate working in a stiff corporate environment. You`ll be joining a cool, agile team of like-minded people who are passionate about building and optimizing the most innovative web/API based platform for nurseries, kindergartens and schools. You`ll be using primarily Vue.js, JavaScript (ES6+), HTML5 and CSS3, with a strong emphasis on WebRTC and Websockets.",
    companyName: "Choosee",
    type: "Full-time"
  },
  {
    id: 1,
    noOfEmployees: "100-200",
    jobTitle: "Junior backend developer",
    location: "Singapore (remote)",
    industry: "HR",
    jobDescription: "You will join our team and you’ll be responsible for co-creating interactive computer vision and other various application on the web. We highly value innovation – and you will think along with us about our current business processes and implementations.",
    tasks: {
      1: "You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc",
      2: "You will improve both performance and features of existing micro-services",
      3: "You are responsible for the correct implementation of the design and also code yourself"
    },
    companyDescription: "This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).",
    skills: {
      1: "You have a bachelor’s or master’s degree in IT or science – or you have a similar degree",
      2: "You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)",
      3: "You have knowledge of Database implementations such as SQL or NoSQL"
    },
    companyName: "Virto",
    isRecruiting: "Actively recruiting",
    type: "Full-time"
  },
  {
    companyName: "Media-Arch",
    skills: {
      1: "You have a bachelor’s or master’s degree in IT or science – or you have a similar degree",
      2: "You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)",
      3: "You have knowledge of Database implementations such as SQL or NoSQL"
    },
    isRecruiting: "Promoted",
    companyDescription: "This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).",
    id: 2,
    location: "Malaysia (remote)",
    jobTitle: "Full-stack developer",
    tasks: {
      1: "You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc",
      2: "You will improve both performance and features of existing micro-services",
      3: "You are responsible for the correct implementation of the design and also code yourself"
    },
    industry: "IT Consultant",
    noOfEmployees: "10-20",
    type: "Part-time",
    jobDescription: "In this role, you’re a member of an agile team. You’ll work on a React application and collaborate with designers, UX writers, and back-end engineers. You’ll have the freedom to try out your ideas and work on a passion project. You’ll exchange knowledge with experts from different areas, including web accessibility, machine learning and serverless. You’ll choose the developing tools and computer environment that you’re most comfortable with."
  },
  {
    industry: "Finance",
    companyDescription: "This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).",
    isRecruiting: "Promoted",
    id: 3,
    location: "Singapore (remote)",
    skills: {
      1: "You have a bachelor’s or master’s degree in IT or science – or you have a similar degree",
      2: "You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)",
      3: "You have knowledge of Database implementations such as SQL or NoSQL"
    },
    jobDescription: "You will be joining a company that has recently been acquired and is therefore looking to grow their team due to increased demand for their product. You will join a team of 10 Ruby developers  Ideally, you will have worked with Ruby for more than 3 years and you will also have extensive experience with front-end frameworks. ",
    jobTitle: "Frontend developer",
    companyName: "Paytrix",
    tasks: {
      1: "You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc",
      2: "You will improve both performance and features of existing micro-services",
      3: "You are responsible for the correct implementation of the design and also code yourself"
    },
    type: "Full-time",
    noOfEmployees: "100-200"
  },
  {
    jobTitle: "Senior frontend developer",
    jobDescription: "You will join our team and you’ll be responsible for co-creating interactive computer vision and other various application on the web. We highly value innovation – and you will think along with us about our current business processes and implementations.",
    noOfEmployees: "1000-2000",
    industry: "Finance",
    tasks: {
      1: "You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc",
      2: "You will improve both performance and features of existing micro-services",
      3: "You are responsible for the correct implementation of the design and also code yourself"
    },
    type: "Full-time",
    companyDescription: "This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).",
    location: "EU (remote)",
    isRecruiting: "Actively recruiting",
    companyName: "Mellonare",
    id: 4,
    skills: {
      1: "You have a bachelor’s or master’s degree in IT or science – or you have a similar degree",
      2: "You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)",
      3: "You have knowledge of Database implementations such as SQL or NoSQL"
    }
  },
  {
    skills: {
      1: "You have a bachelor’s or master’s degree in IT or science – or you have a similar degree",
      2: "You have a significant amount of knowledge of both front and back-end developments (React, Bootstrap, Typescript, JavaScript, Node.js, SQL, NoSQL, Docker)",
      3: "You have knowledge of Database implementations such as SQL or NoSQL"
    },
    type: "Full-time",
    tasks: {
      1: "You will develop and implement various micro-services needed to visualize solar panel layouts with associated data such as wind, snow load, ballast, wiring scheme’s, etc",
      2: "You will improve both performance and features of existing micro-services",
      3: "You are responsible for the correct implementation of the design and also code yourself"
    },
    noOfEmployees: "10000-50000",
    companyName: "Acrolinx",
    companyDescription: "This company develops advanced WEB and CAD applications for solar energy systems, such as our renowned plugin for AutoCAD / BricsCAD (BIM).",
    location: "Australia (remote)",
    industry: "Transport",
    id: 5,
    isRecruiting: "Actively recruiting",
    jobTitle: "Senior frontend developer",
    jobDescription: "You will join our team and you’ll be responsible for co-creating interactive computer vision and other various application on the web. We highly value innovation – and you will think along with us about our current business processes and implementations."
  }
];
export default allJobs;
