<?php

namespace Database\Seeders;

use App\Models\Circuit;
use App\Models\Guide;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@guides.ma'],
            ['name' => 'Administrateur', 'password' => '123456', 'role' => 'admin']
        );

        User::firstOrCreate(
            ['email' => 'touriste@guides.ma'],
            ['name' => 'Touriste Test', 'password' => '123456', 'role' => 'tourist']
        );

        $guides = [
            [
                'name' => 'Youssef Alami', 'email' => 'youssef@guides.ma',
                'city' => 'Marrakech', 'languages' => 'Arabe, Français, Anglais', 'rate' => 300,
                'bio' => 'Guide officiel, passionné par l\'histoire de la médina.',
                'circuits' => [
                    ['title' => 'Médina de Marrakech', 'description' => 'Découverte des souks, de la place Jemaa el-Fna et des palais.', 'price' => 250, 'duration' => '4 heures'],
                    ['title' => 'Jardins et palmeraie', 'description' => 'Balade dans les jardins Majorelle et la palmeraie.', 'price' => 200, 'duration' => '3 heures'],
                ],
            ],
            [
                'name' => 'Salma Idrissi', 'email' => 'salma.idrissi@guides.ma',
                'city' => 'Fès', 'languages' => 'Arabe, Français', 'rate' => 250,
                'bio' => 'Spécialiste de l\'artisanat et des médersas de Fès.',
                'circuits' => [
                    ['title' => 'Vieille ville de Fès', 'description' => 'Tanneries, médersas et artisanat de la plus grande médina.', 'price' => 280, 'duration' => '5 heures'],
                    ['title' => 'Fès el-Jdid et Mellah', 'description' => 'Palais royal, mellah et jardins andalous.', 'price' => 220, 'duration' => '3 heures'],
                ],
            ],
            [
                'name' => 'Omar Bennani', 'email' => 'omar@guides.ma',
                'city' => 'Chefchaouen', 'languages' => 'Arabe, Espagnol, Anglais', 'rate' => 200,
                'bio' => 'Né à Chefchaouen, il vous fait découvrir la ville bleue.',
                'circuits' => [
                    ['title' => 'La ville bleue', 'description' => 'Ruelles bleues, kasbah et cascade Ras El Ma.', 'price' => 180, 'duration' => '3 heures'],
                    ['title' => 'Randonnée Akchour', 'description' => 'Randonnée vers les cascades d\'Akchour et le pont de Dieu.', 'price' => 300, 'duration' => '6 heures'],
                ],
            ],
            [
                'name' => 'Khadija Tazi', 'email' => 'khadija@guides.ma',
                'city' => 'Casablanca', 'languages' => 'Arabe, Français', 'rate' => 280,
                'bio' => 'Architecture, art déco et histoire moderne de Casablanca.',
                'circuits' => [
                    ['title' => 'Corniche et Hassan II', 'description' => 'Mosquée Hassan II, corniche et quartier Habous.', 'price' => 220, 'duration' => '3 heures'],
                    ['title' => 'Casablanca art déco', 'description' => 'Visite des bâtiments art déco du centre-ville.', 'price' => 200, 'duration' => '2 heures'],
                ],
            ],
            [
                'name' => 'Nadia Chraibi', 'email' => 'nadia@guides.ma',
                'city' => 'Essaouira', 'languages' => 'Arabe, Français, Espagnol', 'rate' => 260,
                'bio' => 'Médina côtière, port de pêche et gastronomie locale.',
                'circuits' => [
                    ['title' => 'Remparts d\'Essaouira', 'description' => 'Port de pêche, remparts et médina côtière.', 'price' => 150, 'duration' => '2 heures'],
                    ['title' => 'Essaouira gourmande', 'description' => 'Dégustation de produits locaux et arganier.', 'price' => 230, 'duration' => '4 heures'],
                ],
            ],
            [
                'name' => 'Imane Lahlou', 'email' => 'imane.lahlou@guides.ma',
                'city' => 'Rabat', 'languages' => 'Arabe, Français, Anglais', 'rate' => 270,
                'bio' => 'Capitale historique : kasbah, Chellah et tour Hassan.',
                'circuits' => [
                    ['title' => 'Rabat impériale', 'description' => 'Kasbah des Oudayas, tour Hassan et mausolée Mohammed V.', 'price' => 240, 'duration' => '4 heures'],
                    ['title' => 'Chellah et médina de Rabat', 'description' => 'Site antique de Chellah et souks de la médina.', 'price' => 200, 'duration' => '3 heures'],
                ],
            ],
        ];

        foreach ($guides as $g) {
            $user = User::firstOrCreate(
                ['email' => $g['email']],
                ['name' => $g['name'], 'password' => '123456', 'role' => 'guide']
            );

            $guide = Guide::firstOrCreate(
                ['user_id' => $user->id],
                ['city' => $g['city'], 'languages' => $g['languages'], 'rate' => $g['rate'], 'bio' => $g['bio']]
            );

            foreach ($g['circuits'] as $c) {
                Circuit::firstOrCreate(
                    ['guide_id' => $guide->id, 'title' => $c['title']],
                    [
                        'description' => $c['description'],
                        'price' => $c['price'],
                        'duration' => $c['duration'],
                        'city' => $g['city'],
                    ]
                );
            }
        }
    }
}