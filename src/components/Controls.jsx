import React from 'react';
import './Controls.css';

const Controls = ({ drawCard, stand, gameOver }) => {
    return (
        <div className="controls">
            <button onClick={drawCard} className="btn" disabled={gameOver}>Pedir Carta</button>
            <button onClick={stand} className="btn" disabled={gameOver}>Plantarse</button>
        </div>
    );
};

export default Controls;
