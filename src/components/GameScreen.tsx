import { useDispatch, useSelector } from "react-redux";
import {
  endQuiz,
  finishQuiz,
  increaseUserScore,
  nextQuestion,
  startQuiz,
  startTimer,
} from "../redux/quizSlice";

import { RootState } from "../types/types";
import { useEffect, useState } from "react";
import axios from "axios";
import { removeQuot } from "../utils/removeQuot";
import Options from "./Options";

type Questions = {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

export default function GameScreen() {
  const dispatch = useDispatch();
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [wrongAnswer, setWrongAnswer] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Questions[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { category, questionIndex, userScore, timer } = useSelector(
    (state: RootState) => state.quiz
  );

  const URL =
    category === "GK"
      ? "https://opentdb.com/api.php?amount=10&category=9"
      : category === "BOOKS"
      ? "https://opentdb.com/api.php?amount=10&category=10"
      : "";

  useEffect(() => {
    const getQuestions = async () => {
      setIsLoading(true);
      try {
        const data = await axios.get(URL);
        setQuestions(data.data.results);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    getQuestions();
  }, [URL]);

  const handleEndGame = () => {
    dispatch(endQuiz());
  };
  const handleRestartGame = () => {
    dispatch(startQuiz());
    setIsPicked(false);
  };

  const handleCheckAnswer = (answer: number | string, index: number) => {
    if (answer === index) {
      dispatch(increaseUserScore(timer));
      setIsPicked(true);
    } else {
      setIsPicked(true);
      setWrongAnswer(index);
    }
  };

  const handleNextQuestion = () => {
    if (questions && questionIndex === questions.length - 1) {
      dispatch(finishQuiz());
      setWrongAnswer(null);
    } else {
      dispatch(nextQuestion());
      setWrongAnswer(null);
    }
  };

  useEffect(() => {
    if (questions && timer > 0) {
      const id = setInterval(() => {
        dispatch(startTimer());
      }, 1000);

      return () => clearInterval(id);
    }
  }, [dispatch, timer, questions]);

  useEffect(() => {
    setIsPicked(false);
  }, [questionIndex]);

  useEffect(() => {
    if (timer === 0) {
      handleNextQuestion();
    }
  });

  const setTimer = (timer: number) => {
    if (timer < 10) {
      return `0${timer}`;
    }
    return timer;
  };

  if(isLoading) return <h2>Loading...</h2>

  return (
    <div className="p-4 py-6 bg-darkBlue h-screen">
      <div className="flex justify-between items-center px-2 mb-8 lg:px-6">
        <div className="flex rounded-full h-8 w-8 lg: 16 lg:16 justify-center items-center border-2 border-cyan-500 text-slate-200">
          <h1 className="text-center font-base text-md lg:text-xl">
            {userScore}
          </h1>
        </div>
        {!isPicked && (
          <h1 className="text-center font-base text-xl lg:text-2xl text-red-600">
            00:{setTimer(timer)}
          </h1>
        )}
      </div>
      {questions && (
        <h1 className="text-center font-medium text-2xl font-serif text-slate-100 mt-8 mb-4 lg:text-4xl">
          {questionIndex + 1}){" "}
          {removeQuot(questions[questionIndex].question)}
        </h1>
      )}

      {questions && (
        <Options
          incorrectOptions={questions[questionIndex].incorrect_answers}
          correctOption={questions[questionIndex].correct_answer}
          isPicked={isPicked}
          wrongAnswer={wrongAnswer}
          handleCheckAnswer={handleCheckAnswer}
        />
      )}

      <div className="flex justify-center">
        <button
          className={
            !isPicked
              ? "py-2 p-8 text-white w-full max-w-sm lg:max-w-lg bg-gray-700 mt-4 rounded"
              : "py-2 px-8 bg-cyan-700 w-full max-w-sm lg:max-w-lg mt-4 text-white rounded"
          }
          onClick={handleNextQuestion}
          disabled={!isPicked}
        >
          {questions && questionIndex === questions.length - 1
            ? "Finish Quiz"
            : "Next Question"}
        </button>
      </div>
      <div className="p-2 grid grid-cols-2 gap-3 max-w-sm mx-auto lg:max-w-lg m-10">
        <button
          className="p-1 py-2 text-sm bg-red-700 text-white rounded"
          onClick={handleEndGame}
        >
          End Quiz
        </button>
        <button
          className=" p-1 text-sm px-4 bg-green-700 text-white rounded"
          onClick={handleRestartGame}
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
}
