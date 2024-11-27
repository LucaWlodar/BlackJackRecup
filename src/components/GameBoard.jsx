import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlayerHand from './PlayerHand';
import DealerHand from './DealerHand';
import Controls from './Controls';
import './GameBoard.css';

// Función para calcular el puntaje de una mano
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

    // Ajustar el valor de los ases si el total excede 21
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
};

const GameBoard = () => {
    const [deckId, setDeckId] = useState(null);
    const [playerCards, setPlayerCards] = useState([]);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerRevealed, setDealerRevealed] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchNewDeck();
    }, []);

    const fetchNewDeck = async () => {
        try {
            const response = await axios.get('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1');
            setDeckId(response.data.deck_id);
            startGame(response.data.deck_id);
        } catch (error) {
            console.error('Error al obtener la baraja:', error);
        }
    };

    const startGame = async (deckId) => {
        try {
            const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`);
            const cards = response.data.cards;
            setPlayerCards([cards[0], cards[2]]);
            setDealerCards([cards[1], cards[3]]);
            setDealerRevealed(false);
            setGameOver(false);
            setMessage('');
        } catch (error) {
            console.error('Error al repartir cartas:', error);
        }
    };

    const drawCard = async () => {
        if (!deckId || gameOver) return;
        try {
            const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const newCard = response.data.cards[0];
            setPlayerCards((prevCards) => [...prevCards, newCard]);
        } catch (error) {
            console.error('Error al pedir carta:', error);
        }
    };

    const revealDealerCard = async () => {
        setDealerRevealed(true);
    
        let currentScore = calculateScore(dealerCards);
        
        // El dealer sigue pidiendo mientras tenga 16 o menos
        while (currentScore <= 16) {
            try {
                const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
                const newCard = response.data.cards[0];
                setDealerCards((prevCards) => {
                    const updatedCards = [...prevCards, newCard];
                    currentScore = calculateScore(updatedCards);
                    return updatedCards;
                });
            } catch (error) {
                console.error('Error al pedir carta al dealer:', error);
                break; // Si hay un error, se detiene el bucle
            }
        }
    
        determineWinner();
    };

    const determineWinner = () => {
        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(dealerCards);

        if (playerScore > 21) {
            setMessage('Te pasaste de 21. ¡Has perdido!');
        } else if (dealerScore > 21) {
            setMessage('El dealer se pasó de 21. ¡Has ganado!');
        } else if (playerScore > dealerScore) {
            setMessage('¡Has ganado!');
        } else if (playerScore < dealerScore) {
            setMessage('El dealer ha ganado.');
        } else {
            setMessage('Es un empate.');
        }
        setGameOver(true);
    };

    return (
        <div className="game-board">
            <h2>Tu mano:</h2>
            <PlayerHand cards={playerCards} />
            <h2>Mano del dealer:</h2>
            <DealerHand cards={dealerCards} revealed={dealerRevealed} />
            <Controls drawCard={drawCard} stand={revealDealerCard} gameOver={gameOver} />
            {gameOver && (
                <div>
                    <p className="message">{message}</p>
                    <button className="btn" onClick={fetchNewDeck}>Jugar de nuevo</button>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
