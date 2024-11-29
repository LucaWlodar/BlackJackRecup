import React from 'react';
import './BettingSection.css';
import background from './fotoapuesta.png'; 

const BettingSection = () => {
    return (
        <div 
            className="betting-section" 
            style={{ backgroundImage: `url(${background})` }} 
        >
            <center>
                <h1>🚨🚨👮LAS APUESTAS SON ILEGALES👮🚨🚨</h1>
            </center>
        </div>
    );
};

export default BettingSection;  
