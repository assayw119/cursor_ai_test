import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { addArtist } from './addArtist';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('addArtist', () => {
  const testImageBuffer = Buffer.from('dummy content');

  beforeAll(async () => {
    // 테스트용 디렉토리 만들기
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // 테스트 데이터 삭제
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

  it('should add a new artist to the database', async () => {
    const testFile = new File([testImageBuffer], 'test.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
    testFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    const artist = await addArtist('Test Artist', 'This is a test profile.', testFile);

    expect(artist).toBeDefined();
    expect(artist.name).toBe('Test Artist');
    expect(artist.profile).toBe('This is a test profile.');
    expect(artist.image).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
  });
}); 