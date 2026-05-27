import { useRef, useState } from 'react'
import StoryCard from './components/StoryCard'
import { useEffect } from 'react'

export default function App() {
  const audioRef = useRef(null)

  const [currentStory, setCurrentStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // ✅ AJOUT PROGRESSION
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const savedStory = localStorage.getItem('lastStory')
    const savedProgress = localStorage.getItem('lastProgress')

    if (savedStory) {
      const story = JSON.parse(savedStory)
      setCurrentStory(story)

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = story.audio

          // ⏱️ reprise position
          if (savedProgress) {
            audioRef.current.currentTime = JSON.parse(savedProgress)
          }
        }
      }, 0)
    }
  }, [])

  const playStory = (story) => {
    setCurrentStory(story)

    // 💾 sauvegarde légère
    localStorage.setItem('lastStory', JSON.stringify(story))

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = story.audio
        audioRef.current.play()
        setIsPlaying(true)
      }
    }, 0)
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // ✅ AJOUT EVENTS AUDIO
  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return

    setProgress(audio.currentTime)

    // 💾 sauvegarde position
    if (currentStory) {
      localStorage.setItem(
        'lastProgress',
        JSON.stringify(audio.currentTime)
      )
    }
  }

  const onLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration)
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="app">
      <h1>Histoires pour bien dormir 🤍</h1>

      <div className="grid">
        <StoryCard
          title="Le Rossignol"
          description="Une histoire qui montre qu’un vrai rossignol est plus précieux qu’un oiseau mécanique."
          audio="/audio/lerossignol.mp3"
          onPlay={() =>
            playStory({
              title: 'Le Rossignol',
              audio: '/audio/lerossignol.mp3'
            })
          }
        />

        <StoryCard
          title="Sous la pluie"
          description="Ambiance cosy"
          audio="/audio/histoire1.mp3"
          onPlay={() =>
            playStory({
              title: 'Sous la pluie',
              audio: '/audio/histoire1.mp3'
            })
          }
        />
      </div>

      {/* 🎧 PLAYER FIXE */}
      <div className="player">
        {currentStory ? (
          <div className="player-content">
            <div>
              <strong>{currentStory.title}</strong>
            </div>

            {/* 🔁 REPRISE */}
            <button
              onClick={() => {
                playStory(currentStory)

                setTimeout(() => {
                  if (audioRef.current) {
                    const saved = localStorage.getItem('lastProgress')
                    if (saved) {
                      audioRef.current.currentTime = JSON.parse(saved)
                    }
                  }
                }, 0)
              }}
            >
              Reprendre
            </button>

            {/* 📊 PROGRESSION */}
            <div className="progress-container">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={(e) => {
                  const audio = audioRef.current
                  if (!audio) return

                  audio.currentTime = e.target.value
                  setProgress(e.target.value)
                }}
              />

              <div className="time">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>

            <button onClick={togglePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        ) : (
          <div className="player-content">
            Aucun audio en cours
          </div>
        )}

        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>
    </div>
  )
}