export default function StoryCard({
  title,
  description,
  onPlay
}) {
  return (
    <div className="card">
      <div className="cover"></div>

      <div className="content">
        <h2>{title}</h2>
        <p>{description}</p>

        <button onClick={onPlay}>
          Écouter
        </button>
      </div>
    </div>
  )
}