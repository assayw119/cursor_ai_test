import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export async function addArtist(name: string, profile: string, imageFile: File) {
  // 이미지 파일을 저장할 경로 설정
  const uploadDir = path.join(process.cwd(), 'static', 'uploads');
  const fileName = `${uuidv4()}${path.extname(imageFile.name)}`;
  const filePath = path.join(uploadDir, fileName);

  // 이미지 파일 저장
  const buffer = await imageFile.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(buffer));

  // 아티스트 정보를 데이터베이스에 저장
  const artist = await prisma.artist.create({
    data: {
      name,
      profile,
      image: `/uploads/${fileName}`,
    },
  });

  return artist;
}
