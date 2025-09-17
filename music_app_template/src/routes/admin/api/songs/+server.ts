import { json } from '@sveltejs/kit';
import { addSong } from '$lib/server/addSong';
import { updateSong } from '$lib/server/updateSong';

export const POST = async ({ request }: { request: Request }) => {
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

export const PUT = async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const audioFile = formData.get('audio');
    const imageFile = formData.get('image');

    if (!id || !title) {
        return json({ error: 'Invalid input' }, { status: 400 });
    }
    try {
        const song = await updateSong(
            Number(id), 
            title as string, 
            audioFile as File || undefined, 
            imageFile as File || undefined
        );
        return json(song, { status: 200 });
    } catch (error) {
        console.error(error);
        return json({ error: 'Failed to update song' }, { status: 500 });
    }
};
