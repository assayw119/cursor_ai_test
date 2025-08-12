<script lang="ts">
  import SongCard from '$lib/components/SongCard.svelte';
  import ArtistCard from '$lib/components/ArtistCard.svelte';
  import type { SongWithArtist, ArtistWithSongs } from '$lib/type';




  // 임시 아티스트 데이터
  const artists: ArtistWithSongs[] = [
    {
      id: 1,
      name: '아이유',
      profile: '대한민국의 가수 겸 배우. 감성적인 음악과 뛰어난 가창력으로 유명합니다.',
      image: 'iu.webp',
      songs: [
        {
          id: 1,
          title: '좋은 날',
          artistId: 1,
          audio: 'iu_goodday.mp3',
          image: 'iu_album1.webp'
        },
        {
          id: 2,
          title: '밤편지',
          artistId: 1,
          audio: 'iu_nightletter.mp3',
          image: 'iu_album2.webp'
        }
      ]
    },
    {
      id: 2,
      name: 'BTS',
      profile: '세계적으로 사랑받는 K-POP 그룹. 파워풀한 퍼포먼스와 음악성으로 유명합니다.',
      image: 'bts.webp',
      songs: [
        {
          id: 3,
          title: 'Dynamite',
          artistId: 2,
          audio: 'bts_dynamite.mp3',
          image: 'bts_album1.webp'
        }
      ]
    }
  ];

  // SongWithArtist[] 생성 (각 곡에 artist 정보 할당)
  let songs: SongWithArtist[] = [];
  for (const artist of artists) {
    for (const song of artist.songs) {
              const songWithArtist: SongWithArtist = {
          ...song,
          artist: {
            id: artist.id,
            name: artist.name,
            profile: artist.profile,
            image: artist.image
          }
        };
      songs.push(songWithArtist);
    }
  }
</script>

<div class="min-h-screen bg-gray-700 py-10 px-4">
  <!-- 아티스트 목록 (위쪽) -->
  <h2 class="text-2xl font-bold text-gray-100 mb-6">아티스트 목록</h2>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
    {#each artists as artist (artist.id)}
      <ArtistCard {artist} />
    {/each}
  </div>

  <!-- 노래 목록 (아래쪽) -->
  <h1 class="text-3xl font-bold text-gray-50 mb-8">노래 목록</h1>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {#each songs as song (song.id)}
      <SongCard {song} />
    {/each}
  </div>
</div>
