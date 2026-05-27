export default function StoryCard({ title, description, image, onPlay }) {
  return (
    <div className="card" onClick={onPlay}>
      
      <img src={image} alt={title} />

      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>

        <button onClick={onPlay}>
          Écouter
        </button>
      </div>

    </div>
  )
}