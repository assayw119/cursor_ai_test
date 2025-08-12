<script lang="ts">
  import { goto } from '$app/navigation';

  // 내비게이션 메뉴 항목 정의
  const navItems = [
    { name: '홈', href: '/' },
    { name: '즐겨찾기', href: '/favorite' }
  ];

  // 로고 클릭 시 홈으로 이동
  function handleLogoClick() {
    goto('/');
  }
</script>

<header class="w-full bg-gray-800 text-white">
  <div class="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
    <!-- 로고 -->
    <button
      class="flex items-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white rounded"
      aria-label="홈으로 이동"
      on:click={handleLogoClick}
      tabindex="0"
    >
      <span class="mr-2">🚀</span>
      <span class="hidden sm:inline">Music App</span>
    </button>
    <!-- 내비게이션 -->
    <nav>
      <ul class="flex space-x-6">
        {#each navItems as item}
          <li>
            <a
              href={item.href}
              class="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
              tabindex="0"
            >
              {item.name}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  </div>
</header>
