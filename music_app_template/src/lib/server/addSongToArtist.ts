import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function addSongToArtist(
  artistId: number, 
  title: string, 
  audioFile: File, 
  imageFile?: File
) {
  // 업로드 디렉토리 경로 설정
  const uploadDir = path.join(process.cwd(), 'static', 'uploads');
  
  // 오디오 파일 저장
  const audioFileName = `${uuidv4()}${path.extname(audioFile.name)}`;
  const audioFilePath = path.join(uploadDir, audioFileName);
  const audioBuffer = await audioFile.arrayBuffer();
  fs.writeFileSync(audioFilePath, Buffer.from(audioBuffer));

  // 이미지 파일 저장 (있는 경우)
  let imageFileName = null;
  if (imageFile) {
    imageFileName = `${uuidv4()}${path.extname(imageFile.name)}`;
    const imageFilePath = path.join(uploadDir, imageFileName);
    const imageBuffer = await imageFile.arrayBuffer();
    fs.writeFileSync(imageFilePath, Buffer.from(imageBuffer));
  }

  // 노래 정보를 데이터베이스에 저장
  const song = await prisma.song.create({
    data: {
      title,
      artistId,
      audio: `/uploads/${audioFileName}`,
      image: imageFileName ? `/uploads/${imageFileName}` : null,
    },
    include: {
      artist: true
    }
  });

  return song;
}
