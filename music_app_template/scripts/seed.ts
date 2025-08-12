import { PrismaClient } from '@prisma/client';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

async function seed() {
    try {
        console.log('🌱 샘플 데이터 추가를 시작합니다...');

        // Shattered_Skies 아티스트 추가
        const shatteredSkiesImage = await readFile(join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'image.jpg'));
        const shatteredSkiesDescription = await readFile(join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'description.txt'), 'utf-8');
        
        const shatteredSkies = await prisma.artist.create({
            data: {
                name: 'Shattered_Skies',
                profile: shatteredSkiesDescription.trim(),
                image: '/img/artist_default.webp' // 기본 이미지 사용
            }
        });

        console.log('✅ Shattered_Skies 아티스트 추가 완료');

        // Shattered_Skies 노래들 추가
        const songs = [
            {
                title: '날개를펴고',
                audioFile: join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'songs', '날개를펴고.mp3'),
                imageFile: join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'songs', '날개를펴고.jpg')
            },
            {
                title: '푸른충동',
                audioFile: join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'songs', '푸른충동.mp3'),
                imageFile: join(__dirname, '..', 'sample_data', 'Shattered_Skies', 'songs', '푸른충동.jpg')
            }
        ];

        for (const song of songs) {
            const audioBuffer = await readFile(song.audioFile);
            const imageBuffer = await readFile(song.imageFile);
            
            // 파일을 uploads 디렉토리에 복사
            const audioFileName = `${Date.now()}_${song.title}.mp3`;
            const imageFileName = `${Date.now()}_${song.title}.jpg`;
            
            await prisma.song.create({
                data: {
                    title: song.title,
                    artistId: shatteredSkies.id,
                    audio: `/uploads/${audioFileName}`,
                    image: `/uploads/${imageFileName}`
                }
            });
        }

        console.log('✅ Shattered_Skies 노래들 추가 완료');

        // Summer_Jin 아티스트 추가
        const summerJinImage = await readFile(join(__dirname, '..', 'sample_data', 'Summer_Jin', 'image.jpg'));
        const summerJinDescription = await readFile(join(__dirname, '..', 'sample_data', 'Summer_Jin', 'description.txt'), 'utf-8');
        
        const summerJin = await prisma.artist.create({
            data: {
                name: 'Summer_Jin',
                profile: summerJinDescription.trim(),
                image: '/img/artist_default.webp' // 기본 이미지 사용
            }
        });

        console.log('✅ Summer_Jin 아티스트 추가 완료');

        // Summer_Jin 노래들 추가
        const summerJinSongs = [
            { title: 'the_a', audioFile: 'the_a.mp3', imageFile: 'the_a.jpg' },
            { title: 'the_b', audioFile: 'the_b.mp3', imageFile: 'the_b.jpg' },
            { title: 'the_c', audioFile: 'the_c.mp3', imageFile: 'the_c.jpg' }
        ];

        for (const song of summerJinSongs) {
            const audioBuffer = await readFile(join(__dirname, '..', 'sample_data', 'Summer_Jin', 'songs', song.audioFile));
            const imageBuffer = await readFile(join(__dirname, '..', 'sample_data', 'Summer_Jin', 'songs', song.imageFile));
            
            const audioFileName = `${Date.now()}_${song.title}.mp3`;
            const imageFileName = `${Date.now()}_${song.title}.jpg`;
            
            await prisma.song.create({
                data: {
                    title: song.title,
                    artistId: summerJin.id,
                    audio: `/uploads/${audioFileName}`,
                    image: `/uploads/${imageFileName}`
                }
            });
        }

        console.log('✅ Summer_Jin 노래들 추가 완료');
        console.log('🎉 모든 샘플 데이터 추가가 완료되었습니다!');

    } catch (error) {
        console.error('❌ 샘플 데이터 추가 중 오류 발생:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed(); 