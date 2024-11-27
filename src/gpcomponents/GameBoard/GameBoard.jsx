import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hand from '../Hand/Hand';
import Controls from '../Controls/Controls';
import './GameBoard.css';

const calculateScore = (cards) => {
    let total = 0;
    let aces = 0;

    cards.forEach(card => {
        if (card.value === 'ACE') {
            aces += 1;
            total += 11;
        } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
            total += 10;
        } else {
            total += parseInt(card.value, 10);
        }
    });

    
    while (total > 21 && aces > 0) {
        total -= 10; 
        aces -= 1;
    }

    return total;
};

const GameBoard = () => {
    const [deckId, setDeckId] = useState(null);
    const [playerHands, setPlayerHands] = useState([]); 
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerRevealed, setDealerRevealed] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');
    const [deckCount, setDeckCount] = useState(1); 
    const [allHandsStand, setAllHandsStand] = useState(false); 

    useEffect(() => {
        initializeGame();
    }, [deckCount]); 

    const initializeGame = async () => {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=${deckCount}`);
        const deckId = response.data.deck_id;
        setDeckId(deckId);

        const drawResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${deckCount * 2 + 2}`);
        const cards = drawResponse.data.cards;

        
        const hands = [];
        for (let i = 0; i < deckCount; i++) {
            hands.push({
                playerCards: [cards[i * 2], cards[i * 2 + 1]],
                dealerCards: [cards[i * 2 + 2], cards[i * 2 + 3]],
                dealerRevealed: false,
                gameOver: false,
                message: '',
                stand: false, 
            });
        }

        setPlayerHands(hands);
        setDealerCards([cards[deckCount * 2], cards[deckCount * 2 + 1]]);
        setGameOver(false);
        setDealerRevealed(false);
        setMessage('');
        setAllHandsStand(false); 
    };

    const handleDeckCountChange = (event) => {
        setDeckCount(parseInt(event.target.value, 10));
    };

    const drawCard = async (index) => {
        if (playerHands[index].gameOver || playerHands[index].stand) return;

        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const newCard = response.data.cards[0];
        const newHands = [...playerHands];
        newHands[index].playerCards.push(newCard);
        setPlayerHands(newHands);
    };

    const stand = (index) => {
        const newHands = [...playerHands];
        newHands[index].stand = true;

      
        const allStand = newHands.every(hand => hand.stand);
        setAllHandsStand(allStand);

        setPlayerHands(newHands);
    };

    const dealerPlay = async () => {
        let dealerScore = calculateScore(dealerCards);
        let newCards = [...dealerCards];

        
        while (dealerScore <= 16) {
            const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const newCard = response.data.cards[0];
            newCards.push(newCard);
            dealerScore = calculateScore(newCards);
        }

        setDealerCards(newCards);
        setDealerRevealed(true);
        determineWinner(newCards);
    };

    const determineWinner = (finalDealerCards) => {
        let newHands = [...playerHands];

        newHands = newHands.map(hand => {
            const playerScore = calculateScore(hand.playerCards);
            const dealerScore = calculateScore(finalDealerCards);

            let resultMessage = '';
            if (playerScore > 21) {
                resultMessage = 'Te pasaste de 21. ¡Has perdido!';
            } else if (dealerScore > 21) {
                resultMessage = 'El dealer se pasó de 21. ¡Has ganado!';
            } else if (playerScore === dealerScore) {
                resultMessage = 'Es un empate.';
            } else if (playerScore > dealerScore) {
                resultMessage = '¡Has ganado!';
            } else {
                resultMessage = 'El dealer ha ganado.';
            }

            return { ...hand, message: resultMessage, gameOver: true };
        });

        setPlayerHands(newHands);
    };

    const getScoreDisplay = (cards) => {
        const total = calculateScore(cards);
        return total > 21 ? 'Se pasó' : total; 
    };

    return (
        <div className="game-board">
            
            <div className="deck-count">
                <label htmlFor="deck-count">Selecciona el número de barajas (1-8): </label>
                <input
                    type="number"
                    id="deck-count"
                    value={deckCount}
                    onChange={handleDeckCountChange}
                    min="1"
                    max="8"
                />
                <button onClick={initializeGame}>Volver A Repartir</button>
            </div>

            
            <Hand cards={dealerCards} revealed={dealerRevealed} />

           
            {playerHands.map((hand, index) => (
                <div key={index} className="player-hand">
                    <h3>Mano {index + 1}</h3>
                    <Hand cards={hand.playerCards} revealed />
                    <div className="controls">
                        <button onClick={() => drawCard(index)} disabled={hand.gameOver || hand.stand}>Sacar carta</button>
                        <button onClick={() => stand(index)} disabled={hand.gameOver || hand.stand}>Plantarse</button>
                    </div>
                    <p>{hand.message}</p>
                    <p>Puntaje: {getScoreDisplay(hand.playerCards)}</p>
                </div>
            ))}

           
            {allHandsStand && !dealerRevealed && (
                <button onClick={dealerPlay}>Revelar cartas del dealer</button>
            )}

            
            <p className="message">{message}</p>
        </div>
    );
};

export default GameBoard;
