import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

export async function addSong(title: string, artistId: number, audioFile: File, imageFile?: File) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = join(__filename, '..', '..', '..', '..');
    const uploadsDir = join(__dirname, 'static', 'uploads');

    // 오디오 파일 저장
    const audioBuffer = await audioFile.arrayBuffer();
    const audioFileName = `${Date.now()}_${audioFile.name}`;
    const audioPath = join(uploadsDir, audioFileName);
    await writeFile(audioPath, Buffer.from(audioBuffer));

    // 이미지 파일 저장 (있는 경우)
    let imageFileName = null;
    if (imageFile) {
        const imageBuffer = await imageFile.arrayBuffer();
        imageFileName = `${Date.now()}_${imageFile.name}`;
        const imagePath = join(uploadsDir, imageFileName);
        await writeFile(imagePath, Buffer.from(imageBuffer));
    }

    // 데이터베이스에 저장
    const song = await prisma.song.create({
        data: {
            title,
            artistId,
            audio: `/uploads/${audioFileName}`,
            image: imageFileName ? `/uploads/${imageFileName}` : null
        },
        include: {
            artist: true
        }
    });

    return song;
}
