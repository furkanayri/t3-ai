import { Button, type ButtonProps } from "@mui/material";

export function CustomButton(props: ButtonProps) {
    return (
        <Button
            {...props}
            sx={{
                backgroundColor: '#E31E24',
                color: '#fff',
                borderRadius: "7px",
                height: "max-content",
                py: "8px",
                px: "12px",
                boxShadow: "0px 4px 14.8px 0px #A6A6A640",
                "&:hover": {
                    backgroundColor: "#E31E24",
                    boxShadow: "0px 4px 14.8px 0px #A6A6A640",
                },
                ...(!!props?.sx ? props.sx : {}),
            }}
        >
            {props.children}
        </Button>
    );
}