import React from 'react'
import BracketView from './BracketView'

const BracketDemo = () => {
  // Data de ejemplo: 16 openings de anime
  const sampleOpenings = [
    { id: 1, title: 'Cruel Angel Thesis', anime: 'Neon Genesis Evangelion' },
    { id: 2, title: 'A Cruel Angel Thesis (TV Edit)', anime: 'Evangelion' },
    { id: 3, title: 'Unravel', anime: 'Tokyo Ghoul' },
    { id: 4, title: 'Paradisus -Paradoxus-', anime: 'Tokyo Ghoul:re' },
    { id: 5, title: 'Hacking to the Gate', anime: 'Steins;Gate' },
    { id: 6, title: 'Kuchizuke Diamond', anime: 'Steins;Gate Elite' },
    { id: 7, title: 'Sono Chi no Sadame', anime: 'JoJo\'s Bizarre Adventure' },
    { id: 8, title: 'Bloody Stream', anime: 'JoJo\'s Bizarre Adventure' },
    { id: 9, title: 'Renai Circulation', anime: 'Monogatari Series' },
    { id: 10, title: 'Platinum Disco', anime: 'Nisemonogatari' },
    { id: 11, title: 'Silhouette', anime: 'Naruto Shippuden' },
    { id: 12, title: 'Opening 16', anime: 'One Piece' },
    { id: 13, title: 'Tank!!', anime: 'Cowboy Bebop' },
    { id: 14, title: 'Oath Sign', anime: 'Fate/Zero' },
    { id: 15, title: 'Katanagatari', anime: 'Katanagatari' },
    { id: 16, title: 'Colors', anime: 'Code Geass' },
  ]

  return (
    <div className="w-full">
      <BracketView openings={sampleOpenings} />
    </div>
  )
}

export default BracketDemo
