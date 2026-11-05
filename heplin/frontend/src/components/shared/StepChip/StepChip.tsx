import { CSSProperties } from "react";
import { getStepColorHex } from "src/utils";

export function StepChip({ step, style = { width: "150px", height: "auto" } }: { step: any, style?: CSSProperties | undefined }) {
    return (
        <div
            style={style}
        >
            <p
                className='min-w-[75px] w-max text-center rounded-full capitalize bg-opacity-20 py-1 px-2'
                style={{
                    backgroundColor: getStepColorHex(step?.color) + 75,
                }}
            >
                {step?.title?.toLowerCase()}
            </p>
        </div>
    )
}