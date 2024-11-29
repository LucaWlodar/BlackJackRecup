import React from 'react';
import './BettingSection.css';
import background from './fotoapuesta.png'; // Importamos la imagen para evitar rutas absolutas en CSS

const BettingSection = () => {
    return (
        <div 
            className="betting-section" 
            style={{ backgroundImage: `url(${background})` }} // La imagen se aplica aquí dinámicamente
        >
            <center>
                <h1>🚨🚨👮LAS APUESTAS SON ILEGALES👮🚨🚨</h1>
            </center>
        </div>
    );
};

export default BettingSection;  
