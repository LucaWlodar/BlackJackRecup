import React from 'react';
import './Hand.css';

const PlayerHand = ({ cards }) => {
    return (
        <div className="hand">
            {cards.map((card, index) => (
                <img key={index} src={card.image} alt={card.code} className="card" />
            ))}
        </div>
    );
};

export default PlayerHand;
