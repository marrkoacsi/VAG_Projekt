import React from 'react';

export default function Advertisement() {
  return (
    <div className="advertisement">
      <img 
        src="/images/advertisement.jpg" 
        alt="Hirdetés - VAG autók" 
        className="advertisement-image"
      />
      <div className="advertisement-contact">
        <p>Elérhetség:</p>
        <a href="mailto:vagtest@gmail.com" className="advertisement-email">
          vagtest@gmail.com
        </a>
      </div>
    </div>
  );
}
