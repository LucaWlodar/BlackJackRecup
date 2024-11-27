import React from 'react';
import './Card.css';

const Card = ({ card }) => {
    const image = card && card.image ? card.image : '/placeholder.png';
    const altText = card && card.value && card.suit ? `${card.value} of ${card.suit}` : 'Carta no disponible';

    return (
        <div className="card">
            <img src={image} alt={altText} />
        </div>
    );
};

export default Card;
