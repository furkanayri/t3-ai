import { SchemaType } from "@google/generative-ai";




export const customSchema = {
    description: "User profile schema",
    type: SchemaType.OBJECT,
    properties: {
        languages: {
            type: SchemaType.ARRAY,
            description: "List of languages known by the user",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: {
                        type: SchemaType.STRING, enum: [
                            'english', 'turkish', 'spanish', 'french', 'german'
                        ], nullable: false
                    },
                    languageLevel: {
                        type: SchemaType.STRING,
                        enum: [
                            "beginner",
                            "pre-intermediate",
                            "intermediate",
                            "upper-intermediate",
                            "advanced",
                            "proficiency"
                        ],
                        nullable: false
                    }
                },
                required: ["name", "languageLevel"]
            }
        },
        skills: {
            type: SchemaType.ARRAY,
            description: "List of user skills",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, nullable: false },
                    slug: { type: SchemaType.STRING, nullable: false }
                },
                required: ["name", "slug"]
            }
        },
        experience: {
            type: SchemaType.ARRAY,
            description: "User work experience",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    title: { type: SchemaType.STRING, nullable: false },
                    description: { type: SchemaType.STRING, nullable: true },
                    isOngoing: { type: SchemaType.BOOLEAN, nullable: false },
                    company: { type: SchemaType.STRING, nullable: true },
                    position: { type: SchemaType.STRING, nullable: true },
                    jobType: {
                        type: SchemaType.STRING,
                        enum: [
                            "fulltime",
                            "parttime",
                            "contract",
                            "temporary",
                            "voluntarily",
                            "intern",
                            "other"
                        ],
                        nullable: true
                    },
                    locationType: {
                        type: SchemaType.STRING,
                        enum: ["onsite", "hybrid", "remote"],
                        nullable: false
                    },
                    country: {
                        type: SchemaType.OBJECT,
                        properties: {
                            names: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    en: { type: SchemaType.STRING, nullable: true },
                                    tr: { type: SchemaType.STRING, nullable: true }
                                },
                                nullable: true
                            }
                        },
                    },
                    city: { type: SchemaType.STRING, nullable: true },
                    district: { type: SchemaType.STRING, nullable: true },
                    isActive: { type: SchemaType.BOOLEAN, nullable: false },
                    startDate: { type: SchemaType.STRING, nullable: true },
                    endDate: { type: SchemaType.STRING, nullable: true }
                },
                required: ["title", "isOngoing", "locationType", "isActive"]
            }
        },
        education: {
            type: SchemaType.ARRAY,
            description: "User education details",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    institution: { type: SchemaType.STRING, nullable: false },
                    degree: { type: SchemaType.STRING, nullable: true },
                    major: { type: SchemaType.STRING, nullable: true },
                    startDate: { type: SchemaType.STRING, nullable: true },
                    endDate: { type: SchemaType.STRING, nullable: true },
                    isOngoing: { type: SchemaType.BOOLEAN, nullable: false },
                    isActive: { type: SchemaType.BOOLEAN, nullable: false }
                },
                required: ["institution", "isOngoing", "isActive"]
            }
        },
        certificates: {
            type: SchemaType.ARRAY,
            description: "User certifications",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    institution: { type: SchemaType.STRING, nullable: false },
                    degree: { type: SchemaType.STRING, nullable: false },
                    startDate: { type: SchemaType.STRING, nullable: true },
                    endDate: { type: SchemaType.STRING, nullable: true }
                },
                // required: ["institution", "degree"]
            }
        },
        contactInformation: {
            type: SchemaType.OBJECT,
            description: "User contact details",
            properties: {
                name: { type: SchemaType.STRING, nullable: false },
                surname: { type: SchemaType.STRING, nullable: false },
                email: { type: SchemaType.STRING, nullable: false },
                address: { type: SchemaType.STRING, nullable: false },
                githubUrl: { type: SchemaType.STRING, nullable: true },
                linkedinUrl: { type: SchemaType.STRING, nullable: true },
                phoneNumber: { type: SchemaType.STRING, nullable: false },
                birthDay: { type: SchemaType.STRING, nullable: true }
            },
            // required: ["name", "surname", "email", "address", "phoneNumber"]
        },
        reference: {
            type: SchemaType.ARRAY,
            description: "User references",
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    name: { type: SchemaType.STRING, nullable: false },
                    description: { type: SchemaType.STRING, nullable: false },
                    contact: {
                        type: SchemaType.ARRAY,
                        items: {
                            type: SchemaType.OBJECT,
                            properties: {
                                email: { type: SchemaType.STRING, nullable: false },
                                phoneNumber: { type: SchemaType.STRING, nullable: false }
                            },
                            required: ["email", "phoneNumber"]
                        }
                    }
                },
                required: ["name", "description", "contact"]
            }
        },
        coverLetter: { type: SchemaType.STRING, description: "User cover letter", nullable: false }
    },
    required: ["languages", "skills", "experience", "education", "certificates", "contactInformation", "reference", "coverLetter"]
};
