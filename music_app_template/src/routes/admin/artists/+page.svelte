<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import type { Artist } from '@prisma/client';

    let artists = writable<Artist[]>([]);
    let showModal = writable(false);
    let showEditModal = writable(false);
    let newArtistName = '';
    let newArtistProfile = '';
    let newArtistImage: File | null = null;
    let editArtistId: string | null = null;
    let editArtistName = '';
    let editArtistProfile = '';
    let editArtistImage: File | null = null;

    const fetchArtists = async () => {
        const response = await fetch('/api/artists');
        const data = await response.json();
        artists.set(data);
    };

    const addArtist = async () => {
        const formData = new FormData();
        formData.append('name', newArtistName);
        formData.append('profile', newArtistProfile);
        if (newArtistImage) {
            formData.append('image', newArtistImage);
        }

        const response = await fetch('/admin/api/artists', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            fetchArtists();
            showModal.set(false);
            newArtistName = '';
            newArtistProfile = '';
            newArtistImage = null;
            alert('아티스트가 추가되었습니다.');
        } else {
            console.error('Failed to add artist');
        }
    };

    const editArtist = async () => {
        const formData = new FormData();
        if (editArtistId) {
            formData.append('id', editArtistId);
        }
        formData.append('name', editArtistName);
        formData.append('profile', editArtistProfile);
        if (editArtistImage) {
            formData.append('image', editArtistImage);
        } else {
            alert('이미지가 업로드되지 않았습니다');
            return;
        }

        const response = await fetch('/admin/api/artists', {
            method: 'PUT',
            body: formData
        });

        if (response.ok) {
            fetchArtists();
            showEditModal.set(false);
        } else {
            console.error('Failed to edit artist');
        }
    };

    const openEditModal = (artist: Artist) => {
        editArtistId = artist.id.toString();
        editArtistName = artist.name;
        editArtistProfile = artist.profile;
        editArtistImage = null;
        showEditModal.set(true);
    };

    const handleFileChange = (e: Event, setImage: (file: File | null) => void) => {
        const target = e.target as HTMLInputElement;
        setImage(target.files?.[0] || null);
    };

    onMount(fetchArtists);
</script>

<button class="bg-blue-500 text-white p-2 rounded float-right mb-4" on:click={() => showModal.set(true)}>신규 아티스트 추가</button>

{#if $showModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 class="text-xl mb-4">신규 아티스트 추가</h2>
            <label class="block mb-2">
                이름:
                <input type="text" bind:value={newArtistName} class="border p-2 w-full" />
            </label>
            <label class="block mb-2">
                프로필:
                <textarea bind:value={newArtistProfile} class="border p-2 w-full"></textarea>
            </label>
            <label class="block mb-4">
                이미지:
                <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => newArtistImage = file)} class="border p-2 w-full" />
            </label>
            <div class="flex justify-end">
                <button class="bg-gray-500 text-white p-2 rounded mr-2" on:click={() => showModal.set(false)}>취소</button>
                <button class="bg-blue-500 text-white p-2 rounded" on:click={addArtist}>추가</button>
            </div>
        </div>
    </div>
{/if}

{#if $showEditModal}
    <div class="fixed inset-0 bg-gray-700 bg-opacity-75 flex items-center justify-center">
        <div class="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 class="text-xl mb-4">아티스트 정보 편집</h2>
            <label class="block mb-2">
                이름:
                <input type="text" bind:value={editArtistName} class="border p-2 w-full" />
            </label>
            <label class="block mb-2">
                프로필:
                <textarea bind:value={editArtistProfile} class="border p-2 w-full"></textarea>
            </label>
            <label class="block mb-4">
                이미지:
                <input type="file" accept="image/*" on:change={(e) => handleFileChange(e, (file) => editArtistImage = file)} class="border p-2 w-full" />
            </label>
            <div class="flex justify-end">
                <button class="bg-gray-500 text-white p-2 rounded mr-2" on:click={() => showEditModal.set(false)}>취소</button>
                <button class="bg-blue-500 text-white p-2 rounded" on:click={editArtist}>저장</button>
            </div>
        </div>
    </div>
{/if}

{#if $artists.length === 0}
    <p class="text-center text-gray-500">아티스트가 등록되어 있지 않습니다</p>
{:else}
    <table class="min-w-full bg-white">
        <thead>
            <tr>
                <th class="py-2 px-4 border-b">아티스트명</th>
                <th class="py-2 px-4 border-b">프로필</th>
                <th class="py-2 px-4 border-b">이미지</th>
                <th class="py-2 px-4 border-b">곡 관리 페이지</th>
                <th class="py-2 px-4 border-b">편집</th>
            </tr>
        </thead>
        <tbody>
            {#each $artists as artist}
                <tr>
                    <td class="py-2 px-4 border-b">{artist.name}</td>
                    <td class="py-2 px-4 border-b max-w-xs break-words">{artist.profile}</td>
                    <td class="py-2 px-4 border-b">
                        <img src={artist.image} alt={artist.name} class="h-16 w-16 object-cover rounded-full" />
                    </td>
                    <td class="py-2 px-4 border-b text-center">
                        <a href={`/admin/artists/${artist.id}/songs`} class="text-blue-500 hover:underline">곡 관리</a>
                    </td>
                    <td class="py-2 px-4 border-b text-center">
                        <button class="bg-yellow-500 text-white p-2 rounded" on:click={() => openEditModal(artist)}>편집</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}
