import './styles.css';
import React, { useState, useEffect, useMemo } from 'react';


// Mock data generation
const generateMockTokens = () => {
  const tokenNames = [
    'Bitcoin', 'Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Chainlink',
    'Uniswap', 'Litecoin', 'Dogecoin', 'Polygon', 'Avalanche', 'Cosmos',
    'Algorand', 'Tezos', 'Stellar', 'VeChain', 'Theta', 'Filecoin',
    'Hedera', 'Near Protocol', 'Internet Computer', 'Elrond', 'Fantom', 'Harmony'
  ];
  
  const symbols = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK',
    'UNI', 'LTC', 'DOGE', 'MATIC', 'AVAX', 'ATOM',
    'ALGO', 'XTZ', 'XLM', 'VET', 'THETA', 'FIL',
    'HBAR', 'NEAR', 'ICP', 'EGLD', 'FTM', 'ONE'
  ];

  return tokenNames.map((name, index) => ({
    id: index + 1,
    name,
    symbol: symbols[index],
    price: Math.random() * 1000 + 0.01,
    change24h: (Math.random() - 0.5) * 20,
    volume24h: Math.random() * 1000000000,
    marketCap: Math.random() * 100000000000,
    liquidity: Math.random() * 50000000,
    volatility: Math.random() * 100,
    slippage: Math.random() * 5,
    healthScore: Math.random() * 100,
    lastUpdated: new Date().toISOString()
  }));
};

// Utility functions
const formatNumber = (num, decimals = 2) => {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
};

