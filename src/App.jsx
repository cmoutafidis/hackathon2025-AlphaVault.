import React, { useState, useEffect, useMemo } from 'react';

// API Configuration
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// API Service
const apiService = {
  async fetchTopTokens(limit = 100) {
    try {
      const response = await fetch(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.map((coin) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price: coin.current_price || 0,
        change24h: coin.price_change_percentage_24h || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap || 0,
        // For missing data, we'll calculate estimates based on available data
        liquidity: this.estimateLiquidity(coin),
        volatility: this.estimateVolatility(coin),
        slippage: this.estimateSlippage(coin),
        healthScore: this.calculateHealthScore(coin),
        lastUpdated: new Date().toISOString(),
        image: coin.image,
        marketCapRank: coin.market_cap_rank
      }));
    } catch (error) {
      console.error('Error fetching token data:', error);
      throw error;
    }
  },

  estimateLiquidity(coin) {
    // Estimate liquidity based on volume and market cap
    const volume = coin.total_volume || 0;
    const marketCap = coin.market_cap || 0;
    return Math.min(volume * 2, marketCap * 0.1);
  },

  estimateVolatility(coin) {
    // Estimate volatility based on price change and market cap rank
    const priceChange = Math.abs(coin.price_change_percentage_24h || 0);
    const rankFactor = coin.market_cap_rank ? Math.min(coin.market_cap_rank / 10, 10) : 10;
    return Math.min(priceChange * 2 + rankFactor, 100);
  },

  estimateSlippage(coin) {
    // Estimate slippage based on volume and market cap
    const volume = coin.total_volume || 1;
    const marketCap = coin.market_cap || 1;
    const liquidityRatio = volume / marketCap;
    return Math.max(0.1, Math.min(5, (1 - liquidityRatio) * 3));
  },

  calculateHealthScore(coin) {
    // Calculate health score based on multiple factors
    let score = 50; // Base score
    
    // Market cap rank bonus (lower rank = higher score)
    if (coin.market_cap_rank) {
      score += Math.max(0, 20 - coin.market_cap_rank / 5);
    }
    
    // Volume to market cap ratio bonus
    if (coin.total_volume && coin.market_cap) {
      const volumeRatio = coin.total_volume / coin.market_cap;
      score += Math.min(20, volumeRatio * 100);
    }
    
    // Price stability bonus (penalize high volatility)
    const priceChange = Math.abs(coin.price_change_percentage_24h || 0);
    score += Math.max(0, 10 - priceChange / 2);
    
    return Math.min(100, Math.max(0, score));
  }
};

// Utility functions (keeping the same as before)
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

