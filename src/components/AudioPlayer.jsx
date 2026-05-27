export default function AudioPlayer({ audio }) {
  if (!audio) return null

  return (
    <div className="player">
      <audio controls autoPlay>
        <source src={audio} type="audio/mpeg" />
      </audio>
    </div>
  )
}