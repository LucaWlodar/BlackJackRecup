import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hand from '../Hand/Hand';
import './GameBoard.css';

const calculateScore = (cards) => {
    if (!cards || cards.length === 0) return { min: 0, max: 0 };

    let total = 0;
    let aces = 0;

    cards.forEach(card => {
        if (!card || !card.value) return;

        if (card.value === 'ACE') {
            aces += 1;
            total += 11;
        } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
            total += 10;
        } else {
            total += parseInt(card.value, 10);
        }
    });

    const minScore = total - (aces * 10);
    const maxScore = total;

    return { min: minScore, max: maxScore };
};

const GameBoard = () => {
    const [deckId, setDeckId] = useState(null);
    const [dealerCards, setDealerCards] = useState([]);
    const [dealerRevealed, setDealerRevealed] = useState(false);
    const [numPlayers, setNumPlayers] = useState(1); 
    const [playerStates, setPlayerStates] = useState([]);
    const [allHandsStand, setAllHandsStand] = useState(false);

    useEffect(() => {
        initializeGame();
    }, [numPlayers]);

    const initializeGame = async (resetPlayers = false) => {
        try {
            if (resetPlayers) {
                setNumPlayers(1); 
            }

            const response = await axios.get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`);
            const deckId = response.data.deck_id;
            setDeckId(deckId);

            const dealerCardsResponse = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`);
            setDealerCards(dealerCardsResponse.data.cards);

            const players = Array.from({ length: resetPlayers ? 1 : numPlayers }, () => ({
                deckCount: 1,
                hands: [],
                allHandsStand: false,
            }));

            setPlayerStates(players);
            setDealerRevealed(false);
            setAllHandsStand(false);
        } catch (error) {
            console.error('Error inicializando el juego:', error);
        }
    };

    const handleNumPlayersChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value >= 1 && value <= 4) {
            setNumPlayers(value);
        }
    };

    const handleDeckCountChange = (playerIndex, value) => {
        const players = [...playerStates];
        players[playerIndex].deckCount = parseInt(value, 10);
        setPlayerStates(players);
    };

    const dealCardsForPlayer = async (playerIndex) => {
        const { deckCount } = playerStates[playerIndex];
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${deckCount * 2}`);
        const cards = response.data.cards;

        const hands = [];
        for (let i = 0; i < deckCount; i++) {
            hands.push({
                playerCards: [cards[i * 2], cards[i * 2 + 1]],
                stand: false,
                gameOver: false,
                message: '',
            });
        }

        const players = [...playerStates];
        players[playerIndex].hands = hands;
        setPlayerStates(players);
    };

    const drawCard = async (playerIndex, handIndex) => {
        const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
        const newCard = response.data.cards[0];

        const players = [...playerStates];
        players[playerIndex].hands[handIndex].playerCards.push(newCard);
        setPlayerStates(players);
    };

    const stand = (playerIndex, handIndex) => {
        const players = [...playerStates];
        players[playerIndex].hands[handIndex].stand = true;

        const allHandsStand = players.every(player =>
            player.hands.every(hand => hand.stand)
        );

        setPlayerStates(players);
        setAllHandsStand(allHandsStand);
    };

    const dealerPlay = async () => {
        let newCards = [...dealerCards];
        let dealerScore = calculateScore(newCards);
        let dealerMinScore = dealerScore.min;
        let dealerMaxScore = dealerScore.max;

        while (dealerMinScore <= 16 || (dealerMaxScore === 17 && dealerMinScore !== dealerMaxScore)) {
            const response = await axios.get(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`);
            const newCard = response.data.cards[0];
            newCards.push(newCard);

            dealerScore = calculateScore(newCards);
            dealerMinScore = dealerScore.min;
            dealerMaxScore = dealerScore.max;

            if (dealerMaxScore > 21) {
                dealerMaxScore = dealerMinScore;
            }
        }

        setDealerCards(newCards);
        setDealerRevealed(true);

        determineWinner(newCards);
    };

    const determineWinner = (finalDealerCards) => {
        const dealerScore = calculateScore(finalDealerCards).max;
        const dealerHasBlackjack = dealerScore === 21 && finalDealerCards.length === 2;
    
        const players = playerStates.map(player => ({
            ...player,
            hands: player.hands.map(hand => {
                const playerScore = calculateScore(hand.playerCards).max;
                const playerHasBlackjack = playerScore === 21 && hand.playerCards.length === 2;
    
                let resultMessage = '';
    
                if (playerHasBlackjack && dealerHasBlackjack) {
                    resultMessage = 'Empate. Ambos tienen Blackjack natural.';
                } else if (playerHasBlackjack) {
                    resultMessage = '¡Blackjack natural! ¡Has ganado!';
                } else if (dealerHasBlackjack) {
                    resultMessage = 'El dealer tiene Blackjack natural. ¡Has perdido!';
                } else if (playerScore > 21 && dealerScore > 21) {
                    resultMessage = 'Empate. Ambos se pasaron de 21.';
                } else if (playerScore > 21) {
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
            }),
        }));
    
        setPlayerStates(players);
    };

    const getDealerScore = () => {
        if (!dealerRevealed) {
            if (dealerCards.length > 0) {
                const visibleCard = dealerCards[1]; 
                if (visibleCard.value === 'ACE') {
                    return '1 / 11'; 
                }
                const visibleScore = calculateScore([visibleCard]);
                return `${visibleScore.min}`; 
            }
            return '0'; 
        }
        const { min, max } = calculateScore(dealerCards);
        return min !== max ? `${min} / ${max}` : `${min}`;
    };

    return (
        <div className="game-board">
            <div className="dealer-section">
                <h2>Dealer</h2>
                {dealerCards.length > 0 && (
                    <>
                        <Hand cards={dealerCards} revealed={dealerRevealed} />
                        <p>Puntaje del dealer: <strong>{getDealerScore()}</strong></p>
                    </>
                )}
            </div>

            <div className="players-section">
                <label htmlFor="num-players">Número de jugadores (1-4): </label>
                <input
                    type="number"
                    id="num-players"
                    value={numPlayers}
                    onChange={handleNumPlayersChange}
                    min="1"
                    max="4"
                />
                {playerStates.map((player, playerIndex) => (
                    <div key={playerIndex} className="player-section">
                        <h3>Jugador {playerIndex + 1}</h3>
                        <label>
                            Cantidad de barajas:
                            <input
                                type="number"
                                value={player.deckCount}
                                min="1"
                                max="8"
                                onChange={(e) => handleDeckCountChange(playerIndex, e.target.value)}
                            />
                        </label>
                        <button onClick={() => dealCardsForPlayer(playerIndex)}>Repartir Cartas</button>

                        {player.hands.map((hand, handIndex) => (
                            <div key={handIndex} className="hand-section">
                                <Hand cards={hand.playerCards} revealed />
                                <p>Puntaje: {calculateScore(hand.playerCards).min}</p>
                                <button
                                    onClick={() => drawCard(playerIndex, handIndex)}
                                    disabled={hand.stand || hand.gameOver}
                                >
                                    Sacar carta
                                </button>
                                <button
                                    onClick={() => stand(playerIndex, handIndex)}
                                    disabled={hand.stand || hand.gameOver}
                                >
                                    Plantarse
                                </button>
                                <p>{hand.message}</p>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {allHandsStand && !dealerRevealed && (
                <button onClick={dealerPlay}>Revelar Cartas del Dealer</button>
            )}

            {dealerRevealed && (
                <button className="reset-button" onClick={() => initializeGame(false)}>
                    Volver a Jugar
                </button>
            )}
        </div>
    );
};

export default GameBoard;
