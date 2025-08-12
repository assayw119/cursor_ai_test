<script lang="ts">
  import SongCard from '$lib/components/SongCard.svelte';
  import type { SongWithArtist } from '$lib/type';

  // 임시 즐겨찾기 곡 데이터 (실제로는 localStorage에서 가져올 예정)
  const favoriteSongs: SongWithArtist[] = [
    {
      id: 1,
      title: '좋은 날',
      artistId: 1,
      audio: 'iu_goodday.mp3',
      image: '/img/song_default.webp',
      artist: {
        id: 1,
        name: '아이유',
        profile: '대한민국의 가수 겸 배우',
        image: '/img/artist_default.webp'
      }
    },
    {
      id: 2,
      title: '밤편지',
      artistId: 1,
      audio: 'iu_nightletter.mp3',
      image: '/img/song_default.webp',
      artist: {
        id: 1,
        name: '아이유',
        profile: '대한민국의 가수 겸 배우',
        image: '/img/artist_default.webp'
      }
    },
    {
      id: 3,
      title: 'Dynamite',
      artistId: 2,
      audio: 'bts_dynamite.mp3',
      image: '/img/song_default.webp',
      artist: {
        id: 2,
        name: 'BTS',
        profile: '세계적으로 사랑받는 K-POP 그룹',
        image: '/img/artist_default.webp'
      }
    }
  ];

  // 즐겨찾기에서 곡 삭제 함수 (임시)
  function removeFromFavorite(songId: number) {
    // 실제로는 localStorage에서 제거하는 로직이 들어갈 예정
    console.log(`즐겨찾기에서 곡 ID ${songId} 제거`);
  }
</script>

<div class="min-h-screen bg-gray-700 py-10 px-4">
  <!-- 페이지 제목 -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-50 mb-2">즐겨찾기</h1>
    <p class="text-gray-300 text-lg">
      마음에 드는 곡들을 즐겨찾기에 추가하고 언제든지 재생할 수 있습니다.
    </p>
  </div>

  <!-- 즐겨찾기 곡 목록 -->
  {#if favoriteSongs.length > 0}
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-100 mb-6">
        즐겨찾기 곡 ({favoriteSongs.length}곡)
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {#each favoriteSongs as song (song.id)}
          <div class="relative">
            <SongCard {song} />
            <!-- 삭제 버튼 -->
            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="즐겨찾기에서 삭제"
              on:click={() => removeFromFavorite(song.id)}
              tabindex="0"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <!-- 즐겨찾기 곡이 없을 때 -->
    <div class="text-center py-16">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-300 mb-2">즐겨찾기 곡이 없습니다</h3>
      <p class="text-gray-400 mb-6">
        마음에 드는 곡을 찾아서 즐겨찾기에 추가해보세요.
      </p>
      <a
        href="/"
        class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-700"
        tabindex="0"
      >
        홈으로 돌아가기
      </a>
    </div>
  {/if}
</div>
