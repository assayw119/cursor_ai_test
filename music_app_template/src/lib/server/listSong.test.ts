import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { listSong } from './listSong';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

describe('listSong', () => {
  let testArtist1Id: number;
  let testArtist2Id: number;

  beforeAll(async () => {
    try {
      // 테스트용 디렉토리 만들기
      const uploadDir = path.join(process.cwd(), 'static', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // 테스트용 아티스트 1 생성 (여러 곡을 가진 아티스트)
      const testArtist1 = await prisma.artist.create({
        data: {
          name: 'Test Artist 1',
          profile: 'This is a test profile for artist 1.',
          image: '/uploads/test_artist1.png',
          songs: {
            create: [
              {
                title: 'Test Song A',
                audio: '/uploads/test_song_a.mp3',
                image: '/uploads/test_song_a.png',
              },
              {
                title: 'Test Song B',
                audio: '/uploads/test_song_b.mp3',
                image: '/uploads/test_song_b.png',
              },
              {
                title: 'Test Song C',
                audio: '/uploads/test_song_c.mp3',
                image: null, // 이미지가 없는 곡
              },
            ],
          },
        },
      });
      testArtist1Id = testArtist1.id;

      // 테스트용 아티스트 2 생성 (한 곡만 가진 아티스트)
      const testArtist2 = await prisma.artist.create({
        data: {
          name: 'Test Artist 2',
          profile: 'This is a test profile for artist 2.',
          image: '/uploads/test_artist2.png',
          songs: {
            create: [
              {
                title: 'Test Song X',
                audio: '/uploads/test_song_x.mp3',
                image: '/uploads/test_song_x.png',
              },
            ],
          },
        },
      });
      testArtist2Id = testArtist2.id;

      // 이미지가 없는 아티스트 3 생성
      const testArtist3 = await prisma.artist.create({
        data: {
          name: 'Test Artist 3',
          profile: 'This is a test profile for artist 3.',
          image: null,
          songs: {
            create: [
              {
                title: 'Test Song Y',
                audio: '/uploads/test_song_y.mp3',
                image: null,
              },
            ],
          },
        },
      });

    } catch (error) {
      console.error('Error during test setup:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // 테스트 데이터를 삭제
      const testArtists = await prisma.artist.findMany({
        where: { 
          name: { 
            in: ['Test Artist 1', 'Test Artist 2', 'Test Artist 3'] 
          } 
        },
        include: { songs: true }
      });

      for (const artist of testArtists) {
        if (artist.songs.length > 0) {
          await prisma.song.deleteMany({
            where: { artistId: artist.id }
          });
        }

        await prisma.artist.delete({
          where: { id: artist.id }
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

  it('should list all songs with artist information', async () => {
    try {
      const songs = await listSong();

      expect(songs).toBeDefined();
      expect(songs.length).toBeGreaterThanOrEqual(4); // 최소 4곡 (3 + 1 + 1)

      // 모든 곡이 아티스트 정보를 포함하고 있는지 확인
      songs.forEach(song => {
        expect(song.artist).toBeDefined();
        expect(song.artist.id).toBeDefined();
        expect(song.artist.name).toBeDefined();
        expect(song.title).toBeDefined();
        expect(song.audio).toBeDefined();
      });

      // 제목 순으로 정렬되어 있는지 확인
      const titles = songs.map(song => song.title);
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should list songs for a specific artist by ID', async () => {
    try {
      const songs = await listSong(testArtist1Id);

      expect(songs).toBeDefined();
      expect(songs.length).toBe(3);

      // 모든 곡이 해당 아티스트의 것인지 확인
      songs.forEach(song => {
        expect(song.artistId).toBe(testArtist1Id);
        expect(song.artist.id).toBe(testArtist1Id);
        expect(song.artist.name).toBe('Test Artist 1');
      });

      // 곡 제목들이 예상된 것인지 확인
      const titles = songs.map(song => song.title);
      expect(titles).toContain('Test Song A');
      expect(titles).toContain('Test Song B');
      expect(titles).toContain('Test Song C');

      // 제목 순으로 정렬되어 있는지 확인
      const sortedTitles = [...titles].sort();
      expect(titles).toEqual(sortedTitles);

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should list songs for another specific artist by ID', async () => {
    try {
      const songs = await listSong(testArtist2Id);

      expect(songs).toBeDefined();
      expect(songs.length).toBe(1);

      const song = songs[0];
      expect(song.artistId).toBe(testArtist2Id);
      expect(song.artist.id).toBe(testArtist2Id);
      expect(song.artist.name).toBe('Test Artist 2');
      expect(song.title).toBe('Test Song X');

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should handle songs without images correctly', async () => {
    try {
      const songs = await listSong();

      // 이미지가 없는 곡들이 올바르게 처리되는지 확인
      const songsWithoutImage = songs.filter(song => song.image === null);
      expect(songsWithoutImage.length).toBeGreaterThan(0);

      songsWithoutImage.forEach(song => {
        expect(song.image).toBeNull();
        expect(song.audio).toBeDefined();
        expect(song.title).toBeDefined();
        expect(song.artist).toBeDefined();
      });

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should handle artists without images correctly', async () => {
    try {
      const songs = await listSong();

      // 아티스트 이미지가 없는 곡들이 올바르게 처리되는지 확인
      const songsWithArtistWithoutImage = songs.filter(song => song.artist.image === null);
      expect(songsWithArtistWithoutImage.length).toBeGreaterThan(0);

      songsWithArtistWithoutImage.forEach(song => {
        expect(song.artist.image).toBeNull();
        expect(song.artist.name).toBeDefined();
        expect(song.artist.profile).toBeDefined();
      });

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should return empty array for non-existent artist ID', async () => {
    try {
      const nonExistentArtistId = 99999;
      const songs = await listSong(nonExistentArtistId);

      expect(songs).toBeDefined();
      expect(songs.length).toBe(0);
      expect(Array.isArray(songs)).toBe(true);

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });

  it('should include all required song and artist fields', async () => {
    try {
      const songs = await listSong();

      expect(songs.length).toBeGreaterThan(0);

      songs.forEach(song => {
        // 곡 필드 확인
        expect(song.id).toBeDefined();
        expect(song.title).toBeDefined();
        expect(song.artistId).toBeDefined();
        expect(song.audio).toBeDefined();
        expect(song.image).toBeDefined(); // null일 수 있음

        // 아티스트 필드 확인
        expect(song.artist.id).toBeDefined();
        expect(song.artist.name).toBeDefined();
        expect(song.artist.profile).toBeDefined();
        expect(song.artist.image).toBeDefined(); // null일 수 있음
        // songs 필드는 include하지 않았으므로 확인하지 않음
      });

    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  });
});
