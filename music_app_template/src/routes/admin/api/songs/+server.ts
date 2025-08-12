import { addSong } from '$lib/server/addSong';
import { json } from '@sveltejs/kit';

export const POST = async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title');
    const artistId = formData.get('artistId');
    const audioFile = formData.get('audio');
    const imageFile = formData.get('image');

    if (!title || !artistId || !audioFile) {
        return json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
        const song = await addSong(
            title as string, 
            Number(artistId), 
            audioFile as File, 
            imageFile as File || undefined
        );
        return json(song, { status: 201 });
    } catch (error) {
        console.error(error);
        return json({ error: 'Failed to add song' }, { status: 500 });
    }
};
