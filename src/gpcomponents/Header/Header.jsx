import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    const isInBetsPage = location.pathname === '/bets'; 

    const handleNavigation = () => {
        if (isInBetsPage) {
            navigate('/'); 
        } else {
            navigate('/bets'); 
        }
    };

    return (
        <header className="header">
            <h1>Blackjack Game</h1>
            <button className="navigation-button" onClick={handleNavigation}>
                {isInBetsPage ? 'Home' : 'Sección Apuestas'}
            </button>
        </header>
    );
};

export default Header;
