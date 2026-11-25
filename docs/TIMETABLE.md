# Timetable Latihan Operasi Siber — CyberWar Simulation

Rangkaian penggunaan aplikasi **ops-siber** dari awal sampai akhir latihan, disusun mengikuti lima **Tahapan Operasi Siber**: Perencanaan → Persiapan → Pelaksanaan → Pengendalian → Pencapaian, ditambah Pra-Operasi dan Pasca-Operasi.

## Cara membaca

| Kolom | Penjelasan |
|---|---|
| **Waktu – Asumsi** | Waktu operasi sebenarnya yang disimulasikan (skenario latihan). **H** = hari pelaksanaan serangan; **H-n / H+n** = n hari sebelum / sesudah. Jam dalam WIB. |
| **Waktu – Nyata** | Waktu di aplikasi, mengikuti penghitung **T+jj:mm:ss** di navbar (dihitung sejak War Room dibuka). Durasi proses otomatis adalah durasi riil aplikasi; sisanya perkiraan waktu operator mengamati & mengklik. |
| **Serangan Singapura (dari sisi Blue Team)** | Serangan balik Singapura terhadap aset Indonesia yang terlihat oleh Blue Team di **Alert Feed** (beserta kode rule-nya). |
| **Kegiatan – Red Team** | Apa yang dilakukan operator Red Team (halaman **RED TEAM**). |
| **Kegiatan – Blue Team** | Apa yang dilakukan operator Blue Team (halaman **BLUE TEAM**). |
| **Keterangan** | Hasil yang terlihat di aplikasi, catatan teknis, dan hal yang perlu diperhatikan. |

> **Catatan durasi otomatis.** Satu langkah Red berlangsung ±1,1 detik (Perencanaan 3 langkah ≈ 3,3 dtk · Persiapan 2 ≈ 2,2 dtk · Pelaksanaan 6 ≈ 6,6 dtk · Pengendalian 2 ≈ 2,2 dtk · Pencapaian 2 ≈ 2,2 dtk). Kegiatan Blue dalam satu tahap mulai **serentak** lalu selesai bergiliran tiap 0,7 detik (Perencanaan 3 kegiatan ≈ 2,6 dtk · Persiapan 6 ≈ 4,7 dtk · Pelaksanaan 9 ≈ 6,8 dtk · Pengendalian 7 ≈ 5,4 dtk · Pencapaian 5 ≈ 4,0 dtk). Selama satu tahap berjalan, tahap lain di tim yang sama tidak bisa diklik; Red dan Blue boleh berjalan bersamaan.

> **Catatan SIM.** Mesin simulasi (SIM) berjalan terus setiap 2 detik dan menghasilkan serangan Singapura secara acak ke aset Indonesia. Kontrol pertahanan yang aktif punya peluang ±45% memblokir serangan yang sesuai. SIM bisa dijeda dengan tombol **[PAUSE SIM]** di Attack Terminal.

---

## Timetable

