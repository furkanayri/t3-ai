import { Alert, backdropClasses, CircularProgress, Divider, Drawer, IconButton } from '@mui/material'
import { useSnackbar } from 'notistack';
import React, { Fragment, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useDeleteCandidateCommentMutation, useGetAllCandidateCommentsQuery } from 'src/hooks/useServices';
import { array } from 'src/utils';
import { AddComment, Comment, DeleteConfirm } from '../components';
import { CloseOutlined } from '@mui/icons-material';
interface CandidateCommentDrawerProps {
    onClose: () => void;
    open: boolean
}
type ActionState = {
    mode: 'initial' | 'delete';
    id: null | string;
};

const initialActionState: ActionState = {
    mode: 'initial',
    id: null,
};
function CandidateCommentDrawer({ onClose, open }: CandidateCommentDrawerProps) {
    const [searchParams, setSearchParams] = useSearchParams()
    const { t } = useTranslation();
    const [commentActionState, setCommentActionState] = useState<ActionState>(initialActionState);
    const candidateId = useMemo(() => searchParams.get('candidateId'), [searchParams]) ?? ''
    const { enqueueSnackbar } = useSnackbar();

    const deleteCommentMutation = useDeleteCandidateCommentMutation();
    const commentsQuery = useGetAllCandidateCommentsQuery({ candidateId });
    const commentsData = array<any>(commentsQuery.data?.results);

    const clearActionState = () => {
        setCommentActionState(initialActionState);
    };

    const openDeleteActionDialog = (commentId: string) => {
        setCommentActionState({ id: commentId, mode: 'delete' });
    };

    const onDeleteSubmit = () => {
        if (!commentActionState.id) return;
        deleteCommentMutation.mutate(
            { id: commentActionState.id, candidateId },
            {
                onSuccess: (res) => {
                    clearActionState();
                    commentsQuery.refetch();
                },
                onError: (err: any) => {
                    enqueueSnackbar(err?.message, { variant: 'error' });
                },
            }
        );
    };
    return (
        <Drawer
            anchor={'bottom'}
            open={open}
            variant='persistent'
            onClose={onClose}
            ModalProps={{
                sx: {
                    [`& .${backdropClasses.root}`]: {
                        background: 'transparent !important',
                    },
                },
            }}
            PaperProps={{
                sx: {
                    maxWidth: '100%',
                    width: '40vw',
                    minHeight: '40vh'
                },
            }}
        >
            <div className='p-4 h-[275px]'>
                <div className='text-end'>
                    <IconButton onClick={onClose}>
                        <CloseOutlined />
                    </IconButton>
                </div>
                <div className="mt-4 space-y-2 mx-4 ">
                    <DeleteConfirm
                        open={commentActionState.mode === 'delete'}
                        onClose={() => {
                            clearActionState();
                        }}
                        onConfirm={() => {
                            onDeleteSubmit();
                        }}
                        isDeleting={deleteCommentMutation.isLoading}
                    />

                    <AddComment
                        onSuccess={() => {
                            commentsQuery.refetch();
                        }}
                    />
                    <div className="space-y-2 relative min-h-[275px]">
                        {commentsQuery.isFetching ? (
                            <div className="absolute left-0 right-0 bottom-0 top-0 flex items-start justify-center bg-slate-50 bg-opacity-25">
                                <CircularProgress />
                            </div>
                        ) : commentsQuery.isError ? (
                            <Alert severity="error">{(commentsQuery.error as any)?.message}</Alert>
                        ) : commentsData.length === 0 ? (
                            <Alert
                                severity="info"
                                icon={false}
                            >
                                {t('notFoundAnyComments')}
                            </Alert>
                        ) : null}
                        {commentsData?.map((comment: any) => {
                            return (
                                <Fragment key={comment?._id}>
                                    <Comment
                                        onDelete={() => {
                                            openDeleteActionDialog(comment._id);
                                        }}
                                        users={comment?.user}
                                        createdBy={comment?.createdBy}
                                        content={comment?.content}
                                        createdAt={comment?.createdAt}
                                    />
                                    <Divider />
                                </Fragment>
                            );
                        })}
                    </div>
                </div>

            </div>
        </Drawer >
    )
}

export default CandidateCommentDrawer