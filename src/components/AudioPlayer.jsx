export default function AudioPlayer({ audio, isOpen, setIsOpen }) {
  if (!audio) return null

  return (
    <div className="player">
      <audio controls autoPlay>
        <source src={audio} type="audio/mpeg" />
      </audio>

      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "▼" : "▲"}
      </button>

      {isOpen && (
        <div>
          {/* ici tu peux mettre progression + infos si tu veux */}
        </div>
      )}
    </div>
  )
}