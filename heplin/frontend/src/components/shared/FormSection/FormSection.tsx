import { Grid, Typography } from "@mui/material";
import { ReactNode } from "react";

interface FormSectionProps {
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
}

export default function FormSection({ title, description, children }: FormSectionProps) {
    return <Grid
        container
        spacing={3}
    >
        <Grid
            item
            xs={12}
            md={4}
        >
            <Typography variant="h6">
                {title}
            </Typography>
            <Typography
                mt={2}
                color="text.secondary"
                variant="body2"
            >
                {description}
            </Typography>
        </Grid>
        <Grid
            item
            xs={12}
            md={8}
        >
            {children}
        </Grid>
    </Grid>
}