import React from 'react';
import './Controls.css';

const Controls = ({ drawCard, stand, gameOver, restartGame }) => {
    return (
        <div className="controls">
            {!gameOver ? (
                <>
                    <button onClick={drawCard} className="btn" disabled={gameOver}>
                        Pedir Carta
                    </button>
                    <button onClick={stand} className="btn" disabled={gameOver}>
                        Plantarse
                    </button>
                </>
            ) : (
                <button onClick={restartGame} className="btn">
                    Jugar de Nuevo
                </button>
            )}
        </div>
    );
};

export default Controls;
