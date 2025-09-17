<script lang="ts">
  import type { SongWithArtist } from '$lib/type';

  // 임시 데이터 (실제로는 API에서 가져올 예정)
  let artist = {
    id: 1,
    name: '아이유',
    profile: '대한민국의 가수 겸 배우',
    image: '/img/artist_default.webp'
  };

  // 테이블 표시에 사용할 로컬 타입 (설명 필드 추가)
  type SongRow = SongWithArtist & { description?: string };

  // 임시 노래 목록 (설명 포함)
  let songs: SongRow[] = [
    {
      id: 1,
      title: '좋은 날',
      artistId: 1,
      audio: '/uploads/iu_goodday.mp3',
      image: '/uploads/iu_album1.webp',
      description: '명곡 중의 명곡, 상큼한 보컬과 고음이 인상적',
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
      audio: '/uploads/iu_nightletter.mp3',
      image: '/uploads/iu_album2.webp',
      description: '잔잔하고 감성적인 분위기의 대표곡',
      artist: {
        id: 1,
        name: '아이유',
        profile: '대한민국의 가수 겸 배우',
        image: '/img/artist_default.webp'
      }
    }
  ];

  let showAddModal = false;
  let newSongTitle = '';
  let newSongAudio: File | null = null;
  let newSongImage: File | null = null;

  // 곡 추가 모달 열기
  function openAddModal() {
    showAddModal = true;
    newSongTitle = '';
    newSongAudio = null;
    newSongImage = null;
  }

  // 곡 추가 모달 닫기
  function closeAddModal() {
    showAddModal = false;
  }

  // 곡 추가 (API 호출)
  async function addSong() {
    if (!newSongTitle || !newSongAudio) return;

    try {
      const formData = new FormData();
      formData.append('title', newSongTitle);
      formData.append('artistId', artist.id.toString());
      formData.append('audio', newSongAudio);
      if (newSongImage) {
        formData.append('image', newSongImage);
      }

      const response = await fetch('/admin/api/songs', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        console.log('곡이 성공적으로 추가되었습니다:', result);
        // 임시: 테이블에 바로 반영
        songs = [
          ...songs,
          {
            ...(result as any).title
              ? result
              : {
                  id: Date.now(),
                  title: newSongTitle,
                  artistId: artist.id,
                  audio: newSongAudio.name,
                  image: newSongImage ? newSongImage.name : null,
                  description: '',
                  artist
                }
          } as SongRow
        ];
        closeAddModal();
        alert('곡이 성공적으로 추가되었습니다.');
      } else {
        const error = await response.json();
        console.error('곡 추가 실패:', error);
        alert(`곡 추가 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('곡 추가 중 오류 발생:', error);
      alert('곡 추가 중 오류가 발생했습니다.');
    }
  }

  // 파일 선택 핸들러
  function handleAudioSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      newSongAudio = target.files[0];
    }
  }

  function handleImageSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      newSongImage = target.files[0];
    }
  }
</script>

<div class="min-h-screen bg-gray-700 py-10 px-4">
  <!-- 페이지 헤더 -->
  <div class="mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-50 mb-2">곡 관리</h1>
        <p class="text-gray-300 text-lg">
          <span class="font-semibold">{artist.name}</span>의 곡을 관리합니다.
        </p>
      </div>
      <button
        on:click={openAddModal}
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-700"
      >
        곡 추가
      </button>
    </div>
  </div>

  <!-- 노래 목록 테이블 -->
  <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-900">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">노래 제목</th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">노래 설명</th>
            <th class="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">가수</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          {#each songs as song (song.id)}
            <tr class="hover:bg-gray-750">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-white font-medium">{song.title}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-gray-300 text-sm line-clamp-2">{song.description || '설명 없음'}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-gray-300 text-sm">{song.artist.name}</div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 곡 추가 모달 -->
  {#if showAddModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-white mb-4">새 곡 추가</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">곡명</label>
            <input
              type="text"
              bind:value={newSongTitle}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="곡명을 입력하세요"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">오디오 파일 *</label>
            <input
              type="file"
              accept="audio/*"
              on:change={handleAudioSelect}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">이미지 파일 (선택사항)</label>
            <input
              type="file"
              accept="image/*"
              on:change={handleImageSelect}
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            on:click={closeAddModal}
            class="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
          >
            취소
          </button>
          <button
            on:click={addSong}
            disabled={!newSongTitle || !newSongAudio}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors duration-200"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
