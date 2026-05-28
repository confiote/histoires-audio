import { useRef, useState } from 'react'
import StoryCard from './components/StoryCard'
import { useEffect } from 'react'

export default function App() {

  const audioRef = useRef(null)

  const [currentStory, setCurrentStory] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1509472233997733990/VrG1ys4-bh0RzkaBnF0XLtUEbmOXsnjIbWzikdpKA3GmtzGzUL3YK1uEWNtLXkGrI8jA"

  const sendToDiscord = async (storyTitle, action = "▶️ Lecture") => {
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🎧 ${action} : **${storyTitle}**`
        })
      })
    } catch (err) {
      console.log("Discord error:", err)
    }
  }

  useEffect(() => {
    const savedStory = localStorage.getItem('lastStory')
    const savedProgress = localStorage.getItem('lastProgress')

    if (savedStory) {
      const story = JSON.parse(savedStory)
      setCurrentStory(story)

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = story.audio

          if (savedProgress) {
            audioRef.current.currentTime = JSON.parse(savedProgress)
          }
        }
      }, 0)
    }
  }, [])

  const playStory = async (story) => {

    setCurrentStory(story)
    localStorage.setItem('lastStory', JSON.stringify(story))

    if (!audioRef.current) return

    const audio = audioRef.current

    try {
      audio.pause()
      audio.src = story.audio
      audio.load()

      await audio.play()

      setIsPlaying(true)

      // ✅ UNE SEULE NOTIF PROPRE
      sendToDiscord(story.title, "▶️ Lecture")

      if ('mediaSession' in navigator) {

        navigator.mediaSession.metadata = new MediaMetadata({
          title: story.title,
          artist: "Histoires pour ma choupette 🤍",
          album: "Histoires pour bien dormir",
          artwork: [
            {
              src: story.image || "/images/rossignol.jpg",
              sizes: "512x512",
              type: "image/png"
            }
          ]
        })

        navigator.mediaSession.setActionHandler("play", () => {
          audio.play()
          setIsPlaying(true)
        })

        navigator.mediaSession.setActionHandler("pause", () => {
          audio.pause()
          setIsPlaying(false)
        })
      }

    } catch (err) {
      console.log("Erreur lecture audio:", err)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)

      sendToDiscord(currentStory.title, "⏸️ Pause")
    } else {
      audioRef.current.play()
      setIsPlaying(true)

      sendToDiscord(currentStory.title, "▶️ Lecture")
    }
  }

  const onTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return

    setProgress(audio.currentTime)

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
          image="/images/rossignol.jpg"
          audio="/audio/lerossignol.mp3"
          onPlay={() =>
            playStory({
              title: 'Le Rossignol',
              audio: '/audio/lerossignol.mp3',
              image: '/images/rossignol.jpg'
            })
          }
        />

      </div>

      <div className="player">

        {currentStory ? (
          <div className="player-content">

            <div>
              <strong>{currentStory.title}</strong>
            </div>

            <button
              onClick={() => {

                playStory(currentStory)

                sendToDiscord(currentStory.title, "🔁 Reprise")

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