import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { updateArtist } from './updateArtist';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('updateArtist', () => {
  const testImageBuffer = Buffer.from('dummy content');

  beforeAll(async () => {
    // 테스트용 디렉토리 만들기
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 테스트용 아티스트 추가
    await prisma.artist.create({
      data: {
        name: 'Original Artist',
        profile: 'Original profile',
        image: '/static/uploads/original.png',
      },
    });
  });

  afterAll(async () => {
    // 테스트 데이터를 삭제
    const testArtist = await prisma.artist.findFirst({
      where: { name: 'Test Artist' },
      include: { songs: true }
    });

    if (testArtist) {
      if (testArtist.songs.length > 0) {
        await prisma.song.deleteMany({
          where: { artistId: testArtist.id }
        });
      }

      await prisma.artist.delete({
        where: { id: testArtist.id }
      });
    }

    // 업로드된 파일을 삭제
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    fs.readdirSync(uploadDir).forEach(file => {
      if (file.startsWith('test')) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
    });

    await prisma.$disconnect();
  });

  it('should update an existing artist in the database', async () => {
    const testFile = new File([testImageBuffer], 'test.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
    testFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    const originalArtist = await prisma.artist.findFirst({
      where: { name: 'Original Artist' },
    });

    if (!originalArtist) {
      throw new Error('Original artist not found');
    }

    const updatedArtist = await updateArtist(originalArtist.id, 'Updated Artist', 'Updated profile', testFile);

    expect(updatedArtist).toBeDefined();
    expect(updatedArtist.name).toBe('Updated Artist');
    expect(updatedArtist.profile).toBe('Updated profile');
    expect(updatedArtist.image).toMatch(/^\/static\/uploads\/test\.png$/);
  });
});
