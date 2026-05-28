import { useRef, useState } from 'react'
import StoryCard from './components/StoryCard'
import { useEffect } from 'react'

export default function App() {

  // 🎧 Référence vers l'élément audio HTML
  const audioRef = useRef(null)

  // 📖 Histoire actuellement sélectionnée
  const [currentStory, setCurrentStory] = useState(null)

  // ▶️ État lecture / pause
  const [isPlaying, setIsPlaying] = useState(false)

  // 📊 Progression actuelle de l'audio
  const [progress, setProgress] = useState(0)

  // ⏱️ Durée totale de l'audio
  const [duration, setDuration] = useState(0)

  // 🔁 Au chargement de l'app :
  // récupère la dernière histoire et la position sauvegardée
  useEffect(() => {
    const savedStory = localStorage.getItem('lastStory')
    const savedProgress = localStorage.getItem('lastProgress')

    if (savedStory) {

      // 📖 Reconvertit l'histoire depuis le localStorage
      const story = JSON.parse(savedStory)

      // Met l'histoire actuelle dans le state
      setCurrentStory(story)

      // ⏱️ Petit délai pour laisser React créer l'élément audio
      setTimeout(() => {
        if (audioRef.current) {

          // Charge l'audio
          audioRef.current.src = story.audio

          // 🔁 Reprend à la dernière position sauvegardée
          if (savedProgress) {
            audioRef.current.currentTime = JSON.parse(savedProgress)
          }
        }
      }, 0)
    }
  }, [])

  // ▶️ Lance une histoire
  const playStory = (story) => {

    // Définit l'histoire actuelle
    setCurrentStory(story)

    // 💾 Sauvegarde l'histoire dans le localStorage
    localStorage.setItem('lastStory', JSON.stringify(story))

    setTimeout(() => {
      if (audioRef.current) {

        // Charge l'audio
        audioRef.current.src = story.audio

        // Lance la lecture
        audioRef.current.play()

        // Passe l'état en lecture
        setIsPlaying(true)

        // 🎧 MEDIA SESSION :
        // permet l'affichage sur écran verrouillé Android
        if ('mediaSession' in navigator) {

          // 📱 Infos affichées sur l'écran verrouillé
          navigator.mediaSession.metadata = new MediaMetadata({
            title: story.title,
            artist: "Histoires pour ma choupette 🤍",
            album: "Histoires pour bien dormir",

            // 🖼️ Image affichée pendant la lecture
            artwork: [
              {
                src: story.image || "/images/rossignol.jpg",
                sizes: "512x512",
                type: "image/png"
              }
            ]
          })

          // ▶️ Bouton play système
          navigator.mediaSession.setActionHandler("play", () => {
            audioRef.current.play()
            setIsPlaying(true)
          })

          // ⏸️ Bouton pause système
          navigator.mediaSession.setActionHandler("pause", () => {
            audioRef.current.pause()
            setIsPlaying(false)
          })
        }
      }
    }, 0)
  }

  // ▶️⏸️ Bouton play / pause du player
  const togglePlay = () => {

    // Sécurité si audio absent
    if (!audioRef.current) return

    // Si déjà en lecture → pause
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)

    } else {

      // Sinon → lecture
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  // ⏱️ Se déclenche pendant la lecture
  const onTimeUpdate = () => {
    const audio = audioRef.current

    if (!audio) return

    // Met à jour la progression
    setProgress(audio.currentTime)

    // 💾 Sauvegarde la position actuelle
    if (currentStory) {
      localStorage.setItem(
        'lastProgress',
        JSON.stringify(audio.currentTime)
      )
    }
  }

  // 📏 Quand les métadonnées de l'audio sont chargées
  const onLoadedMetadata = () => {
    const audio = audioRef.current

    if (!audio) return

    // Sauvegarde la durée totale
    setDuration(audio.duration)
  }

  // ⏱️ Convertit secondes → minutes:secondes
  const formatTime = (time) => {

    // Sécurité si valeur invalide
    if (!time || isNaN(time)) return "0:00"

    // Calcul minutes
    const minutes = Math.floor(time / 60)

    // Calcul secondes
    const seconds = Math.floor(time % 60)

    // Format final
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  return (
    <div className="app">

      {/* 💤 Titre principal */}
      <h1>Histoires pour bien dormir 🤍</h1>

      {/* 📚 Catalogue des histoires */}
      <div className="grid">

        {/* 📖 Carte histoire */}
        <StoryCard
          title="Le Rossignol"
          description="Une histoire qui montre qu’un vrai rossignol est plus précieux qu’un oiseau mécanique."
          image="/images/rossignol.jpg"
          audio="/audio/lerossignol.mp3"

          // ▶️ Quand on clique sur écouter
          onPlay={() =>
            playStory({
              title: 'Le Rossignol',
              audio: '/audio/lerossignol.mp3',
              image: '/images/rossignol.jpg'
            })
          }
        />
      </div>

      {/* 🎧 PLAYER FIXE */}
      <div className="player">

        {/* Si une histoire est chargée */}
        {currentStory ? (

          <div className="player-content">

            {/* 📖 Nom de l'histoire */}
            <div>
              <strong>{currentStory.title}</strong>
            </div>

            {/* 🔁 Bouton reprise */}
            <button
              onClick={() => {

                // Recharge l'histoire
                playStory(currentStory)

                // ⏱️ Recharge la position sauvegardée
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

            {/* 📊 BARRE DE PROGRESSION */}
            <div className="progress-container">

              {/* 🎚️ Slider progression */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={progress}

                // ⏩ Permet d'avancer/reculer dans l'audio
                onChange={(e) => {
                  const audio = audioRef.current

                  if (!audio) return

                  audio.currentTime = e.target.value
                  setProgress(e.target.value)
                }}
              />

              {/* ⏱️ Temps actuel / temps total */}
              <div className="time">
                {formatTime(progress)} / {formatTime(duration)}
              </div>
            </div>

            {/* ▶️⏸️ Bouton lecture / pause */}
            <button onClick={togglePlay}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>

        ) : (

          // 📭 Aucun audio chargé
          <div className="player-content">
            Aucun audio en cours
          </div>
        )}

        {/* 🎧 Élément audio caché */}
        <audio
          ref={audioRef}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>
    </div>
  )
}