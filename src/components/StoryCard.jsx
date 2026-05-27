export default function StoryCard({ title, description, image, onPlay }) {
  return (
    <div className="card" onClick={onPlay}>
      
      <img src={image} alt={title} />

      <h3>{title}</h3>
      <p>{description}</p>

    </div>
  )
}