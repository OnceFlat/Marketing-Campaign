<?php

namespace Database\Seeders;

use App\Models\Aktivitas;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $permissions = collect([
            'kelola campaign',
            'kelola aktivitas',
            'kelola laporan',
            'kelola user',
        ])->map(fn ($permission) => Permission::firstOrCreate([
            'name' => $permission,
            'guard_name' => 'web',
        ]));

        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $marketingRole = Role::firstOrCreate(['name' => 'marketing', 'guard_name' => 'web']);
        $adminRole->syncPermissions($permissions);
        $marketingRole->syncPermissions([
            'kelola campaign',
            'kelola aktivitas',
            'kelola laporan',
        ]);

        $admin = User::updateOrCreate([
            'email' => 'admin@campaign.test',
        ], [
            'name' => 'Admin Marketing',
            'password' => 'AdminCampaign2026!',
        ]);
        $admin->syncRoles([$adminRole]);

        $marketing = User::updateOrCreate([
            'email' => 'marketing@campaign.test',
        ], [
            'name' => 'Staff Marketing',
            'password' => 'MarketingCampaign2026!',
        ]);
        $marketing->assignRole($marketingRole);

        $campaignRows = [
            [
                'name' => 'Launching Produk Digital',
                'objective' => 'Meningkatkan awareness dan mendapatkan prospek awal dari kanal digital.',
                'channel' => 'Instagram Ads',
                'budget' => 7500000,
                'views' => 18500,
                'likes' => 1320,
                'comments' => 245,
                'shares' => 168,
                'start_date' => now()->toDateString(),
                'end_date' => now()->addDays(30)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'Promo Hunian Awal Tahun',
                'objective' => 'Mengumpulkan leads calon pembeli untuk unit hunian unggulan.',
                'channel' => 'Facebook Ads',
                'budget' => 12500000,
                'views' => 42900,
                'likes' => 2580,
                'comments' => 384,
                'shares' => 292,
                'start_date' => now()->subMonths(2)->startOfMonth()->toDateString(),
                'end_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'status' => 'posted',
            ],
            [
                'name' => 'Open House Cluster Asri',
                'objective' => 'Mengundang audiens lokal menghadiri acara open house.',
                'channel' => 'Instagram Ads',
                'budget' => 6200000,
                'views' => 14600,
                'likes' => 970,
                'comments' => 126,
                'shares' => 88,
                'start_date' => now()->subDays(10)->toDateString(),
                'end_date' => now()->addDays(12)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'KPR Mudah untuk Keluarga',
                'objective' => 'Mengedukasi target pasar tentang program pembiayaan rumah.',
                'channel' => 'TikTok Ads',
                'budget' => 9800000,
                'views' => 53400,
                'likes' => 4110,
                'comments' => 617,
                'shares' => 432,
                'start_date' => now()->subDays(35)->toDateString(),
                'end_date' => now()->subDays(5)->toDateString(),
                'status' => 'posted',
            ],
            [
                'name' => 'Investasi Properti Komersial',
                'objective' => 'Menjangkau investor potensial untuk area komersial baru.',
                'channel' => 'LinkedIn Ads',
                'budget' => 15000000,
                'views' => 8100,
                'likes' => 346,
                'comments' => 72,
                'shares' => 49,
                'start_date' => now()->addDays(5)->toDateString(),
                'end_date' => now()->addDays(45)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'Virtual Tour Perumahan',
                'objective' => 'Meningkatkan interaksi melalui konten video tur properti.',
                'channel' => 'YouTube Ads',
                'budget' => 8700000,
                'views' => 37900,
                'likes' => 1820,
                'comments' => 294,
                'shares' => 231,
                'start_date' => now()->subDays(3)->toDateString(),
                'end_date' => now()->addDays(27)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'Diskon Booking Fee',
                'objective' => 'Mendorong konversi calon pelanggan melalui promo terbatas.',
                'channel' => 'Google Ads',
                'budget' => 11000000,
                'views' => 26700,
                'likes' => 1130,
                'comments' => 204,
                'shares' => 152,
                'start_date' => now()->subDays(20)->toDateString(),
                'end_date' => now()->addDays(10)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'Cerita Penghuni Bahagia',
                'objective' => 'Menguatkan kepercayaan merek melalui testimoni pelanggan.',
                'channel' => 'Instagram Reels',
                'budget' => 4800000,
                'views' => 29800,
                'likes' => 2940,
                'comments' => 411,
                'shares' => 370,
                'start_date' => now()->subMonth()->startOfMonth()->toDateString(),
                'end_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'status' => 'posted',
            ],
            [
                'name' => 'Lokasi Strategis Dekat Kota',
                'objective' => 'Menonjolkan akses lokasi dan fasilitas sekitar proyek.',
                'channel' => 'Meta Ads',
                'budget' => 6900000,
                'views' => 22100,
                'likes' => 1420,
                'comments' => 196,
                'shares' => 123,
                'start_date' => now()->addDays(12)->toDateString(),
                'end_date' => now()->addDays(42)->toDateString(),
                'status' => 'active',
            ],
            [
                'name' => 'Pameran Properti Akhir Pekan',
                'objective' => 'Meningkatkan kunjungan ke booth penjualan pada agenda pameran.',
                'channel' => 'WhatsApp Broadcast',
                'budget' => 3500000,
                'views' => 9600,
                'likes' => 512,
                'comments' => 84,
                'shares' => 96,
                'start_date' => now()->subDays(16)->toDateString(),
                'end_date' => now()->subDays(12)->toDateString(),
                'status' => 'cancelled',
            ],
        ];

        foreach ($campaignRows as $row) {
            Campaign::updateOrCreate(
                ['name' => $row['name']],
                ['user_id' => $marketing->id, ...$row],
            );
        }

        $campaigns = Campaign::whereIn('name', collect($campaignRows)->pluck('name'))
            ->get()
            ->keyBy('name');

        $aktivitasRows = [
            [
                'campaign' => 'Launching Produk Digital',
                'title' => 'Riset audience dan konten iklan',
                'description' => 'Menentukan persona, angle pesan, dan kebutuhan materi campaign.',
                'activity_date' => now()->addDay()->toDateString(),
                'status' => 'in_progress',
            ],
            [
                'campaign' => 'Launching Produk Digital',
                'title' => 'Penyusunan materi visual launching',
                'description' => 'Menyiapkan banner dan video pendek untuk iklan digital.',
                'activity_date' => now()->addDays(4)->toDateString(),
                'status' => 'planned',
            ],
            [
                'campaign' => 'Promo Hunian Awal Tahun',
                'title' => 'Evaluasi hasil leads campaign',
                'description' => 'Merekap leads masuk dan menghitung konversi awal.',
                'activity_date' => now()->subMonth()->endOfMonth()->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Open House Cluster Asri',
                'title' => 'Publikasi undangan open house',
                'description' => 'Menayangkan materi promosi untuk audiens lokal.',
                'activity_date' => now()->subDays(5)->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Open House Cluster Asri',
                'title' => 'Konfirmasi daftar pengunjung',
                'description' => 'Menghubungi calon pengunjung yang telah mengisi formulir.',
                'activity_date' => now()->addDays(3)->toDateString(),
                'status' => 'in_progress',
            ],
            [
                'campaign' => 'KPR Mudah untuk Keluarga',
                'title' => 'Produksi video edukasi KPR',
                'description' => 'Membuat materi singkat proses pengajuan KPR.',
                'activity_date' => now()->subDays(26)->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Investasi Properti Komersial',
                'title' => 'Segmentasi target investor',
                'description' => 'Menyusun daftar industri dan jabatan target LinkedIn.',
                'activity_date' => now()->addDays(7)->toDateString(),
                'status' => 'planned',
            ],
            [
                'campaign' => 'Virtual Tour Perumahan',
                'title' => 'Pengambilan gambar unit contoh',
                'description' => 'Merekam tur unit dan lingkungan fasilitas utama.',
                'activity_date' => now()->subDay()->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Virtual Tour Perumahan',
                'title' => 'Optimasi iklan video YouTube',
                'description' => 'Memantau view rate dan menyesuaikan target audiens.',
                'activity_date' => now()->addDays(6)->toDateString(),
                'status' => 'in_progress',
            ],
            [
                'campaign' => 'Diskon Booking Fee',
                'title' => 'Review performa landing page promo',
                'description' => 'Mengecek sumber trafik dan kualitas pengisian formulir.',
                'activity_date' => now()->subDays(2)->toDateString(),
                'status' => 'cancelled',
            ],
            [
                'campaign' => 'Cerita Penghuni Bahagia',
                'title' => 'Wawancara pelanggan untuk testimoni',
                'description' => 'Mengumpulkan pengalaman penghuni untuk konten reels.',
                'activity_date' => now()->subDays(38)->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Cerita Penghuni Bahagia',
                'title' => 'Editing video testimoni',
                'description' => 'Memfinalisasi subtitle dan potongan video publikasi.',
                'activity_date' => now()->subDays(31)->toDateString(),
                'status' => 'done',
            ],
            [
                'campaign' => 'Lokasi Strategis Dekat Kota',
                'title' => 'Pemetaan fasilitas sekitar proyek',
                'description' => 'Membuat materi jarak sekolah, pusat belanja, dan akses jalan.',
                'activity_date' => now()->addDays(15)->toDateString(),
                'status' => 'planned',
            ],
            [
                'campaign' => 'Pameran Properti Akhir Pekan',
                'title' => 'Persiapan materi booth pameran',
                'description' => 'Mengatur brosur dan materi digital untuk pengunjung.',
                'activity_date' => now()->subDays(18)->toDateString(),
                'status' => 'cancelled',
            ],
            [
                'campaign' => 'Promo Hunian Awal Tahun',
                'title' => 'Penyusunan laporan akhir campaign',
                'description' => 'Menyajikan anggaran, engagement, dan hasil tindak lanjut leads.',
                'activity_date' => now()->subDays(20)->toDateString(),
                'status' => 'done',
            ],
        ];

        foreach ($aktivitasRows as $row) {
            $campaign = $campaigns->get($row['campaign']);

            Aktivitas::updateOrCreate(
                [
                    'campaign_id' => $campaign->id,
                    'title' => $row['title'],
                ],
                [
                    'user_id' => $marketing->id,
                    'description' => $row['description'],
                    'activity_date' => $row['activity_date'],
                    'status' => $row['status'],
                ],
            );
        }
    }
}

