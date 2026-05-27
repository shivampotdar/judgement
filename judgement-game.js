// Use global React
const {
  useState,
  useEffect,
  createElement
} = React;

// Use global Lucide icons
const {
  Heart,
  Club,
  Diamond,
  Spade,
  Users,
  Trophy,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  Download
} = LucideReact;

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
const PLAYER_EMOJIS = ['🚗', '🚲', '🚀', '🚁', '🚜', '🏎️', '🚢', '🚂', '🌳', '🌴', '🌵', '🌻', '🍁', '🍄', '🌞', '🌙', '⭐', '☁️', '🌊', '🌋', '🎈', '🎨', '🍕', '🍦'];
function JudgementGame() {
  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, trump-selection, bidding, playing, round-end, game-end
  const [players, setPlayers] = useState([]);
  const [numPlayers, setNumPlayers] = useState(4);
  const [playerNames, setPlayerNames] = useState(['', '', '', '']);
  const [startingCards, setStartingCards] = useState(13);

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

  // PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const {
      outcome
    } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('judgement-game-state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setGamePhase(state.gamePhase || 'setup');
        setPlayers(state.players || []);
        setNumPlayers(state.numPlayers || 4);
        setPlayerNames(state.playerNames || ['', '', '', '']);
        setStartingCards(state.startingCards || 13);
        setCurrentRound(state.currentRound || 1);
        setCardsThisRound(state.cardsThisRound || getMaxCardsPerPlayer(state.numPlayers || 4));
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
      startingCards,
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
  }, [gamePhase, players, numPlayers, playerNames, currentRound, cardsThisRound, dealerIndex, firstBidderIndex, trumpSuit, bids, handsWon, currentBidderIndex, biddingComplete, roundScores, cumulativeScores]);

  // Calculate max cards per player
  const getMaxCardsPerPlayer = numPlayers => {
    return Math.floor(52 / numPlayers);
  };

  // Calculate total rounds
  const getTotalRounds = numPlayers => {
    return startingCards || getMaxCardsPerPlayer(numPlayers);
  };

  // Get trump suit for a round (rotating pattern)
  const getDefaultTrumpSuit = roundNum => {
    const suits = ['Hearts', 'Clubs', 'Diamonds', 'Spades'];
    return suits[(roundNum - 1) % 4];
  };

  // Start the game
  const startGame = () => {
    const playersCount = parseInt(numPlayers);
    const startCards = parseInt(startingCards);
    if (isNaN(playersCount) || playersCount < 2 || playersCount > 10) {
      alert('Please enter between 2 and 10 players');
      return;
    }
    if (isNaN(startCards) || startCards < 1 || startCards > getMaxCardsPerPlayer(playersCount)) {
      alert(`Please enter between 1 and ${getMaxCardsPerPlayer(playersCount)} starting cards`);
      return;
    }
    const validNames = playerNames.filter(name => name && name.trim() !== '');
    if (validNames.length !== playersCount) {
      alert(`Please enter names for all ${playersCount} players`);
      return;
    }
    const initialPlayers = validNames.map((name, idx) => {
      // Pick a random emoji from the list, ensuring uniqueness if possible
      const emojiPool = [...PLAYER_EMOJIS];
      const randomIdx = Math.floor(Math.random() * (emojiPool.length - idx));
      const emoji = emojiPool.splice(randomIdx, 1)[0];
      return {
        name: name.trim(),
        emoji: emoji || '👤',
        totalScore: 0
      };
    });
    setPlayers(initialPlayers);
    setCurrentRound(1);
    setCardsThisRound(startingCards);
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
  const submitBid = bid => {
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
  const editBid = playerIdx => {
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
  const calculateRoundScores = handsWonData => {
    const newRoundScores = players.map((player, idx) => {
      const bid = bids[idx];
      const won = handsWonData[idx];
      if (bid === won) {
        return 10 + won;
      } else {
        return 0;
      }
    });
    const newCumulativeScores = cumulativeScores.map((score, idx) => score + newRoundScores[idx]);
    setRoundScores([...roundScores, newRoundScores]);
    setCumulativeScores(newCumulativeScores);
    setGamePhase('round-end');
  };

  // Start next round
  const nextRound = () => {
    const nextRoundNum = currentRound + 1;
    const nextCards = startingCards - currentRound % startingCards;
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
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-2xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center mb-12 float-animation"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center gap-4 mb-4"
    }, /*#__PURE__*/React.createElement(Heart, {
      className: "w-12 h-12 text-red-500",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement(Club, {
      className: "w-12 h-12 text-gray-900",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement(Diamond, {
      className: "w-12 h-12 text-red-500",
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement(Spade, {
      className: "w-12 h-12 text-gray-900",
      fill: "currentColor"
    })), /*#__PURE__*/React.createElement("h1", {
      className: "text-6xl font-bold text-amber-400 mb-2",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Judgement"), /*#__PURE__*/React.createElement("p", {
      className: "text-green-200 text-lg",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Vibe Coded by SP")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 mb-6"
    }, /*#__PURE__*/React.createElement(Users, {
      className: "w-6 h-6 text-green-700"
    }), /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-semibold text-gray-800",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Game Setup")), /*#__PURE__*/React.createElement("div", {
      className: "mb-6"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-medium text-gray-700 mb-2"
    }, "Number of Players (2-10)"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "2",
      max: "10",
      value: numPlayers,
      onChange: e => {
        const val = e.target.value;
        if (val === '') {
          setNumPlayers('');
          return;
        }
        let num = parseInt(val);
        if (isNaN(num)) return;
        if (num > 10) num = 10;
        // Allow 0 or 1 while typing, but startGame will validate
        setNumPlayers(num);
        if (num >= 2) {
          setPlayerNames(Array(num).fill(''));
          setStartingCards(getMaxCardsPerPlayer(num));
        }
      },
      className: "w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    })), /*#__PURE__*/React.createElement("div", {
      className: "mb-6"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-medium text-gray-700 mb-2"
    }, "Starting Cards ", numPlayers >= 2 ? `(1-${getMaxCardsPerPlayer(numPlayers)})` : ''), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "1",
      max: numPlayers >= 2 ? getMaxCardsPerPlayer(numPlayers) : 52,
      value: startingCards,
      onChange: e => {
        const val = e.target.value;
        if (val === '') {
          setStartingCards('');
          return;
        }
        let num = parseInt(val);
        if (isNaN(num)) return;
        const max = numPlayers >= 2 ? getMaxCardsPerPlayer(numPlayers) : 52;
        if (num > max) num = max;
        setStartingCards(num);
      },
      className: "w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mt-2"
    }, "Total rounds in this game: ", startingCards || 0)), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3 mb-8"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-sm font-medium text-gray-700"
    }, "Player Names"), Array(numPlayers).fill(0).map((_, idx) => /*#__PURE__*/React.createElement("input", {
      key: idx,
      type: "text",
      placeholder: `Player ${idx + 1}`,
      value: playerNames[idx] || '',
      onChange: e => {
        const newNames = [...playerNames];
        newNames[idx] = e.target.value;
        setPlayerNames(newNames);
      },
      className: "w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }))), /*#__PURE__*/React.createElement("button", {
      onClick: startGame,
      className: "w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 gold-glow mb-4",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(Play, {
      className: "w-5 h-5"
    }), "Start Game"), installPrompt && /*#__PURE__*/React.createElement("button", {
      onClick: handleInstall,
      className: "w-full bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(Download, {
      className: "w-5 h-5"
    }), "Install App for Offline Use"))));
  }

  // Trump Selection Phase
  if (gamePhase === 'trump-selection') {
    const SuitIcon = suitIcons[trumpSuit];
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-4xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "text-3xl font-bold text-gray-800",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Round ", currentRound, " of ", getTotalRounds(players.length)), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600 mt-1",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, cardsThisRound, " ", cardsThisRound === 1 ? 'card' : 'cards', " per player")), /*#__PURE__*/React.createElement("button", {
      onClick: resetGame,
      className: "px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(RotateCcw, {
      className: "w-4 h-4"
    }), "New Game"))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center mb-8"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-semibold text-gray-800 mb-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Dealer: ", players[dealerIndex].emoji, " ", players[dealerIndex].name), /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600"
    }, "Select the trump suit for this round")), /*#__PURE__*/React.createElement("div", {
      className: "flex justify-center mb-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gray-50 border-4 border-amber-400 rounded-2xl p-8 inline-flex flex-col items-center"
    }, /*#__PURE__*/React.createElement(SuitIcon, {
      className: "w-24 h-24 mb-4",
      style: {
        color: suitColors[trumpSuit]
      },
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-3xl font-bold",
      style: {
        fontFamily: "'Crimson Text', serif",
        color: suitColors[trumpSuit]
      }
    }, trumpSuit))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-4 gap-4 mb-8"
    }, ['Hearts', 'Clubs', 'Diamonds', 'Spades'].map(suit => {
      const Icon = suitIcons[suit];
      return /*#__PURE__*/React.createElement("button", {
        key: suit,
        onClick: () => setTrumpSuit(suit),
        className: `p-4 rounded-xl border-2 transition-all ${trumpSuit === suit ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-white hover:border-gray-400'}`
      }, /*#__PURE__*/React.createElement(Icon, {
        className: "w-12 h-12 mx-auto mb-2",
        style: {
          color: suitColors[suit]
        },
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("p", {
        className: "text-sm font-medium text-gray-700"
      }, suit));
    })), /*#__PURE__*/React.createElement("button", {
      onClick: confirmTrump,
      className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(CheckCircle, {
      className: "w-5 h-5"
    }), "Confirm Trump & Start Bidding"))));
  }

  // Bidding Phase
  if (gamePhase === 'bidding') {
    const forbiddenBid = getForbiddenBid();
    const bidsCount = bids.filter(b => b !== null).length;
    const isLastBidder = bidsCount === players.length - 1;

    // Show review screen when all bids are in
    if (biddingComplete) {
      return /*#__PURE__*/React.createElement("div", {
        className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
      }, /*#__PURE__*/React.createElement("div", {
        className: "max-w-4xl mx-auto"
      }, /*#__PURE__*/React.createElement("div", {
        className: "bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
        className: "text-3xl font-bold text-gray-800",
        style: {
          fontFamily: "'Crimson Text', serif"
        }
      }, "Round ", currentRound, " - Review Bids"), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 mt-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-gray-600"
      }, "Trump:"), createElement(suitIcons[trumpSuit], {
        className: "w-5 h-5",
        style: {
          color: suitColors[trumpSuit]
        },
        fill: "currentColor"
      }), /*#__PURE__*/React.createElement("span", {
        className: "font-medium",
        style: {
          color: suitColors[trumpSuit]
        }
      }, suitSymbols[trumpSuit], " ", trumpSuit))), /*#__PURE__*/React.createElement("div", {
        className: "text-right"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600"
      }, "Cards this round"), /*#__PURE__*/React.createElement("p", {
        className: "text-3xl font-bold text-green-700"
      }, cardsThisRound)))), /*#__PURE__*/React.createElement("div", {
        className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6"
      }, /*#__PURE__*/React.createElement("h3", {
        className: "text-2xl font-semibold text-gray-800 mb-6",
        style: {
          fontFamily: "'Fredoka', sans-serif"
        }
      }, "All Bids - Review & Edit"), /*#__PURE__*/React.createElement("div", {
        className: "space-y-3 mb-6"
      }, players.map((player, idx) => /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "p-4 rounded-xl border-2 border-green-300 bg-green-50 flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
        className: "font-semibold text-lg text-gray-800",
        style: {
          fontFamily: "'Fredoka', sans-serif"
        }
      }, player.emoji, " ", player.name), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600"
      }, idx === firstBidderIndex && '(First bidder)')), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-3xl font-bold text-green-700"
      }, bids[idx]), /*#__PURE__*/React.createElement("button", {
        onClick: () => editBid(idx),
        className: "px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
      }, "Edit"))))), /*#__PURE__*/React.createElement("div", {
        className: "bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-blue-800 font-semibold text-center"
      }, "Total Bids: ", bids.reduce((sum, b) => sum + b, 0), " | Cards: ", cardsThisRound, bids.reduce((sum, b) => sum + b, 0) === cardsThisRound && ' ⚠️ (Sum equals tricks)')), /*#__PURE__*/React.createElement("button", {
        onClick: startRound,
        className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2",
        style: {
          fontFamily: "'Fredoka', sans-serif"
        }
      }, /*#__PURE__*/React.createElement(Play, {
        className: "w-5 h-5"
      }), "Start Round"))));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-4xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "text-3xl font-bold text-gray-800",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Round ", currentRound, " - Bidding"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-gray-600"
    }, "Trump:"), createElement(suitIcons[trumpSuit], {
      className: "w-5 h-5",
      style: {
        color: suitColors[trumpSuit]
      },
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("span", {
      className: "font-medium",
      style: {
        color: suitColors[trumpSuit]
      }
    }, suitSymbols[trumpSuit], " ", trumpSuit))), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600"
    }, "Cards this round"), /*#__PURE__*/React.createElement("p", {
      className: "text-3xl font-bold text-green-700"
    }, cardsThisRound)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center mb-6"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-gray-600 mb-2"
    }, "Current Bidder"), /*#__PURE__*/React.createElement("h3", {
      className: "text-4xl font-bold text-green-700",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, players[currentBidderIndex].emoji, " ", players[currentBidderIndex].name), isLastBidder && forbiddenBid !== null && /*#__PURE__*/React.createElement("div", {
      className: "mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-red-700 font-semibold"
    }, "\u26A0\uFE0F Cannot bid ", forbiddenBid, " (sum cannot equal ", cardsThisRound, ")"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-7 gap-3"
    }, Array(cardsThisRound + 1).fill(0).map((_, idx) => {
      const isForbidden = isLastBidder && idx === forbiddenBid;
      return /*#__PURE__*/React.createElement("button", {
        key: idx,
        onClick: () => !isForbidden && submitBid(idx),
        disabled: isForbidden,
        className: `py-4 rounded-xl font-bold text-xl transition-all ${isForbidden ? 'bg-gray-200 text-gray-400 cursor-not-allowed line-through' : 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white card-shadow hover:scale-105'}`,
        style: {
          fontFamily: "'Poppins', sans-serif"
        }
      }, idx);
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-6 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-lg font-semibold text-gray-800 mb-4",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Bids So Far"), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    }, players.map((player, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: `p-3 rounded-lg border-2 ${bids[idx] !== null ? 'border-green-300 bg-green-50' : idx === currentBidderIndex ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50'}`
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 truncate"
    }, player.emoji, " ", player.name), /*#__PURE__*/React.createElement("p", {
      className: "text-2xl font-bold text-gray-800"
    }, bids[idx] !== null ? bids[idx] : '—')))))));
  }

  // Playing Phase
  if (gamePhase === 'playing') {
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-4xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "text-3xl font-bold text-gray-800",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Round ", currentRound, " - Results"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mt-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-gray-600"
    }, "Trump:"), createElement(suitIcons[trumpSuit], {
      className: "w-5 h-5",
      style: {
        color: suitColors[trumpSuit]
      },
      fill: "currentColor"
    }), /*#__PURE__*/React.createElement("span", {
      className: "font-medium",
      style: {
        color: suitColors[trumpSuit]
      }
    }, suitSymbols[trumpSuit], " ", trumpSuit))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-semibold text-gray-800 mb-6",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Enter Hands Won"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, players.map((player, idx) => /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-3"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "font-semibold text-lg text-gray-800",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, player.emoji, " ", player.name), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600"
    }, "Bid: ", /*#__PURE__*/React.createElement("span", {
      className: "font-bold text-green-700"
    }, bids[idx]))), handsWon[idx] !== null && (handsWon[idx] === bids[idx] ? /*#__PURE__*/React.createElement(CheckCircle, {
      className: "w-6 h-6 text-green-600"
    }) : /*#__PURE__*/React.createElement(XCircle, {
      className: "w-6 h-6 text-red-600"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-7 gap-2"
    }, Array(cardsThisRound + 1).fill(0).map((_, count) => /*#__PURE__*/React.createElement("button", {
      key: count,
      onClick: () => submitHandsWon(idx, count),
      className: `py-3 rounded-lg font-semibold transition-all ${handsWon[idx] === count ? count === bids[idx] ? 'bg-green-600 text-white card-shadow scale-105' : 'bg-red-600 text-white card-shadow scale-105' : 'bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300'}`
    }, count)))))), handsWon.every(h => h !== null) && /*#__PURE__*/React.createElement("div", {
      className: "mt-6 bg-amber-50 border-2 border-amber-400 rounded-xl p-4 text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-amber-800 font-semibold"
    }, "\u2713 All results recorded! Calculating scores...")))));
  }

  // Round End Phase
  if (gamePhase === 'round-end') {
    const lastRoundScores = roundScores[roundScores.length - 1];
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-4xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-6 mb-6 card-shadow felt-texture"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-3xl font-bold text-gray-800 text-center",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Round ", currentRound, " Complete!")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-semibold text-gray-800 mb-6",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Round Scores"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, players.map((player, idx) => {
      const bid = bids[idx];
      const won = handsWon[idx];
      const score = lastRoundScores[idx];
      const success = bid === won;
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: `p-4 rounded-xl border-2 ${success ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1"
      }, /*#__PURE__*/React.createElement("p", {
        className: "font-semibold text-lg text-gray-800",
        style: {
          fontFamily: "'Fredoka', sans-serif"
        }
      }, player.emoji, " ", player.name), /*#__PURE__*/React.createElement("p", {
        className: `text-sm font-medium ${success ? 'text-green-700' : 'text-red-700'}`
      }, "Bid: ", bid, " | Won: ", won, " ", success ? '✓' : '❌')), /*#__PURE__*/React.createElement("div", {
        className: "text-right"
      }, /*#__PURE__*/React.createElement("p", {
        className: `text-3xl font-bold ${success ? 'text-green-700' : 'text-red-600'}`
      }, success ? `+${score}` : score), /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-gray-600"
      }, "Total: ", cumulativeScores[idx]))));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(Trophy, {
      className: "w-6 h-6 text-amber-500"
    }), "Current Standings"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-2"
    }, players.map((player, idx) => ({
      ...player,
      score: cumulativeScores[idx],
      idx
    })).sort((a, b) => b.score - a.score).map((player, rank) => /*#__PURE__*/React.createElement("div", {
      key: player.idx,
      className: `p-4 rounded-xl flex justify-between items-center ${rank === 0 ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-2 border-amber-400' : 'bg-gray-50 border-2 border-gray-200'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: `text-2xl font-bold ${rank === 0 ? 'text-amber-600' : 'text-gray-400'}`
    }, "#", rank + 1), /*#__PURE__*/React.createElement("span", {
      className: "font-semibold text-lg text-gray-800",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, player.emoji, " ", player.name)), /*#__PURE__*/React.createElement("span", {
      className: `text-3xl font-bold ${rank === 0 ? 'text-amber-700' : 'text-gray-700'}`
    }, player.score))))), /*#__PURE__*/React.createElement("button", {
      onClick: nextRound,
      className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, currentRound < getTotalRounds(players.length) ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Play, {
      className: "w-5 h-5"
    }), "Next Round") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Trophy, {
      className: "w-5 h-5"
    }), "View Final Results"))));
  }

  // Game End Phase
  if (gamePhase === 'game-end') {
    const winner = players.map((player, idx) => ({
      ...player,
      score: cumulativeScores[idx],
      idx
    })).sort((a, b) => b.score - a.score)[0];
    return /*#__PURE__*/React.createElement("div", {
      className: "min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4 sm:p-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-4xl mx-auto"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-8 mb-6 card-shadow gold-glow text-center"
    }, /*#__PURE__*/React.createElement(Trophy, {
      className: "w-20 h-20 text-white mx-auto mb-4 float-animation"
    }), /*#__PURE__*/React.createElement("h1", {
      className: "text-5xl font-bold text-white mb-2",
      style: {
        fontFamily: "'Crimson Text', serif"
      }
    }, "Game Over!"), /*#__PURE__*/React.createElement("p", {
      className: "text-amber-100 text-lg mb-4"
    }, "Winner"), /*#__PURE__*/React.createElement("p", {
      className: "text-6xl font-bold text-white",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, winner.emoji, " ", winner.name), /*#__PURE__*/React.createElement("p", {
      className: "text-3xl text-amber-100 mt-2"
    }, winner.score, " points")), /*#__PURE__*/React.createElement("div", {
      className: "bg-white/95 rounded-2xl p-8 card-shadow felt-texture mb-6"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-semibold text-gray-800 mb-6",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, "Final Standings"), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, players.map((player, idx) => ({
      ...player,
      score: cumulativeScores[idx],
      idx
    })).sort((a, b) => b.score - a.score).map((player, rank) => /*#__PURE__*/React.createElement("div", {
      key: player.idx,
      className: `p-5 rounded-xl flex justify-between items-center ${rank === 0 ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-4 border-amber-400' : rank === 1 ? 'bg-gray-100 border-2 border-gray-400' : rank === 2 ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50 border-2 border-gray-200'}`
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4"
    }, /*#__PURE__*/React.createElement("span", {
      className: `text-3xl font-bold ${rank === 0 ? 'text-amber-600' : 'text-gray-400'}`
    }, "#", rank + 1), /*#__PURE__*/React.createElement("span", {
      className: `font-semibold text-xl ${rank === 0 ? 'text-amber-800' : 'text-gray-800'}`,
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, player.emoji, " ", player.name)), /*#__PURE__*/React.createElement("span", {
      className: `text-4xl font-bold ${rank === 0 ? 'text-amber-700' : 'text-gray-700'}`
    }, player.score))))), /*#__PURE__*/React.createElement("button", {
      onClick: resetGame,
      className: "w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2",
      style: {
        fontFamily: "'Fredoka', sans-serif"
      }
    }, /*#__PURE__*/React.createElement(RotateCcw, {
      className: "w-5 h-5"
    }), "Start New Game")));
  }
  return null;
}

// Make component available globally for browser usage
window.JudgementGame = JudgementGame;