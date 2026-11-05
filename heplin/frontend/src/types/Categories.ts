export type Categories = {
    name: string;
    description: string;
    tenantId: string;
    status: CategoriesStatus;
};

export type CategoriesStatus = "active" | "pending"