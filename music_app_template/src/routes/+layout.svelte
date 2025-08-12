<script>
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Player from '$lib/components/Player.svelte';
</script>
<div class="min-h-screen bg-gray-700 flex flex-col">
  <Header />
  <main class="flex-1">
    <slot />
  </main>
  <Player />
</div>