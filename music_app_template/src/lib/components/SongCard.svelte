<script lang="ts">
  import type { SongWithArtist } from '$lib/type';
  
  export let song: SongWithArtist;
</script>

<div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
  <!-- 상단: 아트워크 -->
  <div class="relative">
    <img 
      src={song.image || '/img/song_default.webp'} 
      alt="앨범 아트" 
      class="w-full h-48 object-cover"
    />
  </div>
  
  <!-- 중앙: 노래 이름과 아티스트 이름 -->
  <div class="p-4">
    <h3 class="font-bold text-white text-lg truncate mb-2" title={song.title}>
      {song.title}
    </h3>
    <p class="text-gray-300 text-sm truncate" title={song.artist.name}>
      {song.artist.name}
    </p>
  </div>
  
  <!-- 하단: 재생 버튼과 즐겨찾기 추가 버튼 -->
  <div class="px-4 pb-4 flex items-center justify-between">
    <!-- 재생 버튼 -->
    <button
      class="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
      aria-label="재생"
      tabindex="0"
    >
      <svg class="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
        <polygon points="6,4 20,12 6,20" />
      </svg>
    </button>
    
    <!-- 즐겨찾기 추가 버튼 -->
    <button
      class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors duration-200"
      aria-label="즐겨찾기에 추가"
      tabindex="0"
    >
      <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</div>
