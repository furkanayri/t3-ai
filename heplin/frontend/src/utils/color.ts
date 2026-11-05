import { STEP_COLORS } from "src/constants";

type StepColor = typeof STEP_COLORS[number];

export const stepColorHexMap: Record<StepColor, string> = {
    Grey: '#808080',
    Bisque: '#FFE4C4',
    LightCoral: '#F08080',
    PaleVioletRed: '#DB7093',
    LightPink: '#FFB6C1',
    PeachPuff: '#FFDAB9',
    PaleGoldenrod: '#EEE8AA',
    Coral: '#FF7F50',
    HotPink: '#FF69B4',
    Plum: '#DDA0DD',
    Khaki: '#F0E68C',
    SkyBlue: '#87CEEB',
    CadetBlue: '#5F9EA0'
};

export const getStepColorHex = (colorName: StepColor): string => {
    return stepColorHexMap[colorName] || '#808080';
};

export const jobPostStatusColorMapper = {
    published: "#16a34a50",
    pending: "#2563eb50",
    declined: "#dc262650",
    draft: "#4b556350",
    pendingClosure: "#ca8a0450",
    closed: "#dc262650",
}