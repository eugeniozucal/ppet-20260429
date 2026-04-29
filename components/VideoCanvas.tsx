import React from 'react';

export default function VideoCanvas() {
  // TODO: Reemplaza este ID por el de tu video de YouTube (ejemplo: 'dQw4w9WgXcQ' tomado de 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  const YOUTUBE_VIDEO_ID = 'PLACEHOLDER_VIDEO_ID';

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-black flex items-center justify-center">
      {YOUTUBE_VIDEO_ID === 'PLACEHOLDER_VIDEO_ID' ? (
        <div className="text-white text-center p-8 border-2 border-dashed border-slate-600 rounded-3xl max-w-lg">
          <h2 className="text-2xl font-bold mb-4">Video Placeholder</h2>
          <p className="text-slate-400">
            Reemplaza la constante <code>YOUTUBE_VIDEO_ID</code> en <code>components/VideoCanvas.tsx</code> con el ID de tu video de YouTube para verlo aquí a pantalla completa.
          </p>
        </div>
      ) : (
        <iframe
          className="absolute top-0 left-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&showinfo=0&rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Fullscreen YouTube Video"
        />
      )}
    </div>
  );
}
