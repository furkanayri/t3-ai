

const now = new Date();

export const jobList = [
  {
    id: '1',
    tenantId:"",
    title: 'Frontend Developer',
    company: 'ABC Company',
    location: 'New York',
    type: 'Full-time',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet justo id velit placerat dapibus.',
    createdAt: now.getTime(),
    deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7).getTime(),
    skillsRequired: ['JavaScript', 'React', 'CSS'],
    salary: '$80,000 - $100,000',
    status: 'active',
    content:"denemedenemdnemden"
  },
  {
    id: '2',
    title: 'Backend Developer',
    company: 'XYZ Corporation',
    location: 'San Francisco',
    type: 'Remote',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet justo id velit placerat dapibus.',
    createdAt: now.getTime(),
    deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).getTime(),
    skillsRequired: ['Node.js', 'Express', 'MongoDB'],
    salary: '$90,000 - $110,000',
    status: 'active',
    content:"denemedenemdnemden"
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: '123 Design Studio',
    location: 'Los Angeles',
    type: 'Contract',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sit amet justo id velit placerat dapibus.',
    createdAt: now.getTime(),
    deadline: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21).getTime(),
    skillsRequired: ['UI Design', 'UX Design', 'Adobe XD'],
    salary: '$70,000 - $90,000',
    status: 'active',
    content:"denemedenemdnemden"
  },
];