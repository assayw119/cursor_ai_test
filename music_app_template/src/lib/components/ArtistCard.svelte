<script lang="ts">
  import type { ArtistWithSongs } from '$lib/type';
  export let artist: ArtistWithSongs;

  // 아티스트 이미지 경로 처리
  const imageUrl = artist.image
    ? `/uploads/${artist.image}`
    : '/img/artist_default.webp';
</script>

<div class="bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4 transition hover:scale-105 hover:shadow-lg">
  <img
    src={imageUrl}
    alt={artist.name + ' 이미지'}
    class="w-32 h-32 object-cover rounded-full mb-4 border-4 border-gray-700"
    loading="lazy"
  />
  <a
    href={`/artists/${artist.id}`}
    class="text-white text-lg font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
    tabindex="0"
  >
    {artist.name}
  </a>
</div>
