const colors = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];

const Avatar = ({ name, src, size = 32 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'A';
  const color = colors[initials.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`${color} rounded-full flex items-center justify-center text-white font-medium flex-shrink-0`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-label={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;