<table>
  <thead>
    <tr>
      <th rowspan="2">No.</th>
      <th colspan="2">Waktu</th>
      <th rowspan="2">Serangan Singapura<br/>(dari sisi Blue Team)</th>
      <th colspan="2">Kegiatan</th>
      <th rowspan="2">Keterangan</th>
    </tr>
    <tr>
      <th>Asumsi</th>
      <th>Nyata</th>
      <th>Red Team</th>
      <th>Blue Team</th>
    </tr>
  </thead>
  <tbody>

    <!-- ===================== PRA-OPERASI ===================== -->
    <tr><td colspan="7"><b>TAHAP 0 — PRA-OPERASI</b> (penyiapan latihan)</td></tr>
    <tr>
      <td>1</td>
      <td>H-30<br/>08.00–09.00</td>
      <td>—<br/>(sebelum T+)</td>
      <td>—</td>
      <td>Briefing skenario: Indonesia (Red) menyerang 6 target infrastruktur kritis Singapura.</td>
      <td>Briefing skenario: Blue mempertahankan 20 aset Indonesia di 8 sektor.</td>
      <td>Operator menjalankan aplikasi (<code>npm run dev</code>) lalu membuka <code>http://localhost:3000</code>. Pembagian peran: operator Red, operator Blue, pengendali latihan (War Room).</td>
    </tr>
    <tr>
      <td>2</td>
      <td>H-30<br/>09.00–09.30</td>
      <td>T+00:00:00 – 00:01:00</td>
      <td>Mulai muncul serangan acak SIM, mis. <b>NET-1101</b> port scan dari ASN SG, <b>NET-1001</b> SYN flood.</td>
      <td>Mengamati <b>Threat Map</b> di War Room: posisi 6 target SG dan titik asal serangan di sekitar Jakarta.</td>
      <td>Mengamati <b>Attack Feed</b> dan <b>War Score</b> (Blue Incidents, ID Assets Defended 20/20).</td>
      <td>Navbar menampilkan <b>SIM ACTIVE</b>, <b>THREAT: NORMAL</b>, penghitung TICK. Threat Level awal = 1 (NORMAL).</td>
    </tr>
    <tr>
      <td>3</td>
      <td>H-30<br/>09.30–10.00</td>
      <td>T+00:01:00 – 00:02:00</td>
      <td>Serangan acak SIM berlanjut (SQLi <b>WAF-4421</b>, brute force SSH <b>AUTH-2201</b>).</td>
      <td>Buka halaman <b>RED TEAM</b>. Pilih target di <b>Target Board</b> → tombol <b>[● TARGET LOCKED]</b> (default SG-01 CAAS – Changi ATC).</td>
      <td>Buka halaman <b>BLUE TEAM</b>. Periksa <b>Defense Controls</b>: kondisi awal 5/8 aktif (FW, IDS, WAF, EDR, SIEM), IPS–TI–SOAR masih OFF.</td>
      <td>Terminal Red hanya berisi petunjuk awal + baris “Target locked”. Terminal Red <b>tidak</b> menerima event SIM, sehingga hanya output tahapan yang tampil.</td>
    </tr>

    <!-- ===================== PERENCANAAN ===================== -->
    <tr><td colspan="7"><b>TAHAP 1 — PERENCANAAN</b> · Red: Reconnaissance · Blue: Attack Surface Monitoring, Threat Intelligence, Vulnerability Assessment</td></tr>
    <tr>
      <td>4</td>
      <td>H-21<br/>08.00 – H-18<br/>17.00</td>
      <td>T+00:02:00 – 00:02:30<br/>(otomatis ±3,3 dtk)</td>
      <td>Pemindaian balik dari SG (<b>NET-1101</b>) dari SIM. Tahap Recon Red tidak memicu alert di Blue.</td>
      <td>Klik <b>1. PERENCANAAN</b> (atau chip <b>RECON</b>) di kartu Tahapan Operasi Siber. Berjalan otomatis: OSINT sweep → port scan → pemetaan celah (CVE).</td>
      <td>—</td>
      <td>Terminal Red: 1 baris <code>[+] RECONNAISSANCE → Vulnerable service identified: CVE-… on …</code>. Compromise target +6%. MITRE T1595 &amp; T1046 naik. Status kartu: ✓ RECON.</td>
    </tr>
    <tr>
      <td>5</td>
      <td>H-21<br/>08.00 – H-15<br/>17.00</td>
      <td>T+00:02:30 – 00:03:00<br/>(otomatis ±2,6 dtk)</td>
      <td>Serangan acak SIM (mis. <b>AUTH-2201</b> brute force).</td>
      <td>—</td>
      <td>Klik <b>1. PERENCANAAN</b> di kartu Tahapan Operasi Siber · Blue. Attack Surface Monitoring, Threat Intelligence, Vulnerability Assessment berjalan serentak.</td>
      <td>SOC Console: 3 baris hasil. Efek: intensitas MITRE recon turun, +3 IOC di Threat Intel Feed, health semua aset +2%. Kegiatan menjadi <b>AKTIF</b>.</td>
    </tr>
    <tr>
      <td>6</td>
      <td>H-17<br/>08.00–17.00</td>
      <td>T+00:03:00 – 00:04:00</td>
      <td>—</td>
      <td>Membaca hasil recon di Attack Terminal; menentukan target lanjutan di Target Board bila perlu.</td>
      <td>Menindaklanjuti IOC baru di <b>Threat Intel Feed</b>: <b>[ADD BLOCKLIST]</b>, <b>[SINKHOLE]</b>, <b>[ADD TO EDR]</b>, <b>[REPORT]</b>.</td>
      <td>Rujuk <code>docs/GLOSARIUM.md</code> untuk arti IOC, CVE, dan teknik MITRE.</td>
    </tr>

    <!-- ===================== PERSIAPAN ===================== -->
    <tr><td colspan="7"><b>TAHAP 2 — PERSIAPAN</b> · Red: Weaponization · Blue: Malware Analysis, Email Security, Web Filtering, IDS/IPS, EDR, SIEM Preparation</td></tr>
    <tr>
      <td>7</td>
      <td>H-14<br/>08.00 – H-8<br/>17.00</td>
      <td>T+00:04:00 – 00:04:30<br/>(otomatis ±2,2 dtk)</td>
      <td>Serangan acak SIM berlanjut.</td>
      <td>Klik <b>2. PERSIAPAN</b> (chip <b>WEAPON</b>). Berjalan otomatis: build payload → obfuscation.</td>
      <td>—</td>
      <td>Terminal: <code>[+] WEAPONIZATION → Obfuscation pass complete · AV score 2/68</code>. Di <b>Payload Selector</b>, 2 payload AVAILABLE berubah menjadi <b>LOADED</b>. Compromise +3%.</td>
    </tr>
    <tr>
      <td>8</td>
      <td>H-7<br/>08.00–17.00</td>
      <td>T+00:04:30 – 00:05:30</td>
      <td>—</td>
      <td>Meninjau <b>Payload Selector</b>: mencocokkan payload LOADED dengan sasaran (mis. <i>Spear Phishing</i> untuk delivery, <i>RCE Module</i> untuk eksploitasi). <b>Belum diklik</b> — klik berarti langsung deploy.</td>
      <td>—</td>
      <td>Payload berstatus LOADED siap dipakai pada tahap Pelaksanaan (baris 13).</td>
    </tr>
    <tr>
      <td>9</td>
      <td>H-14<br/>08.00 – H-1<br/>17.00</td>
      <td>T+00:05:30 – 00:06:00<br/>(otomatis ±4,7 dtk)</td>
      <td>Serangan acak SIM; sebagian mulai diblokir kontrol yang aktif (“FW blocked: …”, “WAF blocked: …”).</td>
      <td>—</td>
      <td>Klik <b>2. PERSIAPAN</b>. Malware Analysis, Email Security, Web Filtering, IDS/IPS, EDR, SIEM Preparation berjalan serentak.</td>
      <td>SOC Console: 6 baris. Efek: IDS, IPS, EDR, SIEM otomatis <b>ACTIVE</b> di Defense Controls; +1 IOC hash.</td>
    </tr>
    <tr>
      <td>10</td>
      <td>H-1<br/>17.00–20.00</td>
      <td>T+00:06:00 – 00:06:30</td>
      <td>—</td>
      <td>—</td>
      <td>Mengaktifkan sisa kontrol di <b>Defense Controls</b> (TI, SOAR) hingga <b>8/8 ACTIVE</b>.</td>
      <td>Setiap kontrol aktif mengurangi damage ±8% (ditampilkan “−n% dmg”). Persiapan selesai sebelum Hari H.</td>
    </tr>

    <!-- ===================== PELAKSANAAN ===================== -->
    <tr><td colspan="7"><b>TAHAP 3 — PELAKSANAAN</b> · Red: Delivery, Exploitation, Installation · Blue: Email Security, Web Filtering, IDS/IPS, Endpoint Detection, File Integrity Monitoring, Network Monitoring, DNS Monitoring, NDR, SIEM</td></tr>
    <tr>
      <td>11</td>
      <td>H<br/>04.00–07.00</td>
      <td>T+00:06:30 – 00:07:30<br/>(otomatis ±6,6 dtk)</td>
      <td>Muncul di Alert Feed: <b>MAIL-3101</b> spear phishing, <b>IPS-7701</b> exploit attempt, <b>EDR-9001</b> remote code execution, <b>EDR-8801</b> persistence.</td>
      <td>Klik <b>3. PELAKSANAAN</b>. Berjalan otomatis: Delivery (lure dibuka) → Exploitation (akses awal) → Installation (persistence/implant).</td>
      <td>Mengamati alert yang masuk.</td>
      <td>Terminal: 3 baris (<code>DELIVERY →</code>, <code>EXPLOITATION →</code>, <code>INSTALLATION →</code>). Payload LOADED → <b>DEPLOYED</b>. Compromise +26%. Target Board: status FOOTHOLD/PIVOTING.</td>
    </tr>
    <tr>
      <td>12</td>
      <td>H<br/>07.00–08.00</td>
      <td>T+00:07:30 – 00:08:00<br/>(otomatis ±6,8 dtk)</td>
      <td>Alert dari baris 11 masih terbuka; SIM menambah SYN flood <b>NET-1001</b> &amp; SQLi <b>WAF-4421</b>.</td>
      <td>—</td>
      <td>Klik <b>3. PELAKSANAAN</b>. Sembilan kegiatan berjalan serentak.</td>
      <td>SOC Console: 9 baris. Efek: alert MAIL/IPS/EDR ditutup, host yang diserang dilepas/diisolasi, sesi C2 berprotokol DNS diputus (DNS Monitoring), 1 sesi C2 diputus (NDR), alert low/medium dikorelasikan (SIEM).</td>
    </tr>
    <tr>
      <td>13</td>
      <td>H<br/>08.00–10.00</td>
      <td>T+00:08:00 – 00:09:30</td>
      <td>Serangan acak SIM: <b>EDR-9001</b> ransomware, <b>AUTH-2201</b> brute force, <b>NET-1101</b> port scan.</td>
      <td>Deploy manual: klik payload LOADED di <b>Payload Selector</b> → payload dikirim ke target terkunci. Bila perlu, pilih target lain lalu klik chip fase tertentu (mis. <b>EXPLOIT</b>).</td>
      <td>Menangani alert tersisa satu per satu di <b>Alert Feed</b>: ISOLATE HOST, INVESTIGATE, BLOCK IP, ESCALATE, FALSE POS, MARK READ.</td>
      <td>Klik chip fase menjalankan satu fase saja. Jumlah Blue Incidents di War Room turun saat alert ditangani.</td>
    </tr>
    <tr>
      <td>14</td>
      <td>H<br/>10.00–11.00</td>
      <td>T+00:09:30 – 00:10:30</td>
      <td>Serangan SG yang menurunkan health aset (sektor energi, transportasi, keuangan).</td>
      <td>—</td>
      <td>Memakai <b>Incident Response</b>: [Block IP], [GeoBlock SG], [Rate Limit], [Honeypot], [Isolate Host], [Kill Process], [Memory Dump].</td>
      <td>Pantau <b>Asset Health by Sektor</b> dan <b>MITRE ATT&amp;CK Heatmap</b>. “Actions taken this session” bertambah.</td>
    </tr>
    <tr>
      <td>15</td>
      <td>H<br/>11.00–12.00</td>
      <td>T+00:10:30 – 00:11:30</td>
      <td>—</td>
      <td colspan="2">Pengendali latihan meninjau <b>War Room</b>: Threat Map (garis merah ID→SG saat target diserang, garis hijau SG→ID saat aset Indonesia diserang), Threat Level, War Score.</td>
      <td>Klik titik target SG di peta untuk memilih target. Arahkan kursor ke titik untuk melihat compromise/health.</td>
    </tr>

    <!-- ===================== PENGENDALIAN ===================== -->
    <tr><td colspan="7"><b>TAHAP 4 — PENGENDALIAN</b> · Red: Command &amp; Control · Blue: SIEM, EDR, Firewall/IPS, DLP, DNS Security, SOAR, Incident Response</td></tr>
    <tr>
      <td>16</td>
      <td>H<br/>12.00–14.00</td>
      <td>T+00:11:30 – 00:12:00<br/>(otomatis ±2,2 dtk)</td>
      <td>Muncul <b>NET-3301</b> C2 beacon outbound dari aset Indonesia.</td>
      <td>Klik <b>4. PENGENDALIAN</b> (chip <b>C2</b>). Berjalan otomatis: negosiasi saluran → beacon aktif.</td>
      <td>—</td>
      <td>Terminal: <code>[+] COMMAND &amp; CONTROL → Beacon established · jitter 20%</code>. 1 sesi baru di <b>C2 Sessions</b>. Compromise +4%.</td>
    </tr>
    <tr>
      <td>17</td>
      <td>H<br/>14.00–16.00</td>
      <td>T+00:12:00 – 00:13:00</td>
      <td>—</td>
      <td>Di <b>C2 Sessions</b>: [SHELL ▸] untuk membuka shell, [PIVOT] untuk berpindah ke target lain, [KILL] untuk menutup sesi.</td>
      <td>—</td>
      <td>Perintah SHELL/PIVOT adalah aksi operator, sehingga tetap tercatat di Attack Terminal.</td>
    </tr>
    <tr>
      <td>18</td>
      <td>H<br/>12.00 – H+1<br/>06.00</td>
      <td>T+00:13:00 – 00:13:30<br/>(otomatis ±5,4 dtk)</td>
      <td>Beacon C2 (<b>NET-3301</b>) dan alert lain yang masih terbuka.</td>
      <td>—</td>
      <td>Klik <b>4. PENGENDALIAN</b>. SIEM, EDR, Firewall/IPS, DLP, DNS Security, SOAR, Incident Response berjalan serentak.</td>
      <td>SOC Console: 7 baris. Efek: sesi C2 http/tcp &amp; dns/icmp diputus, IP penyerang masuk blocklist, exfil berjalan dihentikan (DLP), alert low/medium ditutup (SOAR), semua host diserang diisolasi &amp; alert critical ditutup (IR).</td>
    </tr>
    <tr>
      <td>19</td>
      <td>H+1<br/>06.00–08.00</td>
      <td>T+00:13:30 – 00:14:00</td>
      <td>—</td>
      <td>Memeriksa C2 Sessions yang diputus Blue; membangun ulang akses dengan chip <b>C2</b> bila diperlukan.</td>
      <td>—</td>
      <td>Interaksi Red ↔ Blue: hasil Pengendalian Blue langsung terlihat di panel C2 Red.</td>
    </tr>

    <!-- ===================== PENCAPAIAN ===================== -->
    <tr><td colspan="7"><b>TAHAP 5 — PENCAPAIAN</b> · Red: Actions on Objectives · Blue: Mission Assurance, Data Protection, Recovery, Defense Validation, Lessons Learned</td></tr>
    <tr>
      <td>20</td>
      <td>H+1<br/>08.00–12.00</td>
      <td>T+00:14:00 – 00:14:30<br/>(otomatis ±2,2 dtk)</td>
      <td>Muncul <b>DLP-5601</b> exfil attempt via DNS.</td>
      <td>Klik <b>5. PENCAPAIAN</b> (chip <b>ACTIONS</b>). Berjalan otomatis: pengumpulan data → aliran exfil ke dropzone.</td>
      <td>—</td>
      <td>Terminal: <code>[+] ACTIONS ON OBJECTIVES → Exfil stream opened → dropzone</code>. 2 dataset baru di <b>Exfil Tracker</b>. Compromise +11%.</td>
    </tr>
    <tr>
      <td>21</td>
      <td>H+1<br/>12.00–14.00</td>
      <td>T+00:14:30 – 00:15:15</td>
      <td>—</td>
      <td>Memantau <b>Exfil Tracker</b> hingga transfer selesai (2–15 MB per tick; dataset 30–150 MB ≈ 10–40 detik).</td>
      <td>—</td>
      <td>Exfil Total di War Room bertambah. War Room menghitung target sebagai <b>SG Assets Pwned</b> bila compromise ≥ 75%; di Target Board status menjadi <b>OWNED</b> pada 100%.</td>
    </tr>
    <tr>
      <td>22</td>
      <td>H+1<br/>14.00 – H+2<br/>17.00</td>
      <td>T+00:15:15 – 00:15:45<br/>(otomatis ±4,0 dtk)</td>
      <td>Sisa serangan acak SIM.</td>
      <td>—</td>
      <td>Klik <b>5. PENCAPAIAN</b>. Mission Assurance, Data Protection, Recovery, Defense Validation, Lessons Learned berjalan serentak.</td>
      <td>SOC Console: 5 baris. Efek: aset &lt; 80% naik +5%, transfer exfil yang belum selesai dihapus (Data Protection), aset terburuk +20%, skor validasi pertahanan, intensitas MITRE −1. <b>Urutan penting:</b> bila Blue menjalankan tahap ini sebelum transfer Red selesai, data Red gagal dicuri.</td>
    </tr>
    <tr>
      <td>23</td>
      <td>H+2<br/>17.00 – H+3<br/>12.00</td>
      <td>T+00:15:45 – 00:16:45</td>
      <td>—</td>
      <td>—</td>
      <td>Pemulihan lanjutan lewat <b>Incident Response</b>: [Deploy Patch], [Restore Backup], [Failover], [Escalate BSSN].</td>
      <td>Health aset naik; status kembali SECURE/OK. Threat Level turun mengikuti rata-rata health &amp; alert critical.</td>
    </tr>

    <!-- ===================== PASCA-OPERASI ===================== -->
    <tr><td colspan="7"><b>TAHAP 6 — PASCA-OPERASI</b> (evaluasi &amp; penutupan)</td></tr>
    <tr>
      <td>24</td>
      <td>H+3<br/>13.00–15.00</td>
      <td>T+00:16:45 – 00:18:00</td>
      <td>— (SIM dijeda)</td>
      <td>Klik <b>[PAUSE SIM]</b>, lalu <b>[EXPORT LOG]</b> di Attack Terminal untuk menyimpan log terminal &amp; feed.</td>
      <td>Membaca skor <b>Defense Validation</b> dan ringkasan <b>Lessons Learned</b> di SOC Console.</td>
      <td>Setelah SIM dijeda, angka di layar tidak berubah sehingga mudah dicatat.</td>
    </tr>
    <tr>
      <td>25</td>
      <td>H+3<br/>15.00–17.00</td>
      <td>T+00:18:00 – 00:20:00</td>
      <td>—</td>
      <td colspan="2">Evaluasi bersama di <b>War Room</b>: SG Assets Pwned, Exfil Total, Red Ops Active (Red) vs Blue Incidents, ID Assets Defended, Threats Blocked (Blue), Threat Level akhir.</td>
      <td>Hasil evaluasi menjadi bahan laporan latihan.</td>
    </tr>
    <tr>
      <td>26</td>
      <td>H+7<br/>08.00–12.00</td>
      <td>—<br/>(di luar aplikasi)</td>
      <td>—</td>
      <td>Debriefing Red Team: efektivitas tiap fase kill chain dan payload.</td>
      <td>Debriefing Blue Team: kegiatan yang paling efektif, teknik MITRE paling aktif, rekomendasi perbaikan.</td>
      <td>Muat ulang halaman (refresh) untuk mengembalikan simulasi ke kondisi awal sebelum latihan berikutnya.</td>
    </tr>
  </tbody>
</table>

---

## Ringkasan per Tahap

| Tahap | Waktu Asumsi | Waktu Nyata (perkiraan) | Red Team (Kill Chain) | Blue Team (Kegiatan) |
|---|---|---|---|---|
| Pra-Operasi | H-30 | T+00:00 – 00:02 | Briefing, pilih target | Briefing, cek Defense Controls |
| 1. Perencanaan | H-21 s.d. H-15 | T+00:02 – 00:04 | Reconnaissance | Attack Surface Monitoring, Threat Intelligence, Vulnerability Assessment |
| 2. Persiapan | H-14 s.d. H-1 | T+00:04 – 00:06:30 | Weaponization | Malware Analysis, Email Security, Web Filtering, IDS/IPS, EDR, SIEM Preparation |
| 3. Pelaksanaan | H 04.00–12.00 | T+00:06:30 – 00:11:30 | Delivery, Exploitation, Installation | Email Security, Web Filtering, IDS/IPS, Endpoint Detection, File Integrity Monitoring, Network Monitoring, DNS Monitoring, NDR, SIEM |
| 4. Pengendalian | H 12.00 – H+1 08.00 | T+00:11:30 – 00:14 | Command &amp; Control | SIEM, EDR, Firewall/IPS, DLP, DNS Security, SOAR, Incident Response |
| 5. Pencapaian | H+1 08.00 – H+3 12.00 | T+00:14 – 00:16:45 | Actions on Objectives | Mission Assurance, Data Protection, Recovery, Defense Validation, Lessons Learned |
| Pasca-Operasi | H+3 s.d. H+7 | T+00:16:45 – 00:20 | Export log, evaluasi, debriefing | Evaluasi, debriefing |
