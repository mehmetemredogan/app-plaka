# 🚀 Claude Code Best Practices - Detaylı Türkçe Rehberi

**Tarih:** 9 Nisan 2026  
**Seviye:** Başlangıçtan İleri Seviye  
**Dil:** Türkçe  
**Amaç:** Bu repoyu tam olarak anlamak ve kullanmak

---

## 📋 İçerik Tablosu

1. [Reponun Genel Amacı](#reponun-genel-amacı)
2. [Temel Kavramlar ve Bileşenler](#temel-kavramlar-ve-bileşenler)
3. [Klasör Yapısı ve Her Dosyanın Anlamı](#klasör-yapısı-ve-her-dosyanın-anlamı)
4. [Ana Özellikler Detaylı Açıklama](#ana-özellikler-detaylı-açıklama)
5. [Claude Code Komutları Rehberi](#claude-code-komutları-rehberi)
6. [Pratik Örnekler ve Kullanım Senaryoları](#pratik-örnekler-ve-kullanım-senaryoları)
7. [Geliştirme İş Akışları](#geliştirme-iş-akışları)
8. [İpuçları ve Numaralar](#ipuçları-ve-numaralar)
9. [Başlangıç Kılavuzu](#başlangıç-kılavuzu)

---

## 🎯 Reponun Genel Amacı

Bu repo **"Practice Makes Claude Perfect"** (Pratik Claude'u Mükemmel Yapar) sloganı ile oluşturulmuştur.

### Ana Hedefleri:
- **Claude Code** ile en iyi uygulamaları (best practices) öğretmek
- AI-destekli kod yazma araçlarının nasıl kullanılacağını göstermek
- Gerçek dünya projeleri için yapılandırılmış iş akışları sağlamak
- Şirketi kurucu **Boris Cherny** ve ekibi tarafından test edilmiş teknikleri paylaşmak

### Reponun Başlıca Özellikleri:
- ⭐ **19.7k GitHub Stars** (Çok popüler!)
- 📚 **206 Commits** (Aktif olarak güncelleniyor)
- 🎓 **Detaylı belgeler ve örnekler**
- 🔄 **Düzenli olarak yeni özelliklerle güncelleniyor**

---

## 🧠 Temel Kavramlar ve Bileşenler

Repoyu anlamak için önce bu 4 ana bileşeni anlamalısınız:

### 1️⃣ **Commands (Komutlar)** - `C` etiketi

**Ne işe yarar?**
- Sık kullandığınız prompt şablonlarını saklayan hızlı erişim komutlarıdır
- `.claude/commands/` klasöründe tanımlanır
- `/` işaretiyle çalıştırılır (örn: `/weather-orchestrator`)

**Basit Analoji:**
- Bilgisayarda `Ctrl+Z` gibi düşünün - sık kullanılan işlemler için kısayol
- Aynı yazmayı tekrar tekrar yapmak yerine, bir komut kaydedersiniz

**Gerçek Örnek:**
```
/weather-orchestrator → Hava durumu bilgisini çekip rapor oluşturan komut
/plan → Proje planlamak için standart şablon
```

---

### 2️⃣ **Agents (Ajanlar)** - `A` etiketi

**Ne işe yarar?**
- Bağımsız AI çalışanları gibi düşünebilirsiniz
- Her birinin kendi araçları, izinleri, modeli ve kimliği vardır
- **Yalıtılmış bağlam** içinde çalışırlar (diğer ajanlardan ayrı)
- `.claude/agents/` klasöründe tanımlanır

**Basit Analoji:**
- Bir şirkette her departmanın başında biri vardır
- Marketing müdürü, IT müdürü, HR müdürü... Hepsi bağımsız ama hedefe doğru
- Claude Agents da bunun gibi - her biri kendine özgü görevde uzman

**Gerçek Örnek:**
```
QA Agent → Test etmek için uzmanlaşmış ajan
Frontend Agent → UI/UX için çalışan ajan
Backend Agent → Sunucu tarafı kodu yazan ajan
```

**Avantajları:**
- Bağlam karışıklığı olmaz (her ajanın kendi belleği)
- Paralel çalışma (aynı anda birden fazla ajar çalışabilir)
- Specialized expertise (her biri kendi alanında uzman)

---

### 3️⃣ **Skills (Beceriler)** - `S` etiketi

**Ne işe yarar?**
- Yeniden kullanılabilir bilgi paketleridir
- Komutlara ve Ajanlar'a **otomatik olarak yüklenir**
- `.claude/skills/` klasöründe tanımlanır
- Dosya değil, **klasör** yapısıdır (iç yapısı var)

**Basit Analoji:**
- Rehaber gibi düşünün
- Rehaber okursanız herkes bilgiyi anlayabilir
- "Database bağlantısı nasıl yapılır?" rehberine başvurursunuz

**Klasör Yapısı:**
```
.claude/skills/database-connection/
├── SKILL.md              ← Ana bilgi (zorunlu)
├── examples/             ← Örnek kodlar
├── references/           ← Kaynak belgeler
└── scripts/              ← Yardımcı scriptler
```

**Gerçek Örnek:**
```
database-skill → Database bağlantısı kurma talimatları
testing-skill → Test yazma standartları
deployment-skill → Dağıtım sürecinin adımları
```

**Önemli:** Skills otomatik olarak "trigger" olur (gerektiğinde yüklenir)

---

### 4️⃣ **Workflows (İş Akışları)**

**Ne işe yarar?**
- Yukarıdaki 3'ünü (Command → Agent → Skill) birleştiren akışlardır
- Başlangıştan sonuna kadar bir süreci tanımlar
- `.claude/commands/` içinde tanımlanabilir

**Basit Analoji:**
- Bir pizzacı dükkânını işletmek gibi:
  1. **Command:** Müşteri siparişi alır
  2. **Agent:** Usta pizzayı yapar
  3. **Skill:** Pizza yapma kitabını kullanır
  4. **Result:** Mükemmel pizza!

**Gerçek Örnek - Hava Durumu Orkestratörü:**
```
1. Command: /weather-orchestrator → Başlatılır
2. Agent: Veri toplama ajanı → API'den veri çeker
3. Skill: Data formatting skill → Verileri biçimlendirir
4. Result: Güzel biçimlendirilmiş rapor
```

---

## 📂 Klasör Yapısı ve Her Dosyanın Anlamı

```
claude-code-best-practice/
│
├── 📁 .claude/                    ← Claude Code konfigürasyonu
│   ├── agents/                    ← Ajanları tanımla (her biri bir .md dosyası)
│   ├── commands/                  ← Komutları tanımla (her biri bir .md dosyası)
│   ├── skills/                    ← Beceri paketleri (klasörler)
│   ├── hooks/                     ← İşlemlerde tetiklenen kod
│   ├── rules/                     ← Claude için kurallar
│   ├── settings.json              ← Ana ayarlar
│   └── .mcp.json                  ← MCP sunucu bağlantıları
│
├── 📁 best-practice/              ← En iyi uygulamalar (belgeler)
│   ├── claude-subagents.md        ← Ajanlar nasıl yapılır
│   ├── claude-commands.md         ← Komutlar nasıl yapılır
│   ├── claude-skills.md           ← Beceriler nasıl yapılır
│   ├── claude-mcp.md              ← MCP nasıl bağlanır
│   ├── claude-memory.md           ← Bellek yönetimi
│   ├── claude-settings.md         ← Ayarlar
│   └── ...
│
├── 📁 implementation/              ← Gerçek uygulamalar (örnekler)
│   ├── claude-subagents-implementation.md
│   ├── claude-commands-implementation.md
│   ├── claude-skills-implementation.md
│   └── ...
│
├── 📁 orchestration-workflow/     ← İş akışı örnekleri
│   ├── orchestration-workflow.md
│   ├── orchestration-workflow.svg ← Görsel diyagram
│   └── orchestration-workflow.gif ← Nasıl çalıştığını gösteren GIF
│
├── 📁 development-workflows/      ← Farklı proje türleri için iş akışları
│   ├── superpowers/
│   ├── everything-claude-code/
│   ├── spec-kit/
│   └── ...
│
├── 📁 tips/                       ← İpuçları ve numaralar
│   ├── claude-boris-13-tips-03-jan-26.md
│   ├── claude-boris-10-tips-01-feb-26.md
│   └── ...
│
├── 📁 reports/                    ← Detaylı raporlar
│   ├── claude-agent-sdk-vs-cli-system-prompts.md
│   ├── claude-agent-command-skill.md
│   ├── llm-day-to-day-degradation.md
│   └── ...
│
├── 📁 videos/                     ← Video bağlantıları
│
├── 📁 agent-teams/                ← Paralel çalışan ajanlar
│
├── CLAUDE.md                      ← Claude için genel kurallar ve talimatlar
├── README.md                      ← Ana sayfa (gördüğümüz şey)
└── LICENSE                        ← MIT Lisansı
```

### Her Klasörün Anlamı:

| Klasör | Amacı | İçeriği |
|--------|-------|---------|
| `.claude/` | **Claude Code Yapılandırması** | Tüm Claude ayarları ve tanımları |
| `best-practice/` | **Nasıl Yapılır** | Agents/Commands/Skills oluşturmanın kuralları |
| `implementation/` | **Gerçek Örnekler** | Çalışan, test edilmiş örnekler |
| `orchestration-workflow/` | **İş Akışı Örneği** | Command→Agent→Skill örneği |
| `development-workflows/` | **Proje Türlerine Göre** | Farklı projeler için çalışan iş akışları |
| `tips/` | **Deneyim Paylaşımı** | Boris Cherny ve diğerlerinin ipuçları |
| `reports/` | **Derinlemesine Analizler** | Karşılaştırmalar ve teknik raporlar |

---

## 🔥 Ana Özellikler Detaylı Açıklama

### Feature 1: **Subagents (Alt Ajanlar)**

**Dosya:** `.claude/agents/<n>.md`

**Temel Bilgi:**
- Bağımsız AI işçileridir
- **Yalıtılmış bağlam** - kendi belleği var
- **Özel araçlar** - her ajana özel araçlar verebilirsiniz
- **Özel modeller** - bir ajan Opus, diğeri Sonnet kullanabilir
- **Kalıcı kimlik** - her ajanya bir "kişiliği" var

**Neden İhtiyaç Duyarsınız?**
- Main context'i temiz tutmak (çok bilgiyle karışıklık)
- Paralel çalışma (hızlı sonuç)
- Özelleştirilmiş davranış

**Örnek Senaryo:**

Bir e-ticaret uygulaması geliştiriyorsunuz:

```
Ana Claude'unuz:
├── Frontend Agent → Sadece UI/UX konuşuyor
├── Backend Agent → Sadece API konuşuyor
└── QA Agent → Sadece test konuşuyor

Her biri bağımsız çalışır, sonra sonuçlar birleştirilir
```

**Avantajları:**
```
✅ Bağlam karışıklığı olmaz
✅ Aynı anda 3 ajan 3 farklı şey yapabilir
✅ Her ajan kendi alanında "uzman" olur
✅ Sonuçlar daha kaliteli olur
```

---

### Feature 2: **Commands (Komutlar)**

**Dosya:** `.claude/commands/<n>.md`

**Temel Bilgi:**
- Sık kullanılan prompt şablonlarıdır
- `/komut-adı` şeklinde çalıştırılır
- **Ana context'e bilgi enjekte eder** (ajanlar gibi yalıtılmaz)
- Git'e kaydedilir (takım tamamı kullanabilir)

**Neden İhtiyaç Duyarsınız?**
- Aynı komutu her gün yazmamanız
- Takım standartları oluşturmak
- İş akışını otomatikleştirmek

**Basit Örnek:**

```markdown
# .claude/commands/explain-changes.md

# Explain These Changes

Please explain the following changes in detail:
- What was changed?
- Why was it changed?
- Does it break anything?
- How should I test it?
```

**Kullanım:**
```
claude
/explain-changes
```

**Eğer birden fazla version varsa:**
```
/explain-changes-v2
/explain-changes-detailed
```

---

### Feature 3: **Skills (Beceriler)**

**Dosya:** `.claude/skills/<skill-name>/SKILL.md`

**Temel Bilgi:**
- Yeniden kullanılabilir bilgi paketleridir
- Otomatik olarak yüklenir (trigger sistemiy)
- Komut + Agent'lerin kullanacağı rehberler
- Klasör yapısı içinde alt dosyalar olabilir

**Klasör Yapısı:**

```
.claude/skills/database-skill/
├── SKILL.md               ← Ana talimatlar
├── examples/
│   ├── connection.js
│   └── query.js
├── references/
│   └── db-schema.md
└── scripts/
    └── init-db.sh
```

**Neden İhtiyaç Duyarsınız?**
- Bilgiyi organize etmek
- "Bu nasıl yapılır?" soruları otomatik cevaplandırılır
- DRY (Don't Repeat Yourself) prensibi

**Gerçek Örnek:**

```markdown
# SKILL.md - Testing Skill

## Hangi Durumda Kullanılır?
Test yazmakta, test çalıştırmakta yardıma ihtiyacınız var

## Kurallar
1. Her test dosyası `*.test.js` ile bitmeli
2. Her testin açık bir adı olmalı
3. Mock'lar `__mocks__` klasöründe olmalı

## Örnekler
Bak `examples/basic-test.js` dosyasına
```

**Trigger Mekanizması:**
- Eğer siz "test yaz" derseniz, bu skill otomatik yüklenir
- Claude artık test yazmayı biliyor

---

### Feature 4: **Workflows (İş Akışları)**

**Dosya:** Genellikle `.claude/commands/` içinde

**Temel Bilgi:**
- Command → Agent → Skill → Result şeklinde ilerler
- Başlangıştan sonuna kadar bir süreci tanımlar

**Örnek: Hava Durumu Orkestratörü**

```
Step 1: User calls → /weather-orchestrator
        ↓
Step 2: Command triggers → weatherFetch Agent
        ↓
Step 3: Agent uses → dataFormatting Skill
        ↓
Step 4: Result → Beautiful formatted report
```

**Görsel:**
```
Input
  ↓
Command (hava durumu çek)
  ↓
Agent (veri işle)
  ↓
Skill (biçimlendir)
  ↓
Output (rapor)
```

---

### Feature 5: **MCP Servers (Model Context Protocol)**

**Dosya:** `.mcp.json` veya `.claude/settings.json`

**Temel Bilgi:**
- Dış araçlara bağlanma sistematiği
- GitHub, Slack, Jira vs'ye erişim sağlar
- Plugin benzeri çalışır

**Örnekler:**
```json
{
  "mcp": {
    "tools": ["filesystem", "github", "web_search"]
  }
}
```

---

### Feature 6: **Memory (Bellek) - CLAUDE.md**

**Dosya:** `CLAUDE.md`

**Temel Bilgi:**
- Claude Code'a talimatlar veren merkezi dosya
- Proje başlayınca otomatik yüklenir
- Maksimum 200 satır olmalı (tutarlılık için)
- Takım tamamı tarafından paylaşılır

**İçermesi Gereken Şeyler:**
```markdown
# CLAUDE.md

## Setup
- `npm install`
- `npm run dev`

## Testing
- `npm test`
- Test dosyaları `__tests__` klasöründe

## Project Rules
- Fonksiyonlar JSDoc ile belgelensin
- Error handling yapılsın
- TypeScript kullanılsın
```

**Neden Önemli?**
- Claude herhangi bir yerden başlayabilir
- Setup adımları tekrarlanmaz
- Herkesi aynı sayfada tutar

---

## 🎮 Claude Code Komutları Rehberi

Reponun kullanabileceği temel komutlar:

### 1. Başlama Komutları

```bash
# Claude Code'u başlat
claude

# Spesifik klasörde başlat
claude /path/to/project

# Plan modunda başla (düşünüp sonra yapma)
claude --plan

# Belirli model seç
claude --model=opus
```

### 2. İçer Komutlar (Session'da)

```
/plan              → Detaylı plan yap
/weather-orchestrator → Hava durumu örneği çalıştır
/clear             → Context'i temizle
/compact           → Context'i sıkıştır
/rewind            → Son adımı geri al
/rename            → Session adını değiştir
/resume            → Önceki session'ı aç
/model             → Modeli değiştir
/context           → Context kullanımını gör
/usage             → Kullanım limitini gör
```

### 3. Özel Komutlar (Bu Repoda)

```
/weather-orchestrator  → Hava durumu bilgisi çeken örnek
/explain-changes       → Değişiklikleri açıkla
/deploy                → Dağıt
```

---

## 💡 Pratik Örnekler ve Kullanım Senaryoları

### Senaryo 1: Yeni Bir Proje Başlatmak

**Adım Adım:**

1. **CLAUDE.md Hazırla**
```markdown
# CLAUDE.md
## Setup
npm install
npm run build

## Rules
- TypeScript kullanılacak
- Tests yazılacak
- Commit sık yapılacak
```

2. **Skill Oluştur (Database)**
```
.claude/skills/database/
├── SKILL.md
└── examples/
    └── connection.js
```

3. **Command Oluştur (Hızlı Start)**
```
.claude/commands/setup.md

# Quick Setup
- Install dependencies
- Initialize database
- Run migrations
- Start development server
```

4. **Agent Oluştur (QA)**
```
.claude/agents/qa-engineer.md

You are a QA expert:
- Write comprehensive tests
- Check for edge cases
- Find performance issues
```

5. **Workflow'ü Çalıştır**
```
/setup → Command
→ Setup Agent
→ Database Skill
→ Ready to code!
```

---

### Senaryo 2: Kod Review Yapmak

```
Boris'in Ipucu: "challenge Claude"

/explain-changes
(Claude kodunu inceler)

/grill-me
(Claude seni test eder)

/make-a-pr
(PR oluşturur)
```

---

### Senaryo 3: Paralel Geliştirme (Agent Teams)

```
Ana Claude:
├── Frontend Specialist Agent (UI yapıyor)
├── Backend API Agent (API'ler yapıyor)
└── Database Agent (Schema tasarlıyor)

Tamamı birbirinden habersiz çalışır
Sonuçlar birleştirilir
```

---

## 📊 Geliştirme İş Akışları (Development Workflows)

Repo 8 farklı popüler iş akışı listeler:

### 1. **Superpowers Workflow**
- TDD First (Test Driven Development)
- Iron Laws (Katı kurallar)
- ⭐ 100k stars

### 2. **Everything Claude Code**
- İnstinct Scoring (Akılcı puanlama)
- AgentShield (Güvenlik)
- 25 komut, 57 ajan, 108+ beceri

### 3. **Spec Kit (GitHub Özel)**
- Spec-driven (Spesifikasyona dayalı)
- Constitution (Anayasa sistemi)

### 4. **BMAD-METHOD**
- Tam SDLC (Yazılım Geliştirme Yaşam Döngüsü)
- Agent Personas (Ajan kişilikleri)
- 22+ platform desteği

### 5. **Ralph Wiggum Loop**
- Autonomous development (Kendi kendini yapan geliştirme)
- Long-running tasks (Uzun süreli işler)

---

## 🎯 İpuçları ve Numaralar (84 Adet!)

Repo Boris Cherny ve ekibinden **84 adet pratik ipucu** içerir:

### Prompting Tips (3)

```
1. "Bu değişiklikleri incele, başarısız olana kadar sorgula"
   → Claude seni test eder

2. Kötü bir fix'ten sonra: "Şimdi bildiklerini kullanarak, 
   ele al ve elegant çözümü yap"

3. Claude çoğu bug'ı kendi bulur - sadece "fix" de
   → Adımlarını takip etme
```

### Planning Tips (6)

```
1. ⭐ Daima plan mode'yla başla
   claude --plan

2. Minimal spec yazıp Claude'a kendi soruları sormasını söyle
3. Phase-wise gated plan (Aşamalı planlar)
4. İkinci Claude'a plan review yaptır
5. Detaylı specs yazılsın (ambiguity azalsın)
6. Prototype > PRD (30 sürümü build et, spec yazma)
```

### Agent Tips (4)

```
1. Feature-specific subagents oluştur (her özellik için bir ajan)
2. "use subagents" de → More compute atılır
3. Agent teams + tmux + git worktrees (paralel dev)
4. Test-time compute (aynı model diğer errorsı bulabilir)
```

### Command Tips (3)

```
1. Commands kullan, subagents değil (daha hızlı)
2. Her "inner loop" işi için command oluştur
3. Günde 1+ kere yapılan şey → Skill veya Command yap
```

### Skill Tips (9)

```
1. context: fork kullan (yalıtılmış skill)
2. Skill'leri subfolder'a koy (monorepos için)
3. Progressive disclosure (ek bilgiler alt klasörlerde)
4. "Gotchas" section ekle (Claude'un başarısız olduğu noktalar)
5. Skill description "ne zaman trigger olmalı?" için yazıl
6. Açık olanı yazma (başında çıkar)
7. Prescriptive instruction yazma (hedef ver, constraint ver)
8. Scripts ekle (Claude copy-paste yapabilir, rewrite değil)
9. `!`command`` kullan (dinamik shell output)
```

### Workflow Tips (15)

```
1. /loop kullan (3 güne kadar recurring tasks)
2. Ralph Wiggum plugin (long-running autonomous)
3. Wildcard permissions (tüm npm scripts erişin)
4. /sandbox (84% permission prompt azalması!)
5. Tag @claude PR'da (auto lint rules generate)
6. Product verification skills (signup-flow-driver)
7. ASCII diagrams (architecture anlamak için)
8. Status line (context awareness)
```

### Debugging Tips (7)

```
1. Stuck olunca screenshot gönder
2. MCP tools (Claude in Chrome, Playwright)
3. Background task (terminal logs izlemek için)
4. /doctor (kurulum sorunları diagnose)
5. 1M token model'e /model ile geç, sonra /compact
6. Cross-model review (Codex ile QA)
7. Agentic search > RAG (glob + grep her zaman wins)
```

---

## 🚀 Başlangıç Kılavuzu

### Step 1: Repoyu Klonla ve İnceyle

```bash
# Repoyu klonla
git clone https://github.com/shanraisshan/claude-code-best-practice.git

# Klasör yapısını explore et
cd claude-code-best-practice
ls -la

# Önemli dosyaları oku
cat CLAUDE.md
cat README.md
ls .claude/
```

### Step 2: Örnek Komutu Çalıştır

```bash
# Claude Code'u başlat
claude

# Hava durumu orkestratörünü çalıştır
/weather-orchestrator

# Çıktıyı gözlemle
# → Command başlatılır
# → Agent veri toplar
# → Skill biçimlendirir
# → Sonuç gösterilir
```

### Step 3: Kendi Projenize Uygulamak

1. **CLAUDE.md Oluştur**
   - Setup komutları
   - Project rules
   - Testing instructions

2. **İlk Skill'i Oluştur**
   ```
   .claude/skills/my-skill/
   ├── SKILL.md
   ├── examples/
   └── references/
   ```

3. **Basit Bir Command Oluştur**
   ```
   .claude/commands/my-command.md
   ```

4. **Test Et**
   ```
   claude
   /my-command
   ```

### Step 4: Detaylı Belgeleri Oku

Bu sırada oku:
1. `best-practice/claude-commands.md`
2. `best-practice/claude-agents.md`
3. `best-practice/claude-skills.md`
4. `implementation/` klasöründeki örnekler
5. `tips/` klasöründeki Boris'in ipuçları

### Step 5: Geliştirme İş Akışını Seç

- Basit proje? → Vanilla Claude Code
- Karmaşık? → Superpowers veya Everything Claude Code workflow'ü takip et

---

## 🎓 Önemli Linkler ve Kaynaklar

| Kaynak | URL |
|--------|-----|
| Official Docs | https://code.claude.com/docs |
| Official Skills | https://github.com/anthropics/skills |
| Prompt Engineering | https://github.com/anthropics/prompt-eng-interactive-tutorial |
| Boris'in X Sayfası | https://x.com/bcherny |
| Thariq'in X Sayfası | https://x.com/trq212 |

---

## 🏆 Başarı Metrikleri

Bunu yaptıktan sonra şu yetenek kazanırsınız:

✅ Claude Code'u profesyonelce kullanma  
✅ AI-assisted geliştirme iş akışlarını tasarlama  
✅ Agent'ler oluşturma ve yönetme  
✅ Takım standartlarını kod olarak tanımlama  
✅ Geliştirme hızını 3-5x artırma  
✅ Kod kalitesini artırma  
✅ Tekrarlayan işleri otomatikleştirme  

---

## 📝 Özet: 5 Dakika Versiyon

**Claude Code Best Practice Nedir?**

Bir **"nasıl yapılır kitabı"** - AI'yı kullanarak kod yazarken en iyi uygulamalar.

**4 Ana Bileşen:**
1. **Commands** (`/komut`) - Hızlı iş akışı
2. **Agents** (Bağımsız yapay çalışanlar) - Paralel geliştirme
3. **Skills** (Rehberler) - Bilgi sharing
4. **Workflows** (İş akışları) - Baştan sona süreçler

**Başlamak için:**
1. Repoyu klonla
2. `/weather-orchestrator` çalıştır
3. Kendi CLAUDE.md'ni yaz
4. Basit bir skill oluştur
5. Patterns'i kendi projene uyguła

**En Önemli Tip:**
> "Günde 1+ kere yapılan şey skill/command olmalı"  
> — Boris Cherny

---

## 🔗 Bağlantılar

- GitHub: https://github.com/shanraisshan/claude-code-best-practice
- 📺 Videolar klasöründe oynatma listeleri var
- 📊 Reports klasöründe derinlemesine analizler var
- 💬 Discussions/Issues'de canlı sorular soruluyor

---

**Son Güncelleme:** 9 Nisan 2026  
**Yapımcı:** Shanrais Shan  
**Lisans:** MIT  
**Community:** Reddit r/ClaudeCode ve r/ClaudeAI

---

## 🎉 Gratefuller & Kaynaklar

Bu rehber aşağıdaki kaynaklardan derlenmiştir:
- Official Claude Code Documentation
- Boris Cherny, Thariq, Cat Wu'nun ipuçları
- Repo'nun 206 commit'i
- 84 pratik deneyim paylaşımı
- 8 farklı geliştirme iş akışı örneği

**İyi Öğrenimler!** 🚀
