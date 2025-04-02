import CryptoChart from "./icons/crypto-chart"
export const metadata = {
  title: "Crypto Market Dashboard",
  description: "Track cryptocurrency market data with interactive charts",
}

export default function Home() {
  return (
    <main className="min-h-screen pt-14 bg-gradient-to-br from-black via-blue-950 to-purple-500">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Crypto Market Dashboard</h1>
          <p className="text-blue-200">Real-time cryptocurrency market data and analysis</p>
        </header>
        <CryptoChart />
      </div>
    </main>
  )
}