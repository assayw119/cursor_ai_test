import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function updateArtist(id: number, name: string, profile: string, imageFile?: File) {
  let imagePath = null;

  if (imageFile) {
    // 이미지 파일을 저장할 경로 설정
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    const filePath = path.join(uploadDir, imageFile.name);

    // 이미지 파일 저장
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    imagePath = `/static/uploads/${imageFile.name}`;
  }

  // 아티스트 정보를 데이터베이스에서 업데이트
  const updatedArtist = await prisma.artist.update({
    where: { id },
    data: {
      name,
      profile,
      ...(imagePath && { image: imagePath }),
    },
  });

  return updatedArtist;
}
