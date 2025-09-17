import { PrismaClient } from '@prisma/client';
import type { SongWithArtist } from '$lib/type';

const prisma = new PrismaClient();

export async function listSong(artistId?: number): Promise<SongWithArtist[]> {
  const whereClause = artistId ? { artistId } : {};

  const songs = await prisma.song.findMany({
    where: whereClause,
    include: {
      artist: true,
    },
    orderBy: {
      title: 'asc',
    },
  });

  return songs;
}
