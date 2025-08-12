<script lang="ts">
  import SongCard from '$lib/components/SongCard.svelte';
  import type { SongWithArtist } from '$lib/type';

  // 임시 아티스트 데이터
  const artist = {
    id: 1,
    name: '아이유',
    profile: '대한민국의 가수 겸 배우. 감성적인 음악과 뛰어난 가창력으로 유명합니다. 2008년 데뷔 이후 꾸준히 좋은 음악을 선보이며 대중의 사랑을 받고 있습니다. 감성적인 발라드부터 경쾌한 팝까지 다양한 장르의 음악을 소화하는 능력을 보여주고 있습니다.',
    image: '/img/artist_default.webp'
  };

  // 임시 노래 데이터
  const songs: SongWithArtist[] = [
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
      title: 'Blueming',
      artistId: 1,
      audio: 'iu_blueming.mp3',
      image: '/img/song_default.webp',
      artist: {
        id: 1,
        name: '아이유',
        profile: '대한민국의 가수 겸 배우',
        image: '/img/artist_default.webp'
      }
    }
  ];
</script>

<div class="min-h-screen bg-gray-700 py-10 px-4">
  <!-- 아티스트 정보 섹션 -->
  <div class="bg-gray-800 rounded-lg p-6 mb-8">
    <div class="flex items-start space-x-6">
      <!-- 아티스트 이미지 (왼쪽) -->
      <div class="flex-shrink-0">
        <img 
          src={artist.image} 
          alt="아티스트 이미지" 
          class="w-32 h-32 rounded-lg object-cover bg-gray-700"
        />
      </div>
      
      <!-- 아티스트 정보 (오른쪽) -->
      <div class="flex-1 min-w-0">
        <h1 class="text-3xl font-bold text-white mb-4">{artist.name}</h1>
        <p class="text-gray-300 text-lg leading-relaxed">{artist.profile}</p>
      </div>
    </div>
  </div>

  <!-- 노래 목록 섹션 -->
  <div class="mb-8">
    <h2 class="text-2xl font-bold text-gray-100 mb-6">노래 목록</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {#each songs as song (song.id)}
        <SongCard {song} />
      {/each}
    </div>
  </div>
</div>
