export default function AudioPlayer({ audio, isOpen, setIsOpen }) {
  if (!audio) return null

  return (
    <div className={`player ${isOpen ? "open" : "closed"}`}>
      
      <audio controls autoPlay>
        <source src={audio} type="audio/mpeg" />
      </audio>

      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "▼" : "▲"}
      </button>

      {isOpen && (
        <div className="extra">
          {/* infos optionnelles */}
        </div>
      )}

    </div>
  )
}