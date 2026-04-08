import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizQuestion } from '../types';
import { cn } from '../lib/utils';

interface QuizProps {
  questions: QuizQuestion[];
}

export default function Quiz({ questions }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
      >
        <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-8">You scored {score} out of {questions.length}</p>
        
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-8">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const isWrong = isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group",
                  !isAnswered && (isSelected ? "border-blue-500 bg-blue-50" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"),
                  isAnswered && isCorrect && "border-green-500 bg-green-50",
                  isAnswered && isWrong && "border-red-500 bg-red-50",
                  isAnswered && !isSelected && !isCorrect && "border-slate-100 opacity-50"
                )}
              >
                <span className={cn(
                  "font-medium",
                  isAnswered && isCorrect ? "text-green-700" : isAnswered && isWrong ? "text-red-700" : "text-slate-700"
                )}>
                  {option}
                </span>
                
                {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {isAnswered && isWrong && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-6 p-4 rounded-xl text-sm",
                selectedOption === currentQuestion.correctAnswer ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              )}
            >
              <p className="font-semibold mb-1">
                {selectedOption === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
              </p>
              <p>{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-end">
          {!isAnswered ? (
            <button
              onClick={handleCheckAnswer}
              disabled={selectedOption === null}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next Question"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
