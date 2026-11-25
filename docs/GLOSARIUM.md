# Glosarium CyberWar Simulation (ops-siber)

Daftar istilah teknis dan istilah berbahasa Inggris yang dipakai di aplikasi ini, beserta padanan / penjelasannya dalam bahasa Indonesia dan di mana istilah itu muncul.

> Kolom **Muncul di** menunjukkan halaman/kartu tempat istilah terlihat: **WR** = War Room, **RT** = Red Team, **BT** = Blue Team.

---

## Daftar Isi

1. [Konsep Umum](#1-konsep-umum)
2. [Tahapan Operasi Siber](#2-tahapan-operasi-siber)
3. [Cyber Kill Chain (Red Team)](#3-cyber-kill-chain-red-team)
4. [Kegiatan Pertahanan (Blue Team)](#4-kegiatan-pertahanan-blue-team)
5. [Kontrol Pertahanan (Defense Controls)](#5-kontrol-pertahanan-defense-controls)
6. [Tindakan Incident Response](#6-tindakan-incident-response)
7. [Threat Intelligence & IOC](#7-threat-intelligence--ioc)
8. [Alert & Rule Deteksi](#8-alert--rule-deteksi)
9. [MITRE ATT&CK](#9-mitre-attck)
10. [Payload (Red Team)](#10-payload-red-team)
11. [Command & Control (C2) dan Exfiltration](#11-command--control-c2-dan-exfiltration)
12. [Status, Tingkat & Severity](#12-status-tingkat--severity)
13. [Prefix Log Terminal](#13-prefix-log-terminal)
14. [Tim / Sumber Log](#14-tim--sumber-log)
15. [Sektor Infrastruktur Kritis](#15-sektor-infrastruktur-kritis)
16. [Instansi & Singkatan Organisasi](#16-instansi--singkatan-organisasi)
17. [Nama Kartu / Panel UI](#17-nama-kartu--panel-ui)
18. [Istilah Jaringan & Teknis Umum](#18-istilah-jaringan--teknis-umum)
19. [Istilah Teknologi Aplikasi](#19-istilah-teknologi-aplikasi)

---

## 1. Konsep Umum

| Istilah | Arti dalam Bahasa Indonesia | Muncul di |
|---|---|---|
| Cyber War / Cyberwar | Perang siber; konflik antarnegara di ruang siber | Judul aplikasi |
| Simulation (SIM) | Simulasi. Mesin yang menghasilkan kejadian acak setiap 2 detik (tick) | Navbar (`SIM ACTIVE`) |
| Tick | Satu siklus pembaruan simulasi (setiap 2 detik) | Navbar (`TICK #`) |
| Red Team | Tim penyerang (ofensif) — dalam skenario ini pihak Indonesia yang menyerang target Singapura | RT |
| Blue Team | Tim pertahanan (defensif) — mempertahankan aset Indonesia dari serangan balik | BT |
| War Room | Ruang komando; ringkasan seluruh konflik | WR |
| Offense / Offensive | Serangan / ofensif | WR |
| Defense / Defensive | Pertahanan / defensif | WR |
| Target | Sasaran serangan (aset milik Singapura) | RT |
| Asset | Aset; sistem/infrastruktur yang dilindungi (milik Indonesia) | BT |
| Threat | Ancaman | WR, BT |
| Threat Actor | Pelaku ancaman; kelompok peretas (contoh fiktif: LION-SPIDER, MERLION-APT, STRAIT-PANDA, GARDEN-CITY, RED-DOT-KITTEN) | BT (Threat Intel) |
| APT (Advanced Persistent Threat) | Ancaman persisten tingkat lanjut; kelompok peretas yang canggih & bertahan lama, umumnya didukung negara | Nama threat actor |
| Attack | Serangan | Semua |
| Under Attack | Sedang diserang | BT, WR |
| Compromise / Compromised | Tingkat penguasaan sistem oleh penyerang / sistem telah dibobol | RT |
| Pwned | Istilah slang: sepenuhnya dikuasai penyerang | RT, WR |
| Conflict | Konflik; durasi simulasi berjalan | WR (`CONFLICT`) |
| Operation (Ops) | Operasi | Semua |
| Active Ops | Operasi yang sedang aktif | WR |
| Incident | Insiden keamanan; kejadian yang mengancam keamanan sistem | BT, WR |
| Mitigation | Mitigasi; pengurangan dampak serangan | Mesin simulasi |
| Damage (dmg) | Kerusakan; pengurangan health aset | BT (Defense Controls) |
| Health | Tingkat kesehatan / kondisi aset (0–100%) | BT |
| Kogabwilhan | Komando Gabungan Wilayah Pertahanan (TNI) | Nama aset |

---

## 2. Tahapan Operasi Siber

Lima tahap yang membungkus kill chain (Red) dan kegiatan pertahanan (Blue). Klik tahap untuk menjalankan otomatis.

| Tahap | Padanan Inggris | Fungsi | Red (Kill Chain) | Blue (Kegiatan) |
|---|---|---|---|---|
| Perencanaan | Planning | Mengenali sasaran / permukaan serangan dan ancaman | Reconnaissance | Attack Surface Monitoring, Threat Intelligence, Vulnerability Assessment |
| Persiapan | Preparation | Menyiapkan senjata siber / pertahanan | Weaponization | Malware Analysis, Email Security, Web Filtering, IDS/IPS, EDR, SIEM Preparation |
| Pelaksanaan | Execution | Serangan dijalankan / deteksi & penahanan | Delivery, Exploitation, Installation | Email Security, Web Filtering, IDS/IPS, Endpoint Detection, File Integrity Monitoring, Network Monitoring, DNS Monitoring, NDR, SIEM |
| Pengendalian | Control | Mengendalikan sistem sasaran / mengendalikan insiden | Command & Control | SIEM, EDR, Firewall/IPS, DLP, DNS Security, SOAR, Incident Response |
| Pencapaian | Achievement | Mencapai tujuan operasi / memastikan misi tetap berjalan | Actions on Objectives | Mission Assurance, Data Protection, Recovery, Defense Validation, Lessons Learned |

---

## 3. Cyber Kill Chain (Red Team)

**Cyber Kill Chain** = rantai tahapan serangan siber (model Lockheed Martin), dari pengintaian sampai tujuan tercapai.

| Fase | Singkatan UI | Arti | Yang terjadi saat dijalankan |
|---|---|---|---|
| Reconnaissance | RECON | Pengintaian; mengumpulkan informasi sasaran | OSINT sweep, port scan, pemetaan celah (CVE) |
| Weaponization | WEAPON | Persenjataan; membuat payload untuk celah yang ditemukan | Payload dibuat & diobfuskasi → status LOADED |
| Delivery | DELIVER | Pengiriman payload ke sasaran (mis. email phishing) | Umpan dibuka → payload DEPLOYED, alert phishing di Blue |
| Exploitation | EXPLOIT | Eksploitasi; memanfaatkan celah untuk menjalankan kode | Akses awal didapat, alert exploit & RCE di Blue |
| Installation | INSTALL | Instalasi; memasang implant/backdoor agar bertahan | Persistence dipasang, alert persistence di Blue |
| Command & Control | C2 | Komando & kendali; saluran komunikasi ke sistem yang dibobol | Sesi C2 baru muncul, alert beacon di Blue |
| Actions on Objectives | ACTIONS | Aksi atas tujuan; mencuri/merusak data | Pengumpulan & exfiltration data, alert DLP di Blue |

Istilah terkait:

| Istilah | Arti |
|---|---|
| Phase | Fase / tahap |
| Active Phase | Fase yang sedang aktif |
| OSINT (Open Source Intelligence) | Intelijen sumber terbuka; info dari sumber publik |
| Subdomain enumeration | Pencarian daftar subdomain milik sasaran |
| Port scan | Pemindaian port untuk mencari layanan yang terbuka |
| nmap | Alat pemindai jaringan populer |
| Fingerprinting | Identifikasi jenis/versi sistem & perangkat lunak sasaran |
| Obfuscation | Pengaburan kode agar tidak dikenali antivirus |
| AV score | Jumlah antivirus yang mendeteksi payload (mis. 2/68) |
| Lure | Umpan (dokumen/tautan jebakan) |
| Watering-hole | Situs yang sering dikunjungi sasaran lalu disusupi untuk menyebar malware |
| Callback | Koneksi balik dari korban ke penyerang |
| Initial Access | Akses awal ke sistem sasaran |
| Foothold | Pijakan awal di jaringan sasaran |
| Persistence | Persistensi; mekanisme agar akses penyerang bertahan setelah reboot |
| Implant | Program penyerang yang tertanam di sistem korban |
| Scheduled task | Tugas terjadwal (dipakai untuk persistence) |
| Privilege Escalation (PrivEsc) | Peningkatan hak akses (mis. menjadi root/admin) |
| Lateral Movement / Pivot | Pergerakan menyamping; berpindah dari satu sistem ke sistem lain |
| Pivot path | Jalur perpindahan antarsistem |
| Evading | Menghindari deteksi |
| Dropzone | Server penampung data curian |

---

## 4. Kegiatan Pertahanan (Blue Team)

| Kegiatan | Arti dalam Bahasa Indonesia | Efek saat dijalankan di simulasi |
|---|---|---|
| Attack Surface Monitoring (ASM) | Pemantauan permukaan serangan; memetakan aset yang terekspos ke internet | Intensitas teknik recon MITRE turun |
| Threat Intelligence (TI) | Intelijen ancaman; info tentang pelaku, indikator & teknik serangan | +3 IOC baru di Threat Intel Feed |
| Vulnerability Assessment (VA) | Penilaian kerentanan; mencari & memprioritaskan celah keamanan | Health semua aset +2% |
| Malware Analysis | Analisis malware (mis. di sandbox) | +1 IOC hash |
| Email Security | Keamanan email; menyaring phishing & lampiran berbahaya | Persiapan: SPF/DKIM/DMARC; Pelaksanaan: tutup alert MAIL |
| Web Filtering | Penyaringan web; memblokir situs/URL berbahaya | Kategori diperbarui / unduhan diblokir |
| IDS/IPS | Sistem deteksi / pencegahan intrusi | Persiapan: IDS & IPS ON; Pelaksanaan: tutup alert IPS/NET |
| EDR | Endpoint Detection & Response; deteksi & respons di perangkat (endpoint) | Persiapan: EDR ON; Pengendalian: isolasi host |
| Endpoint Detection | Deteksi di endpoint (komputer/server) | Proses berbahaya dihentikan, host diisolasi |
| SIEM Preparation | Persiapan SIEM (aturan korelasi & sumber log) | SIEM ON |
| SIEM | Security Information & Event Management; pengumpulan & korelasi log keamanan | Alert dikorelasikan / ditriase |
| File Integrity Monitoring (FIM) | Pemantauan integritas file; mendeteksi perubahan file tak sah | Intensitas teknik persistence turun |
| Network Monitoring | Pemantauan jaringan (netflow, anomali lalu lintas) | Sumber pemindaian dibatasi |
| DNS Monitoring | Pemantauan DNS; mendeteksi DNS tunneling | Sesi C2 berprotokol DNS diputus |
| NDR | Network Detection & Response; deteksi & respons di tingkat jaringan | 1 sesi C2 (beacon) diputus |
| Firewall/IPS | Firewall dan pencegahan intrusi | C2 http/tcp diputus, IP masuk blocklist |
| DLP | Data Loss Prevention; pencegahan kebocoran data | Exfiltration yang sedang berjalan dihentikan |
| DNS Security | Keamanan DNS (sinkhole domain berbahaya) | C2 DNS/ICMP ditutup |
| SOAR | Security Orchestration, Automation & Response; otomasi respons keamanan (playbook) | Semua alert low/medium ditutup otomatis |
| Incident Response (IR) | Respons insiden; penanganan insiden secara terstruktur | Semua host diserang diisolasi, alert critical ditutup |
| Mission Assurance | Jaminan misi; memastikan layanan kritis tetap berjalan | Aset dengan health < 80% +5% |
| Data Protection | Perlindungan data | Transfer data tertunda dibersihkan |
| Recovery | Pemulihan (dari backup) | Aset terburuk +20% |
| Defense Validation | Validasi pertahanan; mengukur efektivitas kontrol | Skor validasi pertahanan ditampilkan |
| Lessons Learned | Pembelajaran pascainsiden | Seluruh intensitas MITRE −1 |

Istilah terkait:

| Istilah | Arti |
|---|---|
| SOC (Security Operations Center) | Pusat operasi keamanan siber |
| SOC Console | Konsol output kegiatan Blue (BT, kartu Tahapan Operasi Siber) |
| Analyst | Analis keamanan |
| Sandbox / Detonation | Lingkungan terisolasi untuk menjalankan ("meledakkan") sampel malware |
| Signature | Tanda tangan / pola pengenal malware atau serangan |
| SPF / DKIM / DMARC | Standar autentikasi email untuk mencegah pemalsuan pengirim |
| Mail gateway | Gerbang email (penyaring email masuk) |
| Correlation rules | Aturan korelasi; menghubungkan beberapa kejadian menjadi satu insiden |
| Triage | Pemilahan prioritas insiden |
| Playbook | Prosedur respons yang terotomasi |
| Baseline | Pola normal sebagai pembanding deteksi anomali |
| Anomaly | Anomali; perilaku tidak normal |
| Rate-limit | Pembatasan laju koneksi |
| Sinkhole | Mengalihkan domain berbahaya ke server "lubang" milik defender |
| Beacon | Sinyal berkala dari implant ke server C2 |
| DNS Tunneling | Menyelundupkan data/komando melalui query DNS |
| Egress | Lalu lintas keluar dari jaringan |
| Containment / Contain | Penahanan; mencegah serangan menyebar |
| Isolate | Mengisolasi host dari jaringan |
| Patch | Pembaruan perangkat lunak untuk menutup celah |
| Backup | Cadangan data |

---

## 5. Kontrol Pertahanan (Defense Controls)

Toggle di kartu **Defense Controls** (BT). Setiap kontrol aktif mengurangi damage serangan.

| Kontrol | Kepanjangan | Arti |
|---|---|---|
| FW | Firewall | Dinding api; menyaring lalu lintas jaringan berdasarkan aturan |
| IDS | Intrusion Detection System | Sistem pendeteksi intrusi (hanya mendeteksi) |
| IPS | Intrusion Prevention System | Sistem pencegah intrusi (mendeteksi & memblokir) |
| WAF | Web Application Firewall | Firewall khusus aplikasi web (mis. memblokir SQL injection) |
| EDR | Endpoint Detection & Response | Deteksi & respons di endpoint |
| SIEM | Security Information & Event Management | Manajemen informasi & kejadian keamanan |
| TI | Threat Intelligence | Intelijen ancaman |
| SOAR | Security Orchestration, Automation & Response | Orkestrasi, otomasi & respons keamanan |
| ACTIVE / OFF | — | Aktif / nonaktif |

---

## 6. Tindakan Incident Response

Tombol di kartu **Incident Response** (BT).

| Tombol | Arti |
|---|---|
| Block IP | Blokir alamat IP penyerang |
| GeoBlock SG | Blokir lalu lintas berdasarkan lokasi geografis (Singapura) |
| Rate Limit | Batasi laju koneksi |
| Honeypot | Sistem umpan untuk menjebak & mempelajari penyerang |
| Isolate Host | Isolasi host dari jaringan |
| Memory Dump | Ambil salinan isi memori untuk forensik |
| Force Reboot | Paksa nyalakan ulang sistem |
| Kill Process | Hentikan proses berbahaya |
| Deploy Patch | Pasang patch keamanan |
| Restore Backup | Pulihkan dari cadangan |
| Failover | Alihkan layanan ke sistem cadangan |
| Escalate BSSN | Eskalasi (laporkan) ke BSSN |
| Actions taken this session | Jumlah tindakan yang dilakukan pada sesi ini |

Tindakan pada alert (Alert Feed):

| Aksi | Arti |
|---|---|
| ISOLATE HOST | Isolasi host |
| ESCALATE | Eskalasi ke tingkat lebih tinggi |
| INVESTIGATE | Selidiki |
| BLOCK IP | Blokir IP |
| FALSE POS (False Positive) | Positif palsu; alert keliru |
| MARK READ | Tandai sudah dibaca |
| ACK (Acknowledge) | Alert sudah ditangani / diakui |

---

## 7. Threat Intelligence & IOC

| Istilah | Arti |
|---|---|
| IOC (Indicator of Compromise) | Indikator kompromi; jejak/bukti serangan (IP, domain, hash, URL) |
| Threat Intel Feed | Umpan intelijen ancaman |
| IP | Alamat Internet Protocol |
| Domain | Nama domain (mis. `merlion-sync.io`) |
| Hash | Sidik jari file (mis. MD5) untuk mengenali file malware |
| URL | Alamat web lengkap |
| Confidence (conf) | Tingkat keyakinan bahwa indikator berbahaya (%) |
| ADD BLOCKLIST | Tambahkan ke daftar blokir |
| SINKHOLE | Alihkan domain ke sinkhole |
| ADD TO EDR | Tambahkan ke aturan EDR |
| REPORT | Laporkan |
| Partner feeds (BSSN · ISAC) | Umpan dari mitra; ISAC = Information Sharing and Analysis Center (pusat berbagi info keamanan antarorganisasi) |

---

## 8. Alert & Rule Deteksi

| Istilah | Arti |
|---|---|
| Alert | Peringatan keamanan |
| Alert Feed | Daftar alert masuk |
| Rule | Aturan deteksi yang memicu alert |
| Open | Alert yang belum ditangani |

| Rule | Kategori | Arti |
|---|---|---|
| MAIL-3101 | Email | Spear phishing terkirim ke aset |
| IPS-7701 | IPS | Percobaan eksploit pada portal web |
| EDR-9001 | EDR | Eksekusi kode jarak jauh / ransomware |
| EDR-8801 | EDR | Mekanisme persistence dibuat / lateral movement |
| NET-1001 | Jaringan | SYN flood (DDoS) |
| NET-1101 | Jaringan | Anomali lalu lintas jaringan |
| NET-3301 | Jaringan | Beacon C2 keluar |
| WAF-4421 | WAF | Percobaan SQL injection |
| AUTH-2201 | Autentikasi | Brute force / login mencurigakan |
| DLP-5501, DLP-5601 | DLP | Percobaan exfiltration data |

---

## 9. MITRE ATT&CK

**MITRE ATT&CK** = basis pengetahuan global tentang taktik & teknik penyerang. **Heatmap** = peta panas intensitas teknik (0–10).

Taktik:

| Tactic | Arti |
|---|---|
| Reconnaissance | Pengintaian |
| Initial Access | Akses awal |
| Execution | Eksekusi (menjalankan kode) |
| Persistence | Persistensi |
| Privilege Escalation | Peningkatan hak akses |
| Defense Evasion | Penghindaran pertahanan |
| Lateral Movement | Pergerakan menyamping |
| Command & Control | Komando & kendali |
| Exfiltration | Pencurian / pengeluaran data |
| Impact | Dampak (merusak/mengganggu sistem) |

Teknik:

| ID | Nama di UI | Arti |
|---|---|---|
| T1595 | Active Scanning | Pemindaian aktif terhadap sasaran |
| T1046 | Network Svc Discovery | Penemuan layanan jaringan |
| T1566 | Phishing | Pengelabuan lewat email/pesan |
| T1190 | Exploit Public-Facing | Eksploitasi aplikasi yang terbuka ke internet |
| T1078 | Valid Accounts | Penyalahgunaan akun yang sah |
| T1059 | Command Interpreter | Penggunaan interpreter perintah (shell, PowerShell) |
| T1203 | Exploitation for Code | Eksploitasi untuk eksekusi kode di sisi klien |
| T1053 | Scheduled Task/Job | Tugas terjadwal untuk persistence |
| T1547 | Boot Autostart | Program berjalan otomatis saat boot |
| T1068 | Exploit for PrivEsc | Eksploitasi untuk peningkatan hak akses |
| T1562 | Impair Defenses | Melemahkan / mematikan pertahanan |
| T1021 | Remote Services | Layanan jarak jauh (RDP, SSH) untuk lateral movement |
| T1071 | App Layer Protocol | Komunikasi C2 lewat protokol aplikasi (HTTP, DNS) |
| T1572 | Protocol Tunneling | Penerowongan protokol |
| T1041 | Exfil Over C2 | Pencurian data lewat saluran C2 |
| T1567 | Exfil Over Web Svc | Pencurian data lewat layanan web (cloud storage) |
| T1486 | Data Encrypted | Data dienkripsi untuk dampak (ransomware) |
| T1489 | Service Stop | Menghentikan layanan |
| T1587 | Develop Capabilities | Mengembangkan kemampuan (membuat malware) |
| T1027 | Obfuscated Files | File/informasi yang diobfuskasi |
| T1005 | Data from Local System | Pengambilan data dari sistem lokal |
| TOP | — | Teknik dengan intensitas tertinggi |
| LOW / MED / CRIT | — | Intensitas rendah / sedang / kritis |

---

## 10. Payload (Red Team)

**Payload** = muatan / kode serangan yang dikirim ke sasaran.

| Payload | Jenis | Arti |
|---|---|---|
| SQLi Injector | web | Alat SQL injection (menyisipkan perintah SQL ke aplikasi web) |
| RCE Module | exploit | Modul Remote Code Execution (eksekusi kode jarak jauh) |
| Spear Phishing | delivery | Phishing tertarget ke individu tertentu |
| RAT Dropper | backdoor | Pemasang Remote Access Trojan (trojan akses jarak jauh) |
| DDoS Flood | disruption | Serangan Distributed Denial of Service (membanjiri layanan) |
| 0day Bundle | exploit | Kumpulan eksploit zero-day (celah yang belum diketahui/ditambal) |
| Keylogger | keylogger | Perekam ketikan papan ketik |
| Ransomware | ransomware | Malware penyandera data (mengenkripsi & meminta tebusan) |
| Backdoor.py | backdoor | Pintu belakang (akses tersembunyi) berbasis Python |

| Status | Arti |
|---|---|
| AVAILABLE | Tersedia, belum disiapkan |
| LOADED | Sudah disiapkan / dimuat |
| DEPLOYED | Sudah dikirim ke sasaran |
| DETECTED | Terdeteksi oleh pertahanan |

Istilah lain: **Exploit** = kode yang memanfaatkan celah; **Backdoor** = pintu belakang; **Disruption** = gangguan layanan; **CVE (Common Vulnerabilities and Exposures)** = nomor identifikasi celah keamanan publik (mis. CVE-2024-3400); **Zero-day / 0day** = celah yang belum diketahui vendor.

---

## 11. Command & Control (C2) dan Exfiltration

| Istilah | Arti |
|---|---|
| C2 / Command & Control | Komando & kendali atas sistem korban |
| C2 Session | Sesi koneksi aktif ke implant |
| C2 framework | Perangkat lunak pengelola C2 |
| Beacon | Sinyal berkala implant ke server C2 |
| Interval / Jitter | Jeda antar-beacon / variasi acak jeda agar sulit dideteksi |
| Protocol (http, dns, tcp, icmp) | Protokol komunikasi C2 |
| Hostname | Nama host (komputer) |
| SHELL | Membuka shell (baris perintah) di host korban |
| PIVOT | Berpindah ke target lain melalui host ini |
| KILL | Mengakhiri sesi |
| Session lost | Sesi terputus |
| Exfiltration (Exfil) | Pencurian / pengeluaran data dari jaringan sasaran |
| Exfil Tracker | Pelacak exfiltration |
| Dataset | Kumpulan data yang dicuri |
| Staged | Data sudah dikumpulkan, siap dikirim |
| Transferred | Data yang sudah terkirim |
| In-progress / pending / done | Sedang berjalan / menunggu / selesai |
| MB | Megabyte |

---

## 12. Status, Tingkat & Severity

Status aset (Blue):

| Status | Arti |
|---|---|
| SECURE | Aman (health > 80%) |
| OK | Baik (health 60–80%) |
| WARN | Waspada (health 30–60%) |
| CRITICAL | Kritis (health < 30%) |
| COMPROMISED | Telah dibobol |
| Degraded | Menurun kinerjanya |
| Shielded | Terlindungi |

Fase kompromi target (Red):

| Fase | Arti |
|---|---|
| UNTOUCHED | Belum tersentuh |
| RECON | Sedang diintai |
| FOOTHOLD | Pijakan awal didapat |
| PIVOTING | Sedang berpindah ke sistem lain |
| EXFIL | Sedang mencuri data |
| OWNED | Dikuasai penuh |

Tingkat ancaman (Threat Level):

| Level | Nama | Arti |
|---|---|---|
| 1 | NORMAL | Normal |
| 2 | GUARDED | Waspada rendah |
| 3 | ELEVATED | Meningkat |
| 4 | HIGH | Tinggi |
| 5 | CRITICAL | Kritis |

Severity (tingkat keparahan alert/log):

| Severity | Arti |
|---|---|
| low | Rendah |
| medium | Sedang |
| high | Tinggi |
| critical | Kritis |

Label lain: **RUNNING / JALAN** = sedang berjalan; **SELESAI** = selesai; **AKTIF / OFF** = aktif / nonaktif; **TARGET LOCKED** = target terkunci (dipilih); **SELECT TARGET** = pilih target; **PAUSE / RESUME SIM** = jeda / lanjutkan simulasi; **CLEAR** = bersihkan; **EXPORT LOG** = ekspor log.

---

## 13. Prefix Log Terminal

| Prefix | Arti |
|---|---|
| `[*]` | Informasi / proses sedang berjalan |
| `[+]` | Berhasil |
| `[-]` | Gagal / terputus |
| `[!]` | Peringatan / kejadian penting |
| `[#]` | Intelijen / catatan analisis |
| `[>]` | Perintah yang dijalankan |
| `[✗]` | Diblokir / ditolak |
| `root@redcell:~#` | Prompt terminal Red Team (user root di mesin "redcell") |
| `analyst@soc:~#` | Prompt konsol Blue Team (analis SOC) |

---

## 14. Tim / Sumber Log

| Tim | Arti |
|---|---|
| RED | Kejadian dari Red Team |
| BLUE | Kejadian dari Blue Team |
| INTEL | Intelijen |
| C2 | Server komando & kendali |
| SYS | Sistem / simulasi |
| WARN | Peringatan |

---

## 15. Sektor Infrastruktur Kritis

| Sektor (kode) | Arti |
|---|---|
| energy | Energi (listrik, minyak & gas) |
| transport | Transportasi (udara, laut, kereta) |
| cctv | CCTV / pemantauan video |
| finance | Keuangan (perbankan, pembayaran) |
| government | Pemerintahan |
| military | Militer |
| health | Kesehatan |
| telco | Telekomunikasi |

---

## 16. Instansi & Singkatan Organisasi

Indonesia:

| Singkatan | Kepanjangan |
|---|---|
| BSSN | Badan Siber dan Sandi Negara |
| PLN | Perusahaan Listrik Negara |
| KAI | Kereta Api Indonesia |
| BI | Bank Indonesia (BI-FAST = sistem pembayaran cepat BI) |
| BRI | Bank Rakyat Indonesia |
| OJK | Otoritas Jasa Keuangan |
| BPJS | Badan Penyelenggara Jaminan Sosial |
| Kemenhub | Kementerian Perhubungan |
| Kemenkes | Kementerian Kesehatan |
| Kominfo | Kementerian Komunikasi dan Informatika |
| PDN | Pusat Data Nasional |
| NOC | Network Operations Center (pusat operasi jaringan) |
| Dishub DKI | Dinas Perhubungan DKI Jakarta |
| ATCS | Area Traffic Control System (sistem kendali lalu lintas) |
| Polri | Kepolisian Negara Republik Indonesia |
| Mabes TNI | Markas Besar Tentara Nasional Indonesia |
| Kogabwilhan I | Komando Gabungan Wilayah Pertahanan I |
| SCADA | Supervisory Control and Data Acquisition (sistem kendali industri) |
| Core Banking | Sistem inti perbankan |

Singapura:

| Singkatan | Kepanjangan |
|---|---|
| CAAS | Civil Aviation Authority of Singapore (otoritas penerbangan sipil) |
| ATC | Air Traffic Control (pengatur lalu lintas udara) |
| MAS | Monetary Authority of Singapore (bank sentral Singapura) |
| FAST | Fast And Secure Transfers (sistem transfer cepat) |
| EMA | Energy Market Authority (otoritas pasar energi) |
| Smart Grid | Jaringan listrik pintar |
| MINDEF | Ministry of Defence (Kementerian Pertahanan) |
| GovTech | Government Technology Agency (badan teknologi pemerintah) |
| Singtel | Singapore Telecommunications |
| SG / ID | Singapura / Indonesia |

---

## 17. Nama Kartu / Panel UI

| Kartu | Arti | Halaman |
|---|---|---|
| Attack Feed | Umpan serangan; log seluruh kejadian | WR |
| Threat Map | Peta ancaman (Indonesia – Singapura) | WR |
| War Score | Skor perang kedua pihak | WR |
| Threat Level | Tingkat ancaman | WR |
| Red Ops Active | Jumlah operasi Red aktif | WR |
| SG Assets Pwned | Jumlah aset Singapura yang dikuasai | WR |
| Exfil Total | Total data yang dicuri | WR |
| Blue Incidents | Jumlah insiden Blue terbuka | WR |
| ID Assets Defended | Jumlah aset Indonesia yang bertahan | WR |
| Threats Blocked | Jumlah ancaman yang diblokir | WR |
| Target Board | Papan target Singapura | RT |
| Attack Terminal | Terminal serangan (output tahapan Red) | RT |
| Tahapan Operasi Siber | Kartu 5 tahap operasi (Red & Blue) | RT, BT |
| C2 Sessions | Daftar sesi C2 | RT |
| Payload Selector | Pemilih payload | RT |
| Exfil Tracker | Pelacak exfiltration | RT |
| Alert Feed | Daftar alert | BT |
| National Network | Grafik 3D jaringan nasional | BT |
| Sector Defense | Status pertahanan per sektor | BT |
| Asset Health by Sektor | Kesehatan aset per sektor | BT |
| MITRE ATT&CK Heatmap | Peta panas teknik serangan | BT |
| Incident Response | Tindakan respons insiden | BT |
| Defense Controls | Kontrol pertahanan | BT |
| Threat Intel Feed | Umpan intelijen ancaman | BT |
| SOC Console · Output | Konsol output kegiatan Blue | BT |
| Toast | Notifikasi singkat yang muncul di pojok layar | Semua |

---

## 18. Istilah Jaringan & Teknis Umum

| Istilah | Arti |
|---|---|
| Host | Komputer/server di jaringan |
| Endpoint | Perangkat ujung (PC, laptop, server) |
| Port | Nomor pintu layanan jaringan (mis. 22 SSH, 3389 RDP, 8080 HTTP) |
| Service | Layanan yang berjalan di port |
| SSH | Secure Shell; akses baris perintah jarak jauh |
| RDP | Remote Desktop Protocol |
| HTTP / HTTPS | Protokol web |
| DNS | Domain Name System; penerjemah nama domain ke IP |
| TCP / ICMP | Protokol transport / protokol pesan kontrol (ping) |
| Netflow | Rekaman ringkas aliran lalu lintas jaringan |
| East-west traffic | Lalu lintas antarserver di dalam jaringan internal |
| SYN Flood | Serangan DDoS dengan membanjiri paket SYN |
| Brute force | Menebak kata sandi secara berulang |
| SQL Injection (SQLi) | Penyisipan perintah SQL berbahaya ke aplikasi |
| RCE (Remote Code Execution) | Eksekusi kode jarak jauh |
| Zero-day | Celah yang belum ditambal |
| Root | Akun dengan hak akses tertinggi (Linux) |
| Credential | Kredensial (username/password) |
| Malware | Perangkat lunak berbahaya |
| Trojan | Malware yang menyamar sebagai program sah |
| Checksum | Nilai pemeriksa integritas file |
| Forensics | Forensik digital |
| Blocklist / Blacklist | Daftar blokir |
| Portal | Halaman web layanan |

---

## 19. Istilah Teknologi Aplikasi

| Istilah | Arti |
|---|---|
| Next.js | Framework web React yang dipakai aplikasi ini |
| React | Pustaka antarmuka (UI) |
| Zustand | Pustaka penyimpanan state (store) |
| Store / State | Tempat penyimpanan data aplikasi yang sedang berjalan |
| Framer Motion | Pustaka animasi |
| Three.js / React Three Fiber | Pustaka grafis 3D (dipakai untuk National Network) |
| Leaflet | Pustaka peta interaktif (dipakai untuk Threat Map) |
| Tile | Potongan gambar peta |
| Tailwind CSS | Framework styling berbasis kelas utilitas |
| Component | Komponen; potongan UI yang dapat dipakai ulang |
| Panel / Card | Kartu tampilan di halaman |
| Dev server | Server pengembangan (`npm run dev`) |
| Build | Proses kompilasi untuk produksi (`npm run build`) |
