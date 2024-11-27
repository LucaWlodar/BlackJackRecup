import React from 'react';
import Header from './gpcomponents/Header/Header';
import GameBoard from './gpcomponents/GameBoard/GameBoard';
import './App.css';

const App = () => {
    return (
        <div className="app">
            <Header />
            <GameBoard />
        </div>
    );
};

export default App;
