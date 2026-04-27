import brainVideo from '../assets/original-4a183540acef34999792319cbdd4b68b.mp4';

export default function LeftPanel() {
  return (
    <div className="relative hidden md:flex w-[37%] flex-shrink-0 flex-col justify-between p-8 overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={brainVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10" />

      <div className="relative z-20 flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M14 2L14 26M2 14L26 14M4.929 4.929L23.071 23.071M23.071 4.929L4.929 23.071"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-white text-lg font-semibold tracking-tight">Caslu</span>
      </div>

      <div className="relative z-20">
        <p className="text-white text-lg font-medium leading-snug mb-5">
          "Simply all the tools that my team and I need."
        </p>
        <div>
          <p className="text-white font-semibold text-sm">Karen Yue</p>
          <p className="text-white/60 text-sm">Director of Digital Marketing Technology</p>
        </div>
      </div>
    </div>
  );
}
