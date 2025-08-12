<script>
  // 임시: 실제 재생 로직 없이 외형만 구현
  // 곡 정보 예시
  const song = {
    title: '곡 제목',
    artist: '아티스트명',
    artwork: '/img/song_default.webp'
  };
</script>

<div class="fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex items-center justify-between z-50">
  <!-- 곡 정보 (왼쪽) -->
  <div class="flex items-center min-w-0 w-1/3">
    <img src={song.artwork} alt="앨범 아트" class="w-16 h-16 rounded object-cover mr-4 bg-gray-700 flex-shrink-0" />
    <div class="min-w-0">
      <div class="font-bold truncate">{song.title}</div>
      <div class="text-sm text-gray-300 truncate">{song.artist}</div>
    </div>
  </div>

  <!-- 재생 컨트롤 및 진행 바 (중앙) -->
  <div class="flex flex-row items-center w-1/3">
    <button
      class="w-12 h-12 rounded-full bg-white flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white mr-4"
      aria-label="재생/일시정지"
      tabindex="0"
    >
      <!-- 재생 아이콘 (임시) -->
      <svg class="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
        <polygon points="6,4 20,12 6,20" />
      </svg>
    </button>
    <div class="flex items-center w-full">
      <span class="text-xs text-gray-300 mr-2">0:00</span>
      <div class="relative w-40 h-1 bg-gray-600 rounded overflow-hidden">
        <div class="absolute top-0 left-0 h-1 bg-white" style="width: 30%;"></div>
      </div>
      <span class="text-xs text-gray-300 ml-2">3:45</span>
    </div>
  </div>

  <!-- 음량 조절 (오른쪽) -->
  <div class="flex items-center w-1/3 justify-end">
    <!-- 스피커 아이콘 -->
    <svg class="w-6 h-6 text-gray-300 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path d="M11 5L6 9H2v6h4l5 4V5z" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 12c0-2.21-1.79-4-4-4" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <!-- 음량 슬라이더 (임시) -->
    <input
      type="range"
      min="0"
      max="100"
      value="70"
      class="w-20 accent-white bg-gray-700 rounded"
      aria-label="음량 조절"
      tabindex="0"
    />
  </div>
</div>
