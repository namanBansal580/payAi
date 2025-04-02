import React from 'react';

const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-black"></div>
      
      {/* Large aurora waves */}
      <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]">
        <div className="absolute top-[40%] left-[30%] w-[70vw] h-[60vh] 
          bg-purple-600/20 rounded-[100%] blur-[100px] animate-aurora-slow transform-gpu"></div>
        
        <div className="absolute top-[30%] left-[20%] w-[80vw] h-[70vh] 
          bg-indigo-600/15 rounded-[100%] blur-[120px] animate-aurora-medium transform-gpu"></div>
          
        <div className="absolute top-[35%] left-[25%] w-[75vw] h-[65vh] 
          bg-blue-500/15 rounded-[100%] blur-[130px] animate-aurora-fast transform-gpu"></div>
      </div>
      
      {/* Smaller, brighter aurora waves */}
      <div className="absolute w-[150%] h-[150%] top-[-25%] left-[-25%]">
        <div className="absolute top-[45%] left-[35%] w-[50vw] h-[40vh] 
          bg-violet-500/25 rounded-[100%] blur-[80px] animate-aurora-medium-reverse transform-gpu"></div>
          
        <div className="absolute top-[40%] left-[40%] w-[60vw] h-[45vh] 
          bg-fuchsia-500/20 rounded-[100%] blur-[90px] animate-aurora-slow-reverse transform-gpu"></div>
      </div>
      
      {/* Bright accent points */}
      <div className="absolute top-[30%] left-[40%] w-[5vw] h-[5vh] 
        bg-purple-300/40 rounded-full blur-[30px] animate-pulse-slow transform-gpu"></div>
        
      <div className="absolute top-[60%] left-[60%] w-[3vw] h-[3vh] 
        bg-indigo-300/40 rounded-full blur-[25px] animate-pulse-medium transform-gpu"></div>
        
      <div className="absolute top-[40%] left-[70%] w-[4vw] h-[4vh] 
        bg-blue-300/40 rounded-full blur-[35px] animate-pulse-fast transform-gpu"></div>
      
      {/* Subtle star-like dots overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8ZGVmcz4KICA8cGF0dGVybiBpZD0ic3RhcnMiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgIDxjaXJjbGUgY3g9IjUiIGN5PSI1IiByPSIwLjUiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuMyIgLz4KICAgIDxjaXJjbGUgY3g9IjI1IiBjeT0iMTUiIHI9IjAuMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4yIiAvPgogICAgPGNpcmNsZSBjeD0iNDUiIGN5PSI0MCIgcj0iMC40IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjMiIC8+CiAgICA8Y2lyY2xlIGN4PSI3NSIgY3k9IjI1IiByPSIwLjMiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuMiIgLz4KICAgIDxjaXJjbGUgY3g9IjY1IiBjeT0iNzUiIHI9IjAuNCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4zIiAvPgogICAgPGNpcmNsZSBjeD0iOTUiIGN5PSI2MCIgcj0iMC4zIiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjIiIC8+CiAgICA8Y2lyY2xlIGN4PSIxMCIgY3k9IjkwIiByPSIwLjQiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuMyIgLz4KICAgIDxjaXJjbGUgY3g9IjM1IiBjeT0iNjUiIHI9IjAuMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4yIiAvPgogIDwvcGF0dGVybj4KPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RhcnMpIiAvPgo8L3N2Zz4=')]" 
        opacity="0.6"></div>
    </div>
  );
};

export default AuroraBackground;
