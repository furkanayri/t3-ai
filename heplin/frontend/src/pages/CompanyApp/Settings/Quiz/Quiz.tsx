import { Card, Divider, Tab, Tabs, Box } from '@mui/material'
import React, { useState, useMemo } from 'react'
import { useRouter } from 'src/hooks/use-router'
import { CustomButton } from 'src/components/shared'
import { Add, List, Assignment } from '@mui/icons-material'
import { useSearchParams } from 'react-router-dom';
import QuizSetDialog from './components/QuizSetDialog';
import QuizSetList from './components/QuizSetList'
import QuizAssignmentDialog from './components/QuizAssignmentDialog'
import QuizAssignmentList from './components/QuizAssignmentList'

function Quiz() {
  const router = useRouter()
  const [searchParams, setSearchParams] = useSearchParams();
  const [quizSetDialogOpen, setQuizSetDialogOpen] = useState(false);
  const [quizAssignmentDialogOpen, setQuizAssignmentDialogOpen] = useState(false);
  
  const activeTab = useMemo(() => searchParams.get('tab') || 'sets', [searchParams]);

  const handleNavigateToQuestion = () => {
    setSearchParams((prev) => {
      prev.set('settings', 'open');
      prev.set('activeTab', 'quizQuestions');
      return prev;
    });
  }

  const handleNavigateToList = () => {
    setSearchParams((prev) => {
      prev.set('settings', 'open');
      prev.set('activeTab', 'quizList');
      return prev;
    });
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSearchParams((prev) => {
      prev.set('tab', newValue);
      return prev;
    });
  }

  return (
    <div className='w-full'>
      <div className=' max-w-7xl pt-12 '>
        <div className='flex justify-between items-center mb-4'>
          <div>
            <h2 className='text-[20px] text-[#5E5E5E] font-medium'>Quiz Yönetimi</h2>
            <p className='text-[14px] text-[#8B8B8B]'>Quiz sorularını ve atamalarını yönetin</p>
          </div>
          <div>
            <div className='flex gap-3'>
              {activeTab === 'sets' && (
                <>
                  <CustomButton
                    onClick={handleNavigateToList}
                    startIcon={<List />}
                    variant="outlined"
                    sx={{
                      height: "30px",
                    }}
                  >
                    Soruları Listele
                  </CustomButton>

                  <CustomButton
                    onClick={handleNavigateToQuestion}
                    startIcon={<Add />}
                    sx={{
                      backgroundColor: "#fff",
                      color: "#E31E24",
                      border: "1px solid #E31E24",
                      boxShadow: "none",
                      px: "22px",
                      fontSize: "14px",
                      fontWeight: 400,
                      height: "30px",
                      '&:hover': {
                        backgroundColor: "#fff",
                        boxShadow: "none"
                      }
                    }}
                  >
                    Quiz Sorusu Ekle
                  </CustomButton>
                </>
              )}
              
              {activeTab === 'assignments' && (
                <CustomButton
                  onClick={() => setQuizAssignmentDialogOpen(true)}
                  startIcon={<Assignment />}
                  sx={{
                    backgroundColor: "#fff",
                    color: "#E31E24",
                    border: "1px solid #E31E24",
                    boxShadow: "none",
                    px: "22px",
                    fontSize: "14px",
                    fontWeight: 400,
                    height: "30px",
                    '&:hover': {
                      backgroundColor: "#fff",
                      boxShadow: "none"
                    }
                  }}
                >
                  Quiz Ata
                </CustomButton>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Quiz Setleri" value="sets" />
            <Tab label="Quiz Atamaları" value="assignments" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {activeTab === 'sets' && (
          <>
            <CustomButton
              onClick={() => setQuizSetDialogOpen(true)}
              variant="text"
              sx={{
                height: "30px",
                mb: 2
              }}
            >
              Soru Grubu Oluştur
            </CustomButton>
            <QuizSetList />
          </>
        )}

        {activeTab === 'assignments' && (
          <QuizAssignmentList />
        )}
      </div>

      {/* Dialogs */}
      <QuizSetDialog
        open={quizSetDialogOpen}
        onClose={() => setQuizSetDialogOpen(false)}
      />
      <QuizAssignmentDialog
        open={quizAssignmentDialogOpen}
        onClose={() => setQuizAssignmentDialogOpen(false)}
      />
    </div>

  )
}

export default Quiz