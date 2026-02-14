import React, { useState, useEffect } from 'react';
import { Heart, Club, Diamond, Spade, Users, Trophy, RotateCcw, Play, CheckCircle } from 'lucide-react';

// Suit icons mapping
const suitIcons = {
  Hearts: Heart,
  Clubs: Club,
  Diamonds: Diamond,
  Spades: Spade
};

const suitColors = {
  Hearts: '#DC2626',
  Clubs: '#1F2937',
  Diamonds: '#DC2626',
  Spades: '#1F2937'
};

const suitSymbols = {
  Hearts: '♥',
  Clubs: '♣',
  Diamonds: '♦',
  Spades: '♠'
};

function JudgementGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, trump-selection, bidding, playing, round-end, game-end
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(['']);
  
  // Round state
  const [currentRound, setCurrentRound] = useState(1);
  const [cardsThisRound, setCardsThisRound] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [firstBidderIndex, setFirstBidderIndex] = useState(0);
  const [trumpSuit, setTrumpSuit] = useState('Hearts');
  
  // Bidding and playing state
  const [bids, setBids] = useState([]);
  const [handsWon, setHandsWon] = useState([]);
  const [currentBidderIndex, setCurrentBidderIndex] = useState(0);
  const [biddingComplete, setBiddingComplete] = useState(false);
  
  // Scores
  const [roundScores, setRoundScores] = useState([]);
  const [cumulativeScores, setCumulativeScores] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('judgement-game-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setGamePhase(state.gamePhase || 'setup');
        setPlayers(state.players || []);
        setNumPlayers(state.numPlayers || 4);
        setPlayerNames(state.playerNames || ['']);
        setCurrentRound(state.currentRound || 1);
        setCardsThisRound(state.cardsThisRound || 0);
        setDealerIndex(state.dealerIndex || 0);
        setFirstBidderIndex(state.firstBidderIndex || 0);
        setTrumpSuit(state.trumpSuit || 'Hearts');
        setBids(state.bids || []);
        setHandsWon(state.handsWon || []);
        setCurrentBidderIndex(state.currentBidderIndex || 0);
        setBiddingComplete(state.biddingComplete || false);
        setRoundScores(state.roundScores || []);
        setCumulativeScores(state.cumulativeScores || []);
      } catch (e) {
        console.error('Failed to load saved game:', e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const state = {
      gamePhase,
      players,
      numPlayers,
      playerNames,
      currentRound,
      cardsThisRound,
      dealerIndex,
      firstBidderIndex,
      trumpSuit,
      bids,
      handsWon,
      currentBidderIndex,
      biddingComplete,
      roundScores,
      cumulativeScores
    };
    localStorage.setItem('judgement-game-state', JSON.stringify(state));
  }, [gamePhase, players, numPlayers, playerNames, currentRound, cardsThisRound, 
      dealerIndex, firstBidderIndex, trumpSuit, bids, handsWon, currentBidderIndex, 
      biddingComplete, roundScores, cumulativeScores]);

  // Calculate max cards per player
  const getMaxCardsPerPlayer = (numPlayers) => {
    return Math.floor(52 / numPlayers);
  };

  // Calculate total rounds
  const getTotalRounds = (numPlayers) => {
    return getMaxCardsPerPlayer(numPlayers);
  };

  // Get trump suit for a round (rotating pattern)
  const getDefaultTrumpSuit = (roundNum) => {
    const suits = ['Hearts', 'Clubs', 'Diamonds', 'Spades'];
    return suits[(roundNum - 1) % 4];
  };

  // Start the game
  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length < 2) {
      alert('Please enter at least 2 player names');
      return;
    }

    const maxCards = getMaxCardsPerPlayer(validNames.length);
    const initialPlayers = validNames.map(name => ({
      name: name.trim(),
      totalScore: 0
    }));

    setPlayers(initialPlayers);
    setCurrentRound(1);
    setCardsThisRound(maxCards);
    setDealerIndex(0);
    setFirstBidderIndex(1 % validNames.length);
    setTrumpSuit(getDefaultTrumpSuit(1));
    setCumulativeScores(new Array(validNames.length).fill(0));
    setRoundScores([]);
    setGamePhase('trump-selection');
  };

  // Confirm trump and start bidding
  const confirmTrump = () => {
    setBids(new Array(players.length).fill(null));
    setCurrentBidderIndex(firstBidderIndex);
    setBiddingComplete(false);
    setGamePhase('bidding');
  };

  // Handle bid
  const submitBid = (bid) => {
    const newBids = [...bids];
    newBids[currentBidderIndex] = bid;
    setBids(newBids);

    // Check if all bids are in
    if (newBids.every(b => b !== null)) {
      setBiddingComplete(true);
    } else {
      // Move to next bidder
      setCurrentBidderIndex((currentBidderIndex + 1) % players.length);
    }
  };

  // Edit a bid
  const editBid = (playerIdx) => {
    const newBids = [...bids];
    newBids[playerIdx] = null;
    setBids(newBids);
    setBiddingComplete(false);
    setCurrentBidderIndex(playerIdx);
  };

  // Start the round after bidding review
  const startRound = () => {
    setHandsWon(new Array(players.length).fill(null));
    setGamePhase('playing');
  };

  // Calculate forbidden bid for last player
  const getForbiddenBid = () => {
    const bidsCount = bids.filter(b => b !== null).length;
    if (bidsCount === players.length - 1) {
      const sumSoFar = bids.reduce((sum, b) => sum + (b || 0), 0);
      const forbidden = cardsThisRound - sumSoFar;
      if (forbidden >= 0 && forbidden <= cardsThisRound) {
        return forbidden;
      }
    }
    return null;
  };

  // Handle hands won entry
  const submitHandsWon = (playerIdx, hands) => {
    const newHandsWon = [...handsWon];
    newHandsWon[playerIdx] = hands;
    setHandsWon(newHandsWon);

    // Check if all hands are entered
    if (newHandsWon.every(h => h !== null)) {
      calculateRoundScores(newHandsWon);
    }
  };

  // Calculate scores for the round
  const calculateRoundScores = (handsWonData) => {
    const newRoundScores = players.map((player, idx) => {
      const bid = bids[idx];
      const won = handsWonData[idx];
      
      if (bid === won) {
        return 10 + won;
      } else {
        return 0;
      }
    });

    const newCumulativeScores = cumulativeScores.map((score, idx) => 
      score + newRoundScores[idx]
    );

    setRoundScores([...roundScores, newRoundScores]);
    setCumulativeScores(newCumulativeScores);
    setGamePhase('round-end');
  };

  // Start next round
  const nextRound = () => {
    const nextRoundNum = currentRound + 1;
    const maxCards = getMaxCardsPerPlayer(players.length);
    const nextCards = maxCards - (currentRound % maxCards);
    
    if (nextCards < 1 || currentRound >= getTotalRounds(players.length)) {
      setGamePhase('game-end');
      return;
    }

    setCurrentRound(nextRoundNum);
    setCardsThisRound(nextCards);
    setDealerIndex((dealerIndex + 1) % players.length);
    setFirstBidderIndex((dealerIndex + 2) % players.length);
    setTrumpSuit(getDefaultTrumpSuit(nextRoundNum));
    setGamePhase('trump-selection');
  };

  // Reset game
  const resetGame = () => {
    if (confirm('Are you sure you want to start a new game? Current progress will be lost.')) {
      localStorage.removeItem('judgement-game-state');
      setGamePhase('setup');
      setPlayers([]);
      setPlayerNames(['']);
      setNumPlayers(4);
      setCurrentRound(1);
      setCumulativeScores([]);
      setRoundScores([]);
    }
  };

  // Setup phase
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:wght@600;700&family=Fredoka:wght@400;500;600&family=Poppins:wght@400;600;700&display=swap');
          
          body {
            font-family: 'Poppins', sans-serif;
          }
          
          .felt-texture {
            background-image: 
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 2px
              ),
              repeating-linear-gradient(
                0deg,
                rgba(0, 0, 0, 0.03) 0px,
                rgba(0, 0, 0, 0.03) 1px,
                transparent 1px,
                transparent 2px
              );
          }
          
          .card-shadow {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 
                        0 2px 4px -1px rgba(0, 0, 0, 0.2),
                        inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
          }
          
          .gold-glow {
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.3),
                        0 0 40px rgba(251, 191, 36, 0.2);
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          .float-animation {
            animation: float 3s ease-in-out infinite;
          }
        `}</style>

        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 float-animation">
            <div className="flex justify-center gap-4 mb-4">
              <Heart className="w-12 h-12 text-red-500" fill="currentColor" />
              <Club className="w-12 h-12 text-gray-900" fill="currentColor" />
              <Diamond className="w-12 h-12 text-red-500" fill="currentColor" />
              <Spade className="w-12 h-12 text-gray-900" fill="currentColor" />
            </div>
            <h1 className="text-6xl font-bold text-amber-400 mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
              Judgement
            </h1>
            <p className="text-green-200 text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Kachuful Score Tracker
            </p>
          </div>

          {/* Setup Card */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-green-700" />
              <h2 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Game Setup
              </h2>
            </div>

            {/* Number of Players */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Players
              </label>
              <input
                type="number"
                min="2"
                max="13"
                value={numPlayers}
                onChange={(e) => {
                  const num = parseInt(e.target.value) || 2;
                  setNumPlayers(num);
                  setPlayerNames(Array(num).fill(''));
                }}
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-600 mt-2">
                Max cards per player: {getMaxCardsPerPlayer(numPlayers)} | Total rounds: {getTotalRounds(numPlayers)}
              </p>
            </div>

            {/* Player Names */}
            <div className="space-y-3 mb-8">
              <label className="block text-sm font-medium text-gray-700">
                Player Names
              </label>
              {Array(numPlayers).fill(0).map((_, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Player ${idx + 1}`}
                  value={playerNames[idx] || ''}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[idx] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{ fontFamily: "'Fredoka', sans-serif" }}
                />
              ))}
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 gold-glow"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Trump Selection Phase
  if (gamePhase === 'trump-selection') {
    const SuitIcon = suitIcons[trumpSuit];
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                  Round {currentRound} of {getTotalRounds(players.length)}
                </h2>
                <p className="text-gray-600 mt-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {cardsThisRound} {cardsThisRound === 1 ? 'card' : 'cards'} per player
                </p>
              </div>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                <RotateCcw className="w-4 h-4" />
                New Game
              </button>
            </div>
          </div>

          {/* Trump Selection */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                Dealer: {players[dealerIndex].name}
              </h3>
              <p className="text-gray-600">Select the trump suit for this round</p>
            </div>

            {/* Current Trump */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-50 border-4 border-amber-400 rounded-2xl p-8 inline-flex flex-col items-center">
                <SuitIcon 
                  className="w-24 h-24 mb-4" 
                  style={{ color: suitColors[trumpSuit] }}
                  fill="currentColor"
                />
                <p className="text-3xl font-bold" style={{ fontFamily: "'Crimson Text', serif", color: suitColors[trumpSuit] }}>
                  {trumpSuit}
                </p>
              </div>
            </div>

            {/* Trump Selection Buttons */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {['Hearts', 'Clubs', 'Diamonds', 'Spades'].map((suit) => {
                const Icon = suitIcons[suit];
                return (
                  <button
                    key={suit}
                    onClick={() => setTrumpSuit(suit)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      trumpSuit === suit
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <Icon 
                      className="w-12 h-12 mx-auto mb-2" 
                      style={{ color: suitColors[suit] }}
                      fill="currentColor"
                    />
                    <p className="text-sm font-medium text-gray-700">{suit}</p>
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            <button
              onClick={confirmTrump}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Trump & Start Bidding
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Bidding Phase
  if (gamePhase === 'bidding') {
    const forbiddenBid = getForbiddenBid();
    const bidsCount = bids.filter(b => b !== null).length;
    const isLastBidder = bidsCount === players.length - 1;
    
    // Show review screen when all bids are in
    if (biddingComplete) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                    Round {currentRound} - Review Bids
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-600">Trump:</span>
                    {React.createElement(suitIcons[trumpSuit], {
                      className: "w-5 h-5",
                      style: { color: suitColors[trumpSuit] },
                      fill: "currentColor"
                    })}
                    <span className="font-medium" style={{ color: suitColors[trumpSuit] }}>
                      {suitSymbols[trumpSuit]} {trumpSuit}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Cards this round</p>
                  <p className="text-3xl font-bold text-green-700">{cardsThisRound}</p>
                </div>
              </div>
            </div>

            {/* All Bids Review */}
            <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                All Bids - Review & Edit
              </h3>
              
              <div className="space-y-3 mb-6">
                {players.map((player, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border-2 border-green-300 bg-green-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-lg text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {idx === firstBidderIndex && '(First bidder)'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-green-700">
                        {bids[idx]}
                      </span>
                      <button
                        onClick={() => editBid(idx)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                <p className="text-blue-800 font-semibold text-center">
                  Total Bids: {bids.reduce((sum, b) => sum + b, 0)} | Cards: {cardsThisRound}
                  {bids.reduce((sum, b) => sum + b, 0) === cardsThisRound && ' ⚠️ (Sum equals tricks)'}
                </p>
              </div>

              <button
                onClick={startRound}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                <Play className="w-5 h-5" />
                Start Round
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                  Round {currentRound} - Bidding
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">Trump:</span>
                  {React.createElement(suitIcons[trumpSuit], {
                    className: "w-5 h-5",
                    style: { color: suitColors[trumpSuit] },
                    fill: "currentColor"
                  })}
                  <span className="font-medium" style={{ color: suitColors[trumpSuit] }}>
                    {suitSymbols[trumpSuit]} {trumpSuit}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cards this round</p>
                <p className="text-3xl font-bold text-green-700">{cardsThisRound}</p>
              </div>
            </div>
          </div>

          {/* Current Bidder */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Current Bidder</p>
              <h3 className="text-4xl font-bold text-green-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {players[currentBidderIndex].name}
              </h3>
              {isLastBidder && forbiddenBid !== null && (
                <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">
                    ⚠️ Cannot bid {forbiddenBid} (sum cannot equal {cardsThisRound})
                  </p>
                </div>
              )}
            </div>

            {/* Bid Buttons */}
            <div className="grid grid-cols-7 gap-3">
              {Array(cardsThisRound + 1).fill(0).map((_, idx) => {
                const isForbidden = isLastBidder && idx === forbiddenBid;
                return (
                  <button
                    key={idx}
                    onClick={() => !isForbidden && submitBid(idx)}
                    disabled={isForbidden}
                    className={`py-4 rounded-xl font-bold text-xl transition-all ${
                      isForbidden
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                        : 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white card-shadow hover:scale-105'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {idx}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bids So Far */}
          <div className="bg-white/95 rounded-2xl p-6 card-shadow felt-texture">
            <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Bids So Far
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {players.map((player, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${
                    bids[idx] !== null
                      ? 'border-green-300 bg-green-50'
                      : idx === currentBidderIndex
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-sm text-gray-600 truncate">{player.name}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {bids[idx] !== null ? bids[idx] : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing Phase
  if (gamePhase === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Crimson Text', serif" }}>
                  Round {currentRound} - Results
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-600">Trump:</span>
                  {React.createElement(suitIcons[trumpSuit], {
                    className: "w-5 h-5",
                    style: { color: suitColors[trumpSuit] },
                    fill: "currentColor"
                  })}
                  <span className="font-medium" style={{ color: suitColors[trumpSuit] }}>
                    {suitSymbols[trumpSuit]} {trumpSuit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enter Hands Won */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Enter Hands Won
            </h3>

            <div className="space-y-4">
              {players.map((player, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-semibold text-lg text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {player.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Bid: <span className="font-bold text-green-700">{bids[idx]}</span>
                      </p>
                    </div>
                    {handsWon[idx] !== null && (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {Array(cardsThisRound + 1).fill(0).map((_, count) => (
                      <button
                        key={count}
                        onClick={() => submitHandsWon(idx, count)}
                        className={`py-3 rounded-lg font-semibold transition-all ${
                          handsWon[idx] === count
                            ? 'bg-green-600 text-white card-shadow scale-105'
                            : 'bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {handsWon.every(h => h !== null) && (
              <div className="mt-6 bg-amber-50 border-2 border-amber-400 rounded-xl p-4 text-center">
                <p className="text-amber-800 font-semibold">
                  ✓ All results recorded! Calculating scores...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Round End Phase
  if (gamePhase === 'round-end') {
    const lastRoundScores = roundScores[roundScores.length - 1];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture">
            <h2 className="text-3xl font-bold text-gray-800 text-center" style={{ fontFamily: "'Crimson Text', serif" }}>
              Round {currentRound} Complete!
            </h2>
          </div>

          {/* Round Results */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Round Scores
            </h3>

            <div className="space-y-3">
              {players.map((player, idx) => {
                const bid = bids[idx];
                const won = handsWon[idx];
                const score = lastRoundScores[idx];
                const success = bid === won;

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      success
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-semibold text-lg text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                          {player.name}
                        </p>
                        <p className={`text-sm font-medium ${success ? 'text-green-700' : 'text-red-700'}`}>
                          Bid: {bid} | Won: {won} {success ? '✓' : '❌'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${success ? 'text-green-700' : 'text-red-600'}`}>
                          {success ? `+${score}` : score}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total: {cumulativeScores[idx]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Standings */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              <Trophy className="w-6 h-6 text-amber-500" />
              Current Standings
            </h3>

            <div className="space-y-2">
              {players
                .map((player, idx) => ({ ...player, score: cumulativeScores[idx], idx }))
                .sort((a, b) => b.score - a.score)
                .map((player, rank) => (
                  <div 
                    key={player.idx}
                    className={`p-4 rounded-xl flex justify-between items-center ${
                      rank === 0
                        ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${rank === 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                        #{rank + 1}
                      </span>
                      <span className="font-semibold text-lg text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {player.name}
                      </span>
                    </div>
                    <span className={`text-3xl font-bold ${rank === 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                      {player.score}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Next Round Button */}
          <button
            onClick={nextRound}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            {currentRound < getTotalRounds(players.length) ? (
              <>
                <Play className="w-5 h-5" />
                Next Round
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                View Final Results
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Game End Phase
  if (gamePhase === 'game-end') {
    const winner = players
      .map((player, idx) => ({ ...player, score: cumulativeScores[idx], idx }))
      .sort((a, b) => b.score - a.score)[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Winner Announcement */}
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-8 mb-6 card-shadow gold-glow text-center">
            <Trophy className="w-20 h-20 text-white mx-auto mb-4 float-animation" />
            <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: "'Crimson Text', serif" }}>
              Game Over!
            </h1>
            <p className="text-amber-100 text-lg mb-4">Winner</p>
            <p className="text-6xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {winner.name}
            </p>
            <p className="text-3xl text-amber-100 mt-2">
              {winner.score} points
            </p>
          </div>

          {/* Final Standings */}
          <div className="bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Final Standings
            </h2>

            <div className="space-y-3">
              {players
                .map((player, idx) => ({ ...player, score: cumulativeScores[idx], idx }))
                .sort((a, b) => b.score - a.score)
                .map((player, rank) => (
                  <div 
                    key={player.idx}
                    className={`p-5 rounded-xl flex justify-between items-center ${
                      rank === 0
                        ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-4 border-amber-400'
                        : rank === 1
                        ? 'bg-gray-100 border-2 border-gray-400'
                        : rank === 2
                        ? 'bg-orange-50 border-2 border-orange-300'
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-3xl font-bold ${
                        rank === 0 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        #{rank + 1}
                      </span>
                      <span className={`font-semibold text-xl ${
                        rank === 0 ? 'text-amber-800' : 'text-gray-800'
                      }`} style={{ fontFamily: "'Fredoka', sans-serif" }}>
                        {player.name}
                      </span>
                    </div>
                    <span className={`text-4xl font-bold ${
                      rank === 0 ? 'text-amber-700' : 'text-gray-700'
                    }`}>
                      {player.score}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* New Game Button */}
          <button
            onClick={resetGame}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            <RotateCcw className="w-5 h-5" />
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  return null;
}
