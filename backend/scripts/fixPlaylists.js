const mongoose = require('mongoose');
const Playlist = require('../models/Playlist');

const MONGODB_URI = 'mongodb://localhost:27017/hospital_screens';

async function fixPlaylists() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB\'ye bağlandı');

        const playlists = await Playlist.find();
        console.log(`${playlists.length} playlist bulundu`);

        for (const playlist of playlists) {
            // mediaItems'ları medias'a taşı
            if (playlist.mediaItems && playlist.mediaItems.length > 0) {
                playlist.medias = playlist.mediaItems.map(item => ({
                    mediaId: item.media,
                    duration: item.duration
                }));
                playlist.mediaItems = undefined;
                await playlist.save();
                console.log(`Playlist düzeltildi: ${playlist.name}`);
            }
        }

        console.log('Tüm playlist\'ler düzeltildi');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixPlaylists(); 