// Components (keeping the same structure but updating token display)
const TokenCard = ({ token, onClick }) => {
  const health = getHealthLabel(token.healthScore);
  const isPositive = token.change24h > 0;

  return (
    <div className="token-card" onClick={() => onClick(token)} style={{ cursor: 'pointer' }}>
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
    if (token.marketCapRank && token.marketCapRank <= 10) recs.push('Top 10 cryptocurrency by market cap');
    if (token.volume24h > token.marketCap * 0.1) recs.push('High trading activity detected');
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
            {token.marketCapRank && (
              <div className="metric">
                <div className="metric-label">Market Cap Rank</div>
                <div className="metric-value">#{token.marketCapRank}</div>
              </div>
            )}
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
              <div className="metric-label">Liquidity (Est.)</div>
              <div className="metric-value">{formatNumber(token.liquidity)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Volatility (Est.)</div>
              <div className="metric-value">{token.volatility.toFixed(1)}%</div>
            </div>
            <div className="metric">
              <div className="metric-label">Slippage (Est.)</div>
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

const TokenDiscovery = ({ tokens, onTokenSelect, searchQuery, setSearchQuery, filters, setFilters, loading, error }) => {
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

  if (loading) {
    return (
      <div>
        <h2>Token Discovery</h2>
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', padding: '2rem' }}>
            <div>Loading real cryptocurrency data...</div>
            <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.7 }}>
              Fetching live data from CoinGecko API
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Token Discovery</h2>
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
              Error loading cryptocurrency data
            </div>
            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              {error}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
              This might be due to API rate limits or network issues. Please try again in a moment.
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <label className="form-label">Slippage (Est.)</label>
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
          <label className="form-label">Liquidity (Est.)</label>
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
                    <div className="metric-label">Slippage (Est.)</div>
                    <div className="metric-value">{token.slippage.toFixed(2)}%</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Liquidity (Est.)</div>
                    <div className="metric-value">{formatNumber(token.liquidity)}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Volatility (Est.)</div>
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
  const [fromToken, setFromToken] = useState(tokens[0] || null);
  const [toToken, setToToken] = useState(tokens[1] || null);
  const [fromAmount, setFromAmount] = useState('100');
  const [quote, setQuote] = useState(null);

  const calculateQuote = () => {
    if (!fromToken || !toToken) return;
    
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
    if (tokens.length > 0 && !fromToken) {
      setFromToken(tokens[0]);
      setToToken(tokens[1] || tokens[0]);
    }
  }, [tokens, fromToken]);

  useEffect(() => {
    calculateQuote();
  }, [fromToken, toToken, fromAmount]);

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  if (!fromToken || !toToken) {
    return (
      <div className="swap-container">
        <div className="card swap-card">
          <h2 className="mb-8">Swap Simulator</h2>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading tokens...
          </div>
        </div>
      </div>
    );
  }

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
              <span className="detail-label">Slippage (Est.)</span>
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
  const [selectedToken, setSelectedToken] = useState(tokens[0] || null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (tokens.length > 0 && !selectedToken) {
      setSelectedToken(tokens[0]);
    }
  }, [tokens, selectedToken]);

  const addToPortfolio = () => {
    if (!amount || parseFloat(amount) <= 0 || !selectedToken) return;
    
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

  if (tokens.length === 0) {
    return (
      <div>
        <h2 className="mb-8">Portfolio Simulator</h2>
        <div className="card">
          <div className="card__body" style={{ textAlign: 'center', padding: '2rem' }}>
            Loading tokens...
          </div>
        </div>
      </div>
    );
  }

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
              value={selectedToken?.id || ''}
              onChange={(e) => setSelectedToken(tokens.find(t => t.id === e.target.value))}
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
                          <div className="token-name">{token.name}</div>
                          <div className="token-symbol">({token.symbol})</div>
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
                        className="btn btn--secondary btn--small"
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

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('discovery');
  const [tokens, setTokens] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [portfolioTokens, setPortfolioTokens] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    volatility: 'all',
    slippage: 'all',
    liquidity: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);
        const tokenData = await apiService.fetchTopTokens(100);
        setTokens(tokenData);
      } catch (err) {
        setError(err.message);
        console.error('Failed to fetch tokens:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
  };

  const handleBackToDiscovery = () => {
    setSelectedToken(null);
  };

  const renderContent = () => {
    if (selectedToken) {
      return <TokenAnalyzer token={selectedToken} onBack={handleBackToDiscovery} />;
    }

    switch (activeTab) {
      case 'discovery':
        return (
          <TokenDiscovery
            tokens={tokens}
            onTokenSelect={handleTokenSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            setFilters={setFilters}
            loading={loading}
            error={error}
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
        return null;
    }
  };

  return (
    <div className="app">
      <style jsx>{`
        :root {
          --color-primary: #007AFF;
          --color-primary-hover: #0056CC;
          --color-secondary: #F2F2F7;
          --color-success: #30D158;
          --color-warning: #FF9F0A;
          --color-error: #FF453A;
          --color-background: linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%);
          --color-surface: rgba(255, 255, 255, 0.8);
          --color-surface-hover: rgba(0, 122, 255, 0.1);
          --color-text: #1D1D1F;
          --color-text-secondary: #6D6D80;
          --color-border: rgba(0, 0, 0, 0.1);
          --color-accent: #5856D6;
          --color-accent-secondary: #FF2D92;
          --color-gradient-1: linear-gradient(135deg, #007AFF 0%, #5856D6 100%);
          --color-gradient-2: linear-gradient(135deg, #30D158 0%, #32D74B 100%);
          --color-gradient-3: linear-gradient(135deg, #FF9F0A 0%, #FFCC02 100%);
          --color-gradient-4: linear-gradient(135deg, #FF453A 0%, #FF2D92 100%);
          --color-card-shadow: rgba(0, 0, 0, 0.1);
          --space-4: 0.25rem;
          --space-8: 0.5rem;
          --space-12: 0.75rem;
          --space-16: 1rem;
          --space-20: 1.25rem;
          --space-24: 1.5rem;
          --space-32: 2rem;
          --font-size-sm: 0.875rem;
          --font-size-base: 1rem;
          --font-size-lg: 1.125rem;
          --font-size-xl: 1.25rem;
          --font-size-2xl: 1.5rem;
          --font-size-3xl: 1.875rem;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --border-radius-lg: 16px;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          --backdrop-blur: blur(20px);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          background: var(--color-background);
          color: var(--color-text);
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
          border-bottom: 1px solid var(--color-border);
          padding: var(--space-16) var(--space-24);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header h1 {
          font-size: var(--font-size-3xl);
          font-weight: 700;
          background: var(--color-gradient-1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .nav {
          display: flex;
          gap: var(--space-8);
          margin-top: var(--space-16);
        }

        .nav-item {
          padding: var(--space-12) var(--space-20);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          color: var(--color-text-secondary);
          cursor: pointer;
          border-radius: var(--border-radius);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          font-weight: 500;
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .nav-item:hover {
          background: var(--color-surface-hover);
          color: var(--color-primary);
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }

        .nav-item.active {
          background: var(--color-gradient-1);
          color: white;
          border-color: transparent;
          box-shadow: var(--shadow);
        }

        .main {
          flex: 1;
          padding: var(--space-32) var(--space-24);
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .card__body {
          padding: var(--space-24);
        }

        .btn {
          padding: var(--space-12) var(--space-20);
          border: none;
          border-radius: var(--border-radius);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-decoration: none;
          display: inline-block;
          text-align: center;
          font-size: var(--font-size-base);
          letter-spacing: -0.01em;
        }

        .btn--primary {
          background: var(--color-gradient-1);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(0, 122, 255, 0.3);
        }

        .btn--primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px 0 rgba(0, 122, 255, 0.4);
        }

        .btn--secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .btn--secondary:hover {
          background: var(--color-surface-hover);
          transform: translateY(-1px);
          box-shadow: var(--shadow);
        }

        .btn--small {
          padding: var(--space-8) var(--space-16);
          font-size: var(--font-size-sm);
        }

        .btn--full-width {
          width: 100%;
        }

        .form-control {
          width: 100%;
          padding: var(--space-16);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius);
          background: var(--color-surface);
          color: var(--color-text);
          font-size: var(--font-size-base);
          transition: all 0.3s ease;
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .form-control:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
        }

        .form-label {
          display: block;
          margin-bottom: var(--space-8);
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .filters {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-16);
          margin-bottom: var(--space-32);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .search-bar {
          grid-column: 1;
        }

        .token-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-20);
        }

        .token-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-24);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
          position: relative;
          overflow: hidden;
        }

        .token-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-gradient-1);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .token-card:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .token-card:hover::before {
          opacity: 1;
        }

        .token-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-20);
        }

        .token-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--border-radius);
          background: var(--color-gradient-1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: var(--font-size-base);
          box-shadow: 0 4px 14px 0 rgba(0, 122, 255, 0.25);
        }

        .token-icon.small {
          width: 28px;
          height: 28px;
          font-size: var(--font-size-sm);
        }

        .token-name {
          font-weight: 700;
          margin-bottom: var(--space-4);
          color: var(--color-text);
          letter-spacing: -0.01em;
        }

        .token-symbol {
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
          font-weight: 500;
        }

        .token-price {
          font-size: var(--font-size-xl);
          font-weight: 800;
          text-align: right;
          color: var(--color-text);
          letter-spacing: -0.02em;
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          font-size: var(--font-size-sm);
          font-weight: 600;
          margin-bottom: var(--space-20);
        }

        .price-change.positive {
          color: var(--color-success);
        }

        .price-change.negative {
          color: var(--color-error);
        }

        .token-metrics {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
          margin-bottom: var(--space-20);
        }

        .metric {
          display: flex;
          flex-direction: column;
          padding: var(--space-12);
          background: rgba(0, 0, 0, 0.03);
          border-radius: var(--border-radius-sm);
        }

        .metric-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-4);
          font-weight: 500;
        }

        .metric-value {
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.01em;
        }

        .health-score {
          display: flex;
          align-items: center;
          gap: var(--space-12);
        }

        .health-bar {
          flex: 1;
          height: 6px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .health-fill {
          height: 100%;
          transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border-radius: 3px;
        }

        .health-fill.excellent {
          background: var(--color-gradient-2);
        }

        .health-fill.good {
          background: linear-gradient(135deg, #32D74B 0%, #30D158 100%);
        }

        .health-fill.average {
          background: var(--color-gradient-3);
        }

        .health-fill.poor {
          background: linear-gradient(135deg, #FF9F0A 0%, #FF8A00 100%);
        }

        .health-fill.critical {
          background: var(--color-gradient-4);
        }

        .health-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .signal-label {
          background: var(--color-gradient-2);
          color: white;
          padding: var(--space-8) var(--space-16);
          border-radius: var(--border-radius);
          font-size: var(--font-size-sm);
          font-weight: 600;
          box-shadow: 0 2px 8px 0 rgba(48, 209, 88, 0.3);
        }

        .status {
          padding: var(--space-8) var(--space-16);
          border-radius: var(--border-radius);
          font-size: var(--font-size-sm);
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .status--success {
          background: rgba(48, 209, 88, 0.1);
          color: var(--color-success);
        }

        .status--warning {
          background: rgba(255, 159, 10, 0.1);
          color: var(--color-warning);
        }

        .status--error {
          background: rgba(255, 69, 58, 0.1);
          color: var(--color-error);
        }

        .status--info {
          background: rgba(0, 122, 255, 0.1);
          color: var(--color-primary);
        }

        .text-success {
          color: var(--color-success);
        }

        .text-warning {
          color: var(--color-warning);
        }

        .text-error {
          color: var(--color-error);
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-between {
          justify-content: space-between;
        }

        .gap-8 {
          gap: var(--space-8);
        }

        .gap-16 {
          gap: var(--space-16);
        }

        .mb-8 {
          margin-bottom: var(--space-8);
        }

        .mb-16 {
          margin-bottom: var(--space-16);
        }

        .detail-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-32);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-24);
        }

        .token-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-32);
        }

        .swap-container {
          display: flex;
          justify-content: center;
          padding: var(--space-32);
        }

        .swap-card {
          width: 100%;
          max-width: 420px;
        }

        .token-input {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-lg);
          padding: var(--space-20);
          margin-bottom: var(--space-16);
          transition: all 0.3s ease;
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .token-input:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
        }

        .token-selector {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          cursor: pointer;
          padding: var(--space-12);
          border-radius: var(--border-radius);
          transition: all 0.3s ease;
        }

        .token-selector:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .token-amount {
          background: none;
          border: none;
          color: var(--color-text);
          font-size: var(--font-size-xl);
          font-weight: 600;
          text-align: right;
          width: 150px;
        }

        .token-amount:focus {
          outline: none;
        }

        .swap-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-gradient-1);
          color: white;
          cursor: pointer;
          margin: var(--space-12) auto;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 4px 14px 0 rgba(0, 122, 255, 0.3);
        }

        .swap-arrow:hover {
          transform: translateY(-2px) rotate(180deg);
          box-shadow: 0 6px 20px 0 rgba(0, 122, 255, 0.4);
        }

        .swap-details {
          background: rgba(0, 0, 0, 0.03);
          border-radius: var(--border-radius-lg);
          padding: var(--space-20);
          margin-top: var(--space-20);
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-12);
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .portfolio-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-20);
          margin-bottom: var(--space-32);
        }

        .summary-card {
          text-align: center;
          padding: var(--space-24);
          background: var(--color-surface);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--color-border);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
        }

        .summary-value {
          font-size: var(--font-size-2xl);
          font-weight: 800;
          margin-top: var(--space-12);
          letter-spacing: -0.02em;
        }

        .portfolio-tokens {
          margin-top: var(--space-32);
        }

        .token-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
          gap: var(--space-20);
          align-items: center;
          padding: var(--space-20);
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
          backdrop-filter: var(--backdrop-blur);
          -webkit-backdrop-filter: var(--backdrop-blur);
          transition: all 0.3s ease;
        }

        .token-row:hover {
          background: rgba(255, 255, 255, 0.95);
          transform: translateX(4px);
        }

        .token-row-header {
          font-weight: 700;
          color: var(--color-text-secondary);
          border-bottom: 2px solid var(--color-border);
          background: rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 768px) {
          .filters {
            grid-template-columns: 1fr;
          }

          .token-grid {
            grid-template-columns: 1fr;
          }

          .token-details {
            grid-template-columns: 1fr;
          }

          .portfolio-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .token-row {
            grid-template-columns: 1fr;
            gap: var(--space-12);
          }

          .token-row > div {
            display: flex;
            justify-content: space-between;
          }

          .token-row-header {
            display: none;
          }
        }
      `}</style>

      <header className="header">
        <h1>Token Discovery Platform</h1>
        <nav className="nav">
          <button
            className={`nav-item ${activeTab === 'discovery' ? 'active' : ''}`}
            onClick={() => setActiveTab('discovery')}
          >
            Discovery
          </button>
          <button
            className={`nav-item ${activeTab === 'signals' ? 'active' : ''}`}
            onClick={() => setActiveTab('signals')}
          >
            Buy Signals
          </button>
          <button
            className={`nav-item ${activeTab === 'swap' ? 'active' : ''}`}
            onClick={() => setActiveTab('swap')}
          >
            Swap Simulator
          </button>
          <button
            className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
        </nav>
      </header>

      <main className="main">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;