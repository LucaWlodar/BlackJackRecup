import React from 'react';
import Card from '../Card/Card';
import './Hand.css';

const Hand = ({ cards, revealed }) => {
    return (
        <div className="hand">
            {cards.map((card, index) => (
                <Card
                    key={index}
                    card={
                        revealed || index > 0
                            ? card
                            : { image: 'https://deckofcardsapi.com/static/img/back.png', value: 'Unknown', suit: 'Unknown' }
                    }
                />
            ))}
        </div>
    );
};

export default Hand;
