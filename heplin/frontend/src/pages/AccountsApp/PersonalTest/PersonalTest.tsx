import React, { useState } from 'react';
import { Button, Typography, CircularProgress, Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEvaluateAnswersMutation } from 'src/hooks/useServices/usePersonalTestServices';
import { useAuth } from 'src/providers';
import { t } from 'i18next';
import { useNavigate } from 'react-router';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type AnswerType = {
    questionIndex: number;
    selectedOption: string;
    answerKey?: string;
    questionText?: string;
    trait?: string;
    optionText?: string;
};

export function Component() {
    const questions = [
        { question: "Kalabalık ortamlarda bulunmaktan keyif alırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yeni insanlarla tanışmak beni heyecanlandırır.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Sosyal etkinliklerde genellikle konuşmayı başlatan kişi olurum.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Partilere katılmak benim için eğlencelidir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Kalabalık gruplar içinde kendimi rahat hissederim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "İnsanlarla iletişim kurmak bana enerji verir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Topluluk önünde konuşmaktan çekinmem.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yeni ortamlara girmekten çekinmem.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Sosyal etkinliklerde aktif rol almayı severim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Çevremdeki insanlarla sık sık sohbet ederim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının fikirlerine saygı duyarım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Çatışmalardan kaçınmak için çaba gösteririm.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının ihtiyaçlarını kendi ihtiyaçlarımın önüne koyarım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Grup kararlarına uyum sağlamak benim için önemlidir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının duygularını anlamaya çalışırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "İnsanlarla iyi geçinmek benim için önceliklidir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının önerilerine açık bir şekilde yaklaşırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarına yardım etmekten mutluluk duyarım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının bakış açılarını anlamaya çalışırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "İnsanlar arasında uyum sağlamak için çaba sarf ederim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Görevlerimi zamanında tamamlamak benim için önemlidir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Detaylara dikkat ederim ve işimi titizlikle yaparım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Sorumluluklarımı yerine getirmekte güvenilirim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Planlı ve organize bir şekilde çalışırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının benden beklediği işleri öncelikli olarak tamamlarım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "İşlerimi ertelemekten kaçınırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Kendi standartlarımı yüksek tutarım ve bunlara ulaşmaya çalışırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "İşlerimi yaparken dikkatli ve özenli davranırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Başkalarının işlerini aksatmamaya özen gösteririm.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Kendime verilen görevleri ciddiyetle ele alırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Zor durumlarla karşılaştığımda sakin kalabilirim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Beklenmedik olaylar karşısında kolayca paniğe kapılmam.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Stresli anlarda duygularımı kontrol edebilirim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Hayal kırıklığı yaşadığımda çabuk toparlanırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Duygusal olarak dengeli bir insan olduğumu düşünüyorum.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Kriz anlarında soğukkanlı kalabilirim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Duygusal olarak zorlandığımda bile mantıklı kararlar alabilirim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Kendimi duygusal olarak güçlü hissederim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Duygusal tepkilerimi kontrol etmekte zorlanmam.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Duygusal dalgalanmalarım nadiren olur.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yeni ve farklı yemekler denemekten hoşlanırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Sanat galerilerini ve müzeleri ziyaret etmeyi severim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Farklı kültürlerden insanlarla tanışmak beni heyecanlandırır.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yeni bir hobi edinmek için hevesliyimdir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Farklı müzik türlerini keşfetmekten keyif alırım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Seyahat etmek ve yeni yerler görmek beni mutlu eder.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Farklı düşünce tarzlarına açık biriyimdir.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yeni teknolojileri denemekten çekinmem.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Yaratıcı yazılar veya hikayeler yazmayı severim.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
        { question: "Geleneksel olmayan fikirleri değerlendirmeye açığım.", options: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kararsızım", "Katılıyorum", "Kesinlikle katılıyorum"] },
    ];

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerType[]>([]);
    const { enqueueSnackbar } = useSnackbar();
    const [isProcessing, setIsProcessing] = useState(false);
    const auth = useAuth();
    const user = auth?.user;
    const userId = user?._id;
    const evaluateAnswersMutation = useEvaluateAnswersMutation();
    const navigate = useNavigate();

    const handleAnswerChange = (questionIndex: number, selectedOption: string) => {
        if (isProcessing) return;

        setAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex(answer => answer.questionIndex === questionIndex);

            if (existingAnswerIndex !== -1) {
                const updatedAnswers = [...prevAnswers];
                updatedAnswers[existingAnswerIndex].selectedOption = selectedOption;
                return updatedAnswers;
            } else {
                return [...prevAnswers, { questionIndex, selectedOption }];
            }
        });

        if (selectedOption === "Katılıyorum" || selectedOption === "Kesinlikle katılıyorum" || selectedOption === "Kesinlikle katılmıyorum" || selectedOption === "Katılmıyorum" || selectedOption === "Kararsızım") {
            setIsProcessing(true);
            setTimeout(() => {
                nextQuestion();
                setIsProcessing(false);
            }, 600);
        } else {
            nextQuestion();
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const previousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const areAllQuestionsAnswered = answers.length === questions.length;

    const submitAnswers = async () => {
        if (!areAllQuestionsAnswered) {
            enqueueSnackbar({
                message: t('answerTheQuestions'),
                variant: 'warning',
            });
            return;
        }
        if (userId) {
            try {
                await evaluateAnswersMutation.mutateAsync({ answers: answers.map(a => ({ ...a })), userId });
                enqueueSnackbar({
                    message: t('personelTestCompletedSuccessfully'),
                    variant: 'success',
                });
                navigate('/my-applications')
                window.location.reload();
            } catch (err: any) {
                enqueueSnackbar({
                    message: err?.response?.data?.message || err?.message,
                    variant: 'error',
                });
            }
        } else {
            console.error("User ID bulunamadı!");
        }
    };

    return (
        <>
            {user?.isPersonaltyTest ?
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '70vh',
                    }}
                >
                    <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
                        {t('completePersonelTest')}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4 }}>
                        {t('continueOther')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/my-applications')}
                        sx={{ mt: 4 }}
                    >
                        {t('returnToMainPage')}
                    </Button>
                </Box> :
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        maxWidth: '98%',
                        minHeight: '83vh',
                        backgroundColor: '#f7f9fc',
                        position: 'relative',
                        borderRadius: 6,
                        p: 4,
                    }}
                >
                    <Box sx={{ textAlign: 'center', position: 'absolute', top: '5%', color: '#E31E24' }}>
                        <Typography variant="h3">{t('Personality Test')}</Typography>
                    </Box>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            p: 6,
                            borderRadius: '16px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                            width: '100%',
                            maxWidth: '1000px',
                            textAlign: 'center',
                            background: 'linear-gradient(135deg, #bfe7f7 0%,  #e5d3f7 100%)',
                        }}
                    >
                        <Typography variant="h5" sx={{ mb: 4, mt: 4, color: '#333' }}>
                            {currentQuestionIndex + 1}. {questions[currentQuestionIndex].question}
                        </Typography>

                        <RadioGroup
                            row
                            value={answers.find(ans => ans.questionIndex === currentQuestionIndex)?.selectedOption || ''}
                            onChange={(e) => handleAnswerChange(currentQuestionIndex, e.target.value)}
                            sx={{ justifyContent: 'space-between', width: '100%', alignItems: 'center', px: 4 }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4338ca', mx: 2 }}>
                                Katılmıyorum
                            </Typography>
                            {questions[currentQuestionIndex].options.map((option, optionIndex) => {

                                let size = 35;
                                let color = 'grey';

                                if (option === "Kesinlikle katılmıyorum" || option === "Katılmıyorum") {
                                    color = '#4338ca';
                                    size = option === "Kesinlikle katılmıyorum" ? 55 : 45;
                                } else if (option === "Kesinlikle katılıyorum" || option === "Katılıyorum") {
                                    color = '#26944f';
                                    size = option === "Kesinlikle katılıyorum" ? 55 : 45;
                                }

                                return (
                                    <Radio
                                        key={optionIndex}
                                        value={option}
                                        sx={{
                                            color: color,
                                            '&.Mui-checked': {
                                                color: color,
                                            },
                                            '& .MuiSvgIcon-root': {
                                                fontSize: `${size}px`,
                                            },
                                            mx: 1, // Adds space between radio buttons
                                        }}
                                        checkedIcon={<CheckCircleIcon sx={{ fontSize: `${size}px` }} />}
                                    />
                                );
                            })}
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#26944f', mx: 2 }}>
                                Kabul Ediyorum
                            </Typography>
                        </RadioGroup>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 6 }}>
                            <Button
                                variant="outlined"
                                onClick={previousQuestion}
                                disabled={currentQuestionIndex === 0 || isProcessing}
                                sx={{
                                    width: '150px',
                                    borderColor: '#4338ca',
                                    color: '#4338ca',
                                    '&:hover': {
                                        borderColor: '#4338ca',
                                        backgroundColor: 'rgba(67, 56, 202, 0.04)',
                                    },
                                }}
                            >
                                {t('back')}
                            </Button>
                            {currentQuestionIndex < questions.length - 1 ? (
                                <Button
                                    variant="outlined"
                                    onClick={nextQuestion}
                                    disabled={isProcessing}
                                    sx={{
                                        width: '150px',
                                        borderColor: '#26944f',
                                        color: '#26944f',
                                        '&:hover': {
                                            borderColor: '#26944f',
                                            backgroundColor: 'rgba(76, 175, 80, 0.04)',
                                        },
                                    }}
                                >
                                    {t('next')}
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    onClick={submitAnswers}
                                    disabled={!areAllQuestionsAnswered || evaluateAnswersMutation.isLoading || isProcessing}
                                    sx={{
                                        width: '150px',
                                        borderColor: '#26944f',
                                        color: '#26944f',
                                        '&:hover': {
                                            backgroundColor: '#26944f',
                                            color: 'white',
                                        },
                                    }}
                                >
                                    {t('sendAnswers')}
                                </Button>
                            )}
                        </Box>
                        {isProcessing && <CircularProgress sx={{ mt: 4, color: "#26944f" }} />}
                        {evaluateAnswersMutation.isLoading && <CircularProgress sx={{ mt: 4, color: "#26944f" }} />}
                    </Box>
                </Box>
            }
        </>
    );
}

Component.displayName = 'PersonalTest';
