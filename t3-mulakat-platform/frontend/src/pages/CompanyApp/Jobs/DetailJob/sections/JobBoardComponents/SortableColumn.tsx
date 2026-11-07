import React from 'react';
import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { getStepColorHex } from 'src/utils';

type SortableColumnProps = {
    step: { _id: string; color?: any; title?: string };
    children: React.ReactNode;
    isOver?: boolean;
};

export const SortableColumn: React.FC<SortableColumnProps> = ({ step, children, isOver }) => {
    const columnId = `column-${step._id}`;    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: columnId,
        data: { type: 'column', stepId: step._id },
        disabled: false, // Sürükleme için kolon aktif olsun
    });

    const style: React.CSSProperties = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.8 : 1,
        backgroundColor: isOver && step.color ? `${getStepColorHex(step.color)}80` : undefined,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: { xs: 200, sm: 300 },
                overflow: 'hidden',
                borderRadius: 1,
            }}
        >
            <Box
                sx={{
                    backgroundColor: (theme) =>
                        isOver
                            ? 'transparent'
                            : theme.palette.mode === 'dark'
                                ? 'neutral.900'
                                : 'neutral.100',
                    borderRadius: 1,
                    height: '100%',
                }}
            >
                <Box sx={{ flexGrow: 1, height: '100%', px: 0.75, pt: 0.75 }}>{children}</Box>
            </Box>
        </Box>
    );
};

export default SortableColumn;