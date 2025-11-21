import WordOfTheDayPoster from "./Components/WordOfTheDayPoster";
import { Route, Routes } from "react-router-dom";
const App = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/word-warriors"
          element={
            <WordOfTheDayPoster backgroundImageUrl={"/WORD WARRIORS LP.jpg"} />
          }
        />
      </Routes>
    </div>
  );
};

export default App;
