import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function deleteSong(id: number) {
  // 곡 정보를 먼저 조회
  const song = await prisma.song.findUnique({
    where: { id },
    include: {
      artist: true
    }
  });

  if (!song) {
    throw new Error('Song not found');
  }

  // 곡을 데이터베이스에서 삭제
  const deletedSong = await prisma.song.delete({
    where: { id },
    include: {
      artist: true
    }
  });

  // 관련 파일들을 파일 시스템에서 삭제
  try {
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    
    // 오디오 파일 삭제
    if (song.audio) {
      const audioFileName = song.audio.replace('/uploads/', '');
      const audioFilePath = path.join(uploadDir, audioFileName);
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }

    // 이미지 파일 삭제
    if (song.image) {
      const imageFileName = song.image.replace('/uploads/', '');
      const imageFilePath = path.join(uploadDir, imageFileName);
      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
      }
    }
  } catch (error) {
    console.warn('Failed to delete song files:', error);
    // 파일 삭제 실패해도 데이터베이스 삭제는 성공으로 처리
  }

  return deletedSong;
}
