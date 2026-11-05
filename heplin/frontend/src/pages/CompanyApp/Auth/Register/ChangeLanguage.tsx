import Menu from "@mui/material/Menu";
import React, { useEffect, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { useTranslation } from 'react-i18next';

export default function ChangeLng() {
    const [anchorEl, setAnchorEl] = useState(null);
    const { i18n } = useTranslation();
    const [savedLanguage, setSavedLanguage] = useState("en");

    useEffect(() => {
        const language = localStorage.getItem("i18n");
        if (language) {
            setSavedLanguage(language);
            i18n.changeLanguage(language);
        }
    }, [i18n]);

    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeLanguage = (lng: any) => {
        localStorage.setItem("i18n", lng);
        setSavedLanguage(lng);
        i18n.changeLanguage(lng);
    };

    return (
        <>
            <Button sx={{ color: "#E31E24" }} aria-controls="basic-menu" aria-haspopup="true" onClick={handleClick}>
                {savedLanguage.toUpperCase()}
            </Button>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {["en", "tr"].map((ln) => (
                    <MenuItem
                        className="lng-menu"
                        key={ln}
                        onClick={() => {
                            handleChangeLanguage(ln);
                            handleClose();
                        }}
                        style={{
                            display: ln === savedLanguage ? "none" : "block",
                            color: "black",
                        }}
                    >
                        {ln.toUpperCase()}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
