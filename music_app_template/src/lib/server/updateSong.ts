import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function updateSong(
  id: number,
  title: string,
  audioFile?: File,
  imageFile?: File
) {
  let audioPath = null;
  let imagePath = null;

  if (audioFile) {
    // 오디오 파일을 저장할 경로 설정
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const audioFileName = `${uuidv4()}${path.extname(audioFile.name)}`;
    const audioFilePath = path.join(uploadDir, audioFileName);

    // 오디오 파일 저장
    const audioBuffer = await audioFile.arrayBuffer();
    fs.writeFileSync(audioFilePath, Buffer.from(audioBuffer));

    audioPath = `/uploads/${audioFileName}`;
  }

  if (imageFile) {
    // 이미지 파일을 저장할 경로 설정
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const imageFileName = `${uuidv4()}${path.extname(imageFile.name)}`;
    const imageFilePath = path.join(uploadDir, imageFileName);

    // 이미지 파일 저장
    const imageBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(imageFilePath, Buffer.from(imageBuffer));

    imagePath = `/uploads/${imageFileName}`;
  }

  // 곡 정보를 데이터베이스에서 업데이트
  const updatedSong = await prisma.song.update({
    where: { id },
    data: {
      title,
      ...(audioPath && { audio: audioPath }),
      ...(imagePath && { image: imagePath }),
    },
    include: {
      artist: true
    }
  });

  return updatedSong;
}
