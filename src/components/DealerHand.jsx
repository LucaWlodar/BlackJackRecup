import React from 'react';
import './Hand.css';

const DealerHand = ({ cards, revealed }) => {
    return (
        <div className="hand">
            {cards.map((card, index) => {
                if (index === 0 || revealed) {
                    return <img key={index} src={card.image} alt={card.code} className="card" />;
                }
                return <div key={index} className="card-back"></div>; 
            })}
        </div>
    );
};

export default DealerHand;
