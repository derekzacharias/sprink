import { Link } from 'react-router-dom'
import grassUrl from '../assets/grass.png'

export default function Logo({ large = false }) {
  const sizeClass = large ? 'text-3xl' : 'text-xl'
  return (
    <Link to="/" className="inline-flex items-center gap-2 select-none">
      <img src={grassUrl} alt="Sprink logo" className={`h-[3.75rem] w-[3.75rem] object-contain`} />
      <span className={`${sizeClass} font-extrabold tracking-tight text-leaf-700`}>Sprink</span>
    </Link>
  )
}

// Icon image is loaded from client/src/assets/grass.svg