const formatPrice = (price) => {
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const getHealthLabel = (score) => {
  if (score >= 80) return { label: 'Excellent', class: 'excellent' };
  if (score >= 60) return { label: 'Good', class: 'good' };
  if (score >= 40) return { label: 'Average', class: 'average' };
  if (score >= 20) return { label: 'Poor', class: 'poor' };
  return { label: 'Critical', class: 'critical' };
};

// Components
const TokenCard = ({ token, onClick }) => {
  const health = getHealthLabel(token.healthScore);
  const isPositive = token.change24h > 0;

  return (
    <div className="token-card" onClick={() => onClick(token)}>
      <div className="token-header">
        <div>
          <div className="token-icon">
            {token.symbol.substring(0, 2)}
          </div>
        </div>
        <div className="token-price">
          {formatPrice(token.price)}
        </div>
      </div>
      
      <div>
        <div className="token-name">
          {token.name}
          <span className="token-symbol">({token.symbol})</span>
        </div>
        
        <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '↗' : '↘'} {Math.abs(token.change24h).toFixed(2)}%
        </div>
      </div>

      <div className="token-metrics">
        <div className="metric">
          <div className="metric-label">Volume</div>
          <div className="metric-value">{formatNumber(token.volume24h)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">{formatNumber(token.marketCap)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Liquidity</div>
          <div className="metric-value">{formatNumber(token.liquidity)}</div>
        </div>
        <div className="metric">
          <div className="metric-label">Volatility</div>
          <div className="metric-value">{token.volatility.toFixed(1)}%</div>
        </div>
      </div>

      <div className="health-score">
        <div className="health-bar">
          <div 
            className={`health-fill ${health.class}`} 
            style={{ width: `${token.healthScore}%` }}
          ></div>
        </div>
        <div className="health-label">{health.label}</div>
      </div>
    </div>
  );
};

const TokenAnalyzer = ({ token, onBack }) => {
  const health = getHealthLabel(token.healthScore);
  const isPositive = token.change24h > 0;

  const recommendations = useMemo(() => {
    const recs = [];
    if (token.healthScore >= 70) recs.push('Strong fundamentals detected');
    if (token.volatility < 30) recs.push('Low volatility - stable investment');
    if (token.liquidity > 10000000) recs.push('High liquidity - easy entry/exit');
    if (token.slippage < 1) recs.push('Low slippage - efficient trading');
    if (recs.length === 0) recs.push('Monitor closely before investing');
    return recs;
  }, [token]);

  return (
    <div>
      <div className="flex items-center gap-16 mb-8">
        <button className="btn btn--secondary" onClick={onBack}>
          ← Back to Discovery
        </button>
        <h2>Token Analysis: {token.name}</h2>
      </div>

      <div className="token-details">
        <div className="detail-card">
          <div className="detail-header">
            <h3>Price Information</h3>
            <div className="token-icon">
              {token.symbol.substring(0, 2)}
            </div>
          </div>
          
          <div className="metric">
            <div className="metric-label">Current Price</div>
            <div className="metric-value" style={{ fontSize: 'var(--font-size-2xl)' }}>
              {formatPrice(token.price)}
            </div>
          </div>
          
          <div className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '↗' : '↘'} {Math.abs(token.change24h).toFixed(2)}% (24h)
          </div>

          <div className="token-metrics" style={{ marginTop: 'var(--space-24)' }}>
            <div className="metric">
              <div className="metric-label">Volume (24h)</div>
              <div className="metric-value">{formatNumber(token.volume24h)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Market Cap</div>
              <div className="metric-value">{formatNumber(token.marketCap)}</div>
            </div>
          </div>
        </div>

        <div className="detail-card">
          <div className="detail-header">
            <h3>Health Score</h3>
            <div className={`status status--${health.score >= 60 ? 'success' : health.score >= 40 ? 'warning' : 'error'}`}>
              {health.label}
            </div>
          </div>
          
          <div className="health-score" style={{ marginBottom: 'var(--space-16)' }}>
            <div className="health-bar">
              <div 
                className={`health-fill ${health.class}`} 
                style={{ width: `${token.healthScore}%` }}
              ></div>
            </div>
            <div className="health-label">{token.healthScore.toFixed(0)}/100</div>
          </div>

          <div className="token-metrics">
            <div className="metric">
              <div className="metric-label">Liquidity</div>
              <div className="metric-value">{formatNumber(token.liquidity)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Volatility</div>
              <div className="metric-value">{token.volatility.toFixed(1)}%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Slippage</div>
              <div className="metric-value">{token.slippage.toFixed(2)}%</div>
            </div>
          </div>
        </div>

        <div className="detail-card" style={{ gridColumn: '1 / -1' }}>
          <h3>AI Recommendations</h3>
          <ul style={{ marginTop: 'var(--space-16)', paddingLeft: 'var(--space-20)' }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: 'var(--space-8)' }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const TokenDiscovery = ({ tokens, onTokenSelect, searchQuery, setSearchQuery, filters, setFilters }) => {
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      const matchesSearch = token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesVolatility = filters.volatility === 'all' ||
                               (filters.volatility === 'low' && token.volatility < 30) ||
                               (filters.volatility === 'medium' && token.volatility >= 30 && token.volatility < 60) ||
                               (filters.volatility === 'high' && token.volatility >= 60);
      
      const matchesSlippage = filters.slippage === 'all' ||
                             (filters.slippage === 'low' && token.slippage < 1) ||
                             (filters.slippage === 'medium' && token.slippage >= 1 && token.slippage < 3) ||
                             (filters.slippage === 'high' && token.slippage >= 3);
      
      const matchesLiquidity = filters.liquidity === 'all' ||
                              (filters.liquidity === 'low' && token.liquidity < 1000000) ||
                              (filters.liquidity === 'medium' && token.liquidity >= 1000000 && token.liquidity < 10000000) ||
                              (filters.liquidity === 'high' && token.liquidity >= 10000000);
      
      return matchesSearch && matchesVolatility && matchesSlippage && matchesLiquidity;
    });
  }, [tokens, searchQuery, filters]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2>Token Discovery</h2>
        <div className="status status--info">
          {filteredTokens.length} tokens found
        </div>
      </div>

      <div className="filters">
        <div className="filter-group search-bar">
          <label className="form-label">Search Tokens</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="form-label">Volatility</label>
          <select
            className="form-control"
            value={filters.volatility}
            onChange={(e) => setFilters(prev => ({ ...prev, volatility: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="low">Low (&lt;30%)</option>
            <option value="medium">Medium (30-60%)</option>
            <option value="high">High (&gt;60%)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Slippage</label>
          <select
            className="form-control"
            value={filters.slippage}
            onChange={(e) => setFilters(prev => ({ ...prev, slippage: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="low">Low (&lt;1%)</option>
            <option value="medium">Medium (1-3%)</option>
            <option value="high">High (&gt;3%)</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="form-label">Liquidity</label>
          <select
            className="form-control"
            value={filters.liquidity}
            onChange={(e) => setFilters(prev => ({ ...prev, liquidity: e.target.value }))}
          >
            <option value="all">All Levels</option>
            <option value="low">Low (&lt;1M)</option>
            <option value="medium">Medium (1M-10M)</option>
            <option value="high">High (&gt;10M)</option>
          </select>
        </div>
      </div>

      <div className="token-grid">
        {filteredTokens.map(token => (
          <TokenCard key={token.id} token={token} onClick={onTokenSelect} />
        ))}
      </div>
    </div>
  );
};

const BuySignalPanel = ({ tokens }) => {
  const buySignals = useMemo(() => {
    return tokens.filter(token => 
      token.healthScore >= 60 && 
      token.slippage < 2 && 
      token.liquidity > 5000000 &&
      token.volatility < 50
    ).slice(0, 10);
  }, [tokens]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2>Buy Signals</h2>
        <div className="status status--success">
          {buySignals.length} signals detected
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <p className="mb-8">
            Tokens meeting buy criteria: Health Score ≥60, Low Slippage (&lt;2%), High Liquidity (&gt;5M), Moderate Volatility (&lt;50%)
          </p>
          
          <div className="token-grid">
            {buySignals.map(token => (
              <div key={token.id} className="token-card">
                <div className="token-header">
                  <div className="token-icon">
                    {token.symbol.substring(0, 2)}
                  </div>
                  <div className="signal-label">
                    🎯 Buy Signal
                  </div>
                </div>
                
                <div>
                  <div className="token-name">
                    {token.name}
                    <span className="token-symbol">({token.symbol})</span>
                  </div>
                  <div className="token-price">{formatPrice(token.price)}</div>
                </div>

                <div className="token-metrics">
                  <div className="metric">
                    <div className="metric-label">Health Score</div>
                    <div className="metric-value text-success">{token.healthScore.toFixed(0)}/100</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Slippage</div>
                    <div className="metric-value">{token.slippage.toFixed(2)}%</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Liquidity</div>
                    <div className="metric-value">{formatNumber(token.liquidity)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Volatility</div>
                    <div className="metric-value">{token.volatility.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SwapSimulator = ({ tokens }) => {
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('100');
  const [quote, setQuote] = useState(null);

  const calculateQuote = () => {
    const amount = parseFloat(fromAmount);
    if (!amount || amount <= 0) return;

    const rate = toToken.price / fromToken.price;
    const slippageAmount = amount * (fromToken.slippage / 100);
    const feeAmount = amount * 0.003; // 0.3% fee
    const outputAmount = (amount - slippageAmount - feeAmount) * rate;

    setQuote({
      inputAmount: amount,
      outputAmount: outputAmount,
      rate: rate,
      slippage: fromToken.slippage,
      fee: feeAmount,
      priceImpact: (slippageAmount / amount) * 100
    });
  };

  useEffect(() => {
    calculateQuote();
  }, [fromToken, toToken, fromAmount]);

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div className="swap-container">
      <div className="card swap-card">
        <h2 className="mb-8">Swap Simulator</h2>
        
        <div className="token-input">
          <div className="token-selector" onClick={() => setFromToken(tokens[Math.floor(Math.random() * tokens.length)])}>
            <div className="token-icon small">
              {fromToken.symbol.substring(0, 2)}
            </div>
            <span>{fromToken.symbol}</span>
            <span>▼</span>
          </div>
          <input
            type="number"
            className="token-amount"
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            placeholder="0.0"
          />
        </div>

        <div className="swap-arrow" onClick={swapTokens}>
          ↕
        </div>

        <div className="token-input">
          <div className="token-selector" onClick={() => setToToken(tokens[Math.floor(Math.random() * tokens.length)])}>
            <div className="token-icon small">
              {toToken.symbol.substring(0, 2)}
            </div>
            <span>{toToken.symbol}</span>
            <span>▼</span>
          </div>
          <input
            type="text"
            className="token-amount"
            value={quote ? quote.outputAmount.toFixed(4) : '0.0'}
            readOnly
            placeholder="0.0"
          />
        </div>

        {quote && (
          <div className="swap-details">
            <div className="detail-row">
              <span className="detail-label">Rate</span>
              <span>1 {fromToken.symbol} = {quote.rate.toFixed(4)} {toToken.symbol}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Price Impact</span>
              <span className={quote.priceImpact > 3 ? 'text-warning' : 'text-success'}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Trading Fee</span>
              <span>{quote.fee.toFixed(4)} {fromToken.symbol}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Slippage</span>
              <span>{quote.slippage.toFixed(2)}%</span>
            </div>
          </div>
        )}

        <button className="btn btn--primary btn--full-width" style={{ marginTop: 'var(--space-16)' }}>
          Simulate Swap
        </button>
      </div>
    </div>
  );
};

const Portfolio = ({ portfolioTokens, setPortfolioTokens, tokens }) => {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [amount, setAmount] = useState('');

  const addToPortfolio = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const newToken = {
      ...selectedToken,
      amount: parseFloat(amount),
      purchasePrice: selectedToken.price,
      purchaseDate: new Date().toISOString()
    };

    setPortfolioTokens(prev => [...prev, newToken]);
    setAmount('');
  };

  const removeFromPortfolio = (index) => {
    setPortfolioTokens(prev => prev.filter((_, i) => i !== index));
  };

  const totalValue = portfolioTokens.reduce((sum, token) => sum + (token.amount * token.price), 0);
  const totalCost = portfolioTokens.reduce((sum, token) => sum + (token.amount * token.purchasePrice), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div>
      <h2 className="mb-8">Portfolio Simulator</h2>
      
      <div className="portfolio-summary">
        <div className="card summary-card">
          <div className="metric-label">Total Value</div>
          <div className="summary-value">{formatPrice(totalValue)}</div>
        </div>
        <div className="card summary-card">
          <div className="metric-label">Total Cost</div>
          <div className="summary-value">{formatPrice(totalCost)}</div>
        </div>
        <div className="card summary-card">
          <div className="metric-label">P&L</div>
          <div className={`summary-value ${totalPnL >= 0 ? 'text-success' : 'text-error'}`}>
            {formatPrice(totalPnL)}
          </div>
        </div>
        <div className="card summary-card">
          <div className="metric-label">P&L %</div>
          <div className={`summary-value ${totalPnLPercent >= 0 ? 'text-success' : 'text-error'}`}>
            {totalPnLPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <h3 className="mb-8">Add Token to Portfolio</h3>
          <div className="flex gap-8">
            <select
              className="form-control"
              value={selectedToken.id}
              onChange={(e) => setSelectedToken(tokens.find(t => t.id === parseInt(e.target.value)))}
            >
              {tokens.map(token => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol}) - {formatPrice(token.price)}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className="btn btn--primary" onClick={addToPortfolio}>
              Add to Portfolio
            </button>
          </div>
        </div>
      </div>

      {portfolioTokens.length > 0 && (
        <div className="portfolio-tokens">
          <div className="card">
            <div className="card__body">
              <h3 className="mb-8">Your Tokens</h3>
              <div className="token-row token-row-header">
                <div>Token</div>
                <div>Amount</div>
                <div>Current Price</div>
                <div>Purchase Price</div>
                <div>P&L</div>
                <div>Actions</div>
              </div>
              {portfolioTokens.map((token, index) => {
                const currentValue = token.amount * token.price;
                const purchaseValue = token.amount * token.purchasePrice;
                const pnl = currentValue - purchaseValue;
                const pnlPercent = (pnl / purchaseValue) * 100;

                return (
                  <div key={index} className="token-row">
                    <div>
                      <div className="flex items-center gap-8">
                        <div className="token-icon small">
                          {token.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <div>{token.name}</div>
                          <div className="text-secondary">{token.symbol}</div>
                        </div>
                      </div>
                    </div>
                    <div>{token.amount.toFixed(4)}</div>
                    <div>{formatPrice(token.price)}</div>
                    <div>{formatPrice(token.purchasePrice)}</div>
                    <div className={pnl >= 0 ? 'text-success' : 'text-error'}>
                      {formatPrice(pnl)} ({pnlPercent.toFixed(2)}%)
                    </div>
                    <div>
                      <button
                        className="btn btn--sm btn--outline"
                        onClick={() => removeFromPortfolio(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'discovery', label: 'Token Discovery' },
    { id: 'signals', label: 'Buy Signals' },
    { id: 'swap', label: 'Swap Simulator' },
    { id: 'portfolio', label: 'Portfolio' }
  ];

  return (
    <header className="header">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="logo">
            <span>🔐</span>
            AlphaVault
          </div>
          <nav>
            <div className="nav-links">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className={`nav-link ${activeView === item.id ? 'active' : ''}`}
                  onClick={() => setActiveView(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

const App = () => {
  const [tokens] = useState(() => generateMockTokens());
  const [activeView, setActiveView] = useState('discovery');
  const [selectedToken, setSelectedToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    volatility: 'all',
    slippage: 'all',
    liquidity: 'all'
  });
  const [portfolioTokens, setPortfolioTokens] = useState([]);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setActiveView('analyzer');
  };

  const handleBackToDiscovery = () => {
    setSelectedToken(null);
    setActiveView('discovery');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'discovery':
        return (
          <TokenDiscovery
            tokens={tokens}
            onTokenSelect={handleTokenSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
          />
        );
      case 'analyzer':
        return selectedToken ? (
          <TokenAnalyzer
            token={selectedToken}
            onBack={handleBackToDiscovery}
          />
        ) : (
          <TokenDiscovery
            tokens={tokens}
            onTokenSelect={handleTokenSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
          />
        );
      case 'signals':
        return <BuySignalPanel tokens={tokens} />;
      case 'swap':
        return <SwapSimulator tokens={tokens} />;
      case 'portfolio':
        return (
          <Portfolio
            portfolioTokens={portfolioTokens}
            setPortfolioTokens={setPortfolioTokens}
            tokens={tokens}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="app-container">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};


export default App;
