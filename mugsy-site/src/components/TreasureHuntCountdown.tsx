import { useState, useEffect } from 'react'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface TreasureHuntCountdownProps {
  onClose: () => void
  onMoreInfo: () => void
}

export default function TreasureHuntCountdown({ onClose, onMoreInfo }: TreasureHuntCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Calculate the target date: 5 days from midnight tonight
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0) // Tonight at midnight
    const targetDate = new Date(midnight.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from midnight

    const updateCountdown = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for fade animation
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 flex items-center justify-center z-[9999] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4 mt-20 relative shadow-2xl transform transition-transform duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-4 text-red-500">
          Red Mugsy's
          <br />
          Genesis Treasure Hunt
        </h1>

        {/* Body */}
        <p className="text-center text-gray-300 mb-6 leading-relaxed">
          Join Red Mugsy and many others in the largest Treasure Hunt. Get the chance to win one of the largest cash prizes ever!!!!<br /><br />
          Register as a participant or as a promoter
        </p>

        {/* Subtitle */}
        <p className="text-center text-gray-400 text-sm mb-4">
          Countdown starts from midnight tonight counting down 5 days to the start of Treasure Hunt
        </p>

        {/* Countdown Timer */}
        <div className="flex justify-center space-x-6 mb-8">
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-white">{timeLeft.days}</div>
              <div className="text-xs text-gray-400 uppercase">Days</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-white">{timeLeft.hours}</div>
              <div className="text-xs text-gray-400 uppercase">Hours</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-white">{timeLeft.minutes}</div>
              <div className="text-xs text-gray-400 uppercase">Min</div>
            </div>
          </div>
          <div className="text-center">
            <div className="bg-gray-800 rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl font-bold text-white">{timeLeft.seconds}</div>
              <div className="text-xs text-gray-400 uppercase">Sec</div>
            </div>
          </div>
        </div>

        {/* More Info Button */}
        <div className="text-center">
          <button
            onClick={onMoreInfo}
            className="treasure-hunt-neon-button bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200"
          >
            More Info
          </button>
        </div>
      </div>
    </div>
  )
}
