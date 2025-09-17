import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { addSong } from './addSong';
import { addArtist } from './addArtist';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('addSong', () => {
  const testImageBuffer = Buffer.from('dummy image content');
  const testAudioBuffer = Buffer.from('dummy audio content');
  let testArtistId: number;

  beforeAll(async () => {
    try {
      // 테스트용 디렉토리 만들기
      const uploadDir = path.join(process.cwd(), 'static', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 테스트용 아티스트 생성
      const testImageFile = new File([testImageBuffer], 'test_artist.png', {
        type: 'image/png',
        lastModified: new Date().getTime(),
      });

      // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
      testImageFile.arrayBuffer = async function() {
        return testImageBuffer.buffer;
      };

      const testArtist = await addArtist('Test Artist for Song', 'This is a test artist profile for song testing.', testImageFile);
      testArtistId = testArtist.id;
    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // 테스트 데이터 삭제
      const testArtist = await prisma.artist.findFirst({
        where: { name: 'Test Artist for Song' },
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
      if (fs.existsSync(uploadDir)) {
        fs.readdirSync(uploadDir).forEach(file => {
          if (file.startsWith('test')) {
            try {
              fs.unlinkSync(path.join(uploadDir, file));
            } catch (error) {
              console.warn(`Failed to delete test file ${file}:`, error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  it('should add a new song with image and audio to the database', async () => {
    try {
      const testImageFile = new File([testImageBuffer], 'test_song.png', {
        type: 'image/png',
        lastModified: new Date().getTime(),
      });

      const testAudioFile = new File([testAudioBuffer], 'test_song.mp3', {
        type: 'audio/mpeg',
        lastModified: new Date().getTime(),
      });

      // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
      testImageFile.arrayBuffer = async function() {
        return testImageBuffer.buffer;
      };

      testAudioFile.arrayBuffer = async function() {
        return testAudioBuffer.buffer;
      };

      const song = await addSong('Test Song', testArtistId, testAudioFile, testImageFile);

      expect(song).toBeDefined();
      expect(song.title).toBe('Test Song');
      expect(song.artistId).toBe(testArtistId);
      expect(song.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.mp3$/);
      expect(song.image).toMatch(/^\/uploads\/[a-f0-9-]+\.png$/);
      expect(song.artist).toBeDefined();
      expect(song.artist.name).toBe('Test Artist for Song');
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should add a new song without image to the database', async () => {
    const testAudioFile = new File([testAudioBuffer], 'test_song_no_image.mp3', {
      type: 'audio/mpeg',
      lastModified: new Date().getTime(),
    });

    // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
    testAudioFile.arrayBuffer = async function() {
      return testAudioBuffer.buffer;
    };

    const song = await addSong('Test Song No Image', testArtistId, testAudioFile);

    expect(song).toBeDefined();
    expect(song.title).toBe('Test Song No Image');
    expect(song.artistId).toBe(testArtistId);
    expect(song.audio).toMatch(/^\/uploads\/[a-f0-9-]+\.mp3$/);
    expect(song.image).toBeNull();
    expect(song.artist).toBeDefined();
    expect(song.artist.name).toBe('Test Artist for Song');
  });

  it('should verify files are actually saved to disk', async () => {
    const testImageFile = new File([testImageBuffer], 'test_song_disk.png', {
      type: 'image/png',
      lastModified: new Date().getTime(),
    });

    const testAudioFile = new File([testAudioBuffer], 'test_song_disk.mp3', {
      type: 'audio/mpeg',
      lastModified: new Date().getTime(),
    });

    // 오류 방지를 위해 File.prototype.arrayBuffer를 오버라이드
    testImageFile.arrayBuffer = async function() {
      return testImageBuffer.buffer;
    };

    testAudioFile.arrayBuffer = async function() {
      return testAudioBuffer.buffer;
    };

    const song = await addSong('Test Song Disk Check', testArtistId, testAudioFile, testImageFile);

    // 파일이 실제로 디스크에 저장되었는지 확인
    const uploadDir = path.join(process.cwd(), 'static', 'uploads');
    
    const audioFileName = song.audio.replace('/uploads/', '');
    const imageFileName = song.image?.replace('/uploads/', '');
    
    const audioFilePath = path.join(uploadDir, audioFileName);
    const imageFilePath = path.join(uploadDir, imageFileName!);

    expect(fs.existsSync(audioFilePath)).toBe(true);
    expect(fs.existsSync(imageFilePath)).toBe(true);
    
    // 파일 내용 확인
    const savedAudioBuffer = fs.readFileSync(audioFilePath);
    const savedImageBuffer = fs.readFileSync(imageFilePath);
    
    expect(savedAudioBuffer).toEqual(testAudioBuffer);
    expect(savedImageBuffer).toEqual(testImageBuffer);
  });
});
