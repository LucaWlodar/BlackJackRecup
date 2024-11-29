import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameBoard from './gpcomponents/GameBoard/GameBoard'
import Header from './gpcomponents/Header/Header';
import BettingSection from './gpcomponents/BettingSection/BettingSection';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<GameBoard />} />
                <Route path="/bets" element={<BettingSection />} />
            </Routes>
        </Router>
    );
};

export default App;
