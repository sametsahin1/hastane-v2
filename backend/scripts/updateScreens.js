const mongoose = require('mongoose');
const Screen = require('../models/Screen');

// MongoDB bağlantı URL'nizi buraya ekleyin
const MONGODB_URI = 'mongodb://localhost:27017/hospital_screens';

async function updateScreens() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB\'ye bağlandı');

        // Tüm ekranları bul
        const screens = await Screen.find();
        console.log(`${screens.length} ekran bulundu`);

        // Her ekranı güncelle
        for (const screen of screens) {
            if (!screen.name || screen.name === 'İsimsiz Ekran') {
                screen.name = `Ekran ${screen._id.toString().slice(-4)}`;
                await screen.save();
                console.log(`Ekran güncellendi: ${screen.name}`);
            }
        }

        console.log('Tüm ekranlar güncellendi');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB bağlantısı kapatıldı');
    }
}

updateScreens(